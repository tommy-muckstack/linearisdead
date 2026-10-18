"use client";
// PostHog client, shared IsDead project 666931. Requests go through our own origin (<basePath>/ingest → PostHog) so ad
// blockers don't drop them; the key is the project's publishable token. No-op without NEXT_PUBLIC_POSTHOG_KEY, on localhost
// and under Do Not Track (dev only: localStorage isdead_ph_debug=1 sends from localhost and automated browsers).
import { useEffect, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { BP } from "@/lib/basepath";
import { EVENTS, LEGACY_PROPS, superProps, type EventName, type Props, type Surface } from "./taxonomy";
type PH = typeof import("posthog-js").default;
let ph: PH | null = null; let loading: Promise<PH | null> | null = null;
const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const UI_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.posthog.com";
export const analyticsEnabled = !!KEY;
const surfaceOf = (path: string): Surface => (path === `${BP}/app` || path.startsWith(`${BP}/app/`) ? "app" : "landing");
const debugOn = () => { try { return process.env.NODE_ENV !== "production" && localStorage.getItem("isdead_ph_debug") === "1"; } catch { return false; } };
function skipped() {
  if (!KEY || typeof window === "undefined") return true;
  if (debugOn()) return false;
  return /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || navigator.doNotTrack === "1";
}
// Privacy: URL-like properties (any key ending in url/referrer/pathname, also inside $set/$set_once) keep only origin + path (query strings and hashes can hold user content such as filters or
// callback URLs) and the page title is dropped. Path ids (/app/issue/<id>, /app/project/<id>, /app/view/<id>) are random
// local ids that reveal nothing, so PRIVATE_PATHS is empty; workspace URL slugs (/<urlKey>) redirect server-side before any page loads.
const PRIVATE_PATHS: RegExp[] = [];
const URL_KEY = /(url|referrer|pathname)$/i;
const cleanUrl = (v: unknown) => { if (typeof v !== "string" || !v || v === "$direct") return v; let u = v.split(/[?#]/)[0]!; for (const re of PRIVATE_PATHS) u = u.replace(re, "$1:id"); return u; };
const cleanBag = (bag: unknown) => { if (!bag || typeof bag !== "object") return; const o = bag as Record<string, unknown>; for (const k of Object.keys(o)) if (URL_KEY.test(k)) o[k] = cleanUrl(o[k]); };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function scrub(e: any) { if (!e) return e; for (const bag of [e.properties, e.$set, e.$set_once, e.properties?.$set, e.properties?.$set_once]) cleanBag(bag); if (e.properties) delete e.properties.title; return e; }

async function client(): Promise<PH | null> {
  if (skipped()) return null;
  if (ph) return ph;
  loading ??= import("posthog-js").then(m => {
    const p = m.default; const debug = debugOn();
    p.init(KEY!, {
      api_host: `${location.origin}${BP}/ingest`, ui_host: UI_HOST,
      capture_pageview: false, capture_pageleave: true, autocapture: false, disable_session_recording: true, capture_heatmaps: false, capture_performance: false, capture_dead_clicks: false, capture_exceptions: false, disable_surveys: true, before_send: scrub,
      persistence: "localStorage+cookie", person_profiles: "always", debug, opt_out_useragent_filter: debug,
    });
    // Every IsDead app shares the yourappisdead.com cookie and super properties persist in it: clear other apps'
    // leftovers, then set ours (otherwise the hub's product=yourappisdead would ride along on this app's events).
    for (const k of LEGACY_PROPS) p.unregister(k);
    p.register({ ...superProps(surfaceOf(location.pathname)), env: process.env.NODE_ENV === "production" ? "production" : "development" });
    ph = p; if (process.env.NODE_ENV !== "production") (window as unknown as { __posthog?: PH }).__posthog = p;
    return p;
  }).catch(() => null);
  return loading;
}
/** Fire a taxonomy event. Safe anywhere on the client; never throws, never blocks. */
export function track(event: EventName, props: Props = {}) {
  void client().then(p => { try { p?.capture(event, { surface: surfaceOf(location.pathname), ...props }); } catch { /* analytics must never break the app */ } });
}
/** Like track, but sent immediately; await it before navigating away (sign-in redirects). Never throws or hangs past 1.5s. */
export async function trackNow(event: EventName, props: Props = {}) {
  await Promise.race([client().then(p => { p?.capture(event, { surface: surfaceOf(location.pathname), ...props }, { send_instantly: true }); }).catch(() => {}), new Promise(r => setTimeout(r, 1500))]);
}
/** Link this browser to the signed-in account (Firebase uid). Guests and the demo account stay anonymous. */
export function identify(uid: string, account: "firebase" | "guest" | "demo") {
  void client().then(p => { if (!p) return; p.register({ account_type: account }); if (account === "firebase" && p.get_distinct_id() !== uid) p.identify(uid, { account_type: account }); });
}
/** reset() wipes super properties too, so put this app's back straight away. */
export function resetIdentity() { void client().then(p => { if (!p) return; p.reset(); p.register({ ...superProps(surfaceOf(location.pathname)), env: process.env.NODE_ENV === "production" ? "production" : "development" }); }); }
/** onSubmit for the sign-out forms: sends app_signed_out, resets the identity, then lets the form post. */
export function signOutSubmit(e: FormEvent<HTMLFormElement>) {
  const form = e.currentTarget; if (!analyticsEnabled || skipped()) return; e.preventDefault();
  void trackNow(EVENTS.app_signed_out).then(() => { resetIdentity(); form.submit(); });
}
/** Mount once in the root layout: boots the client, sends a $pageview per route change and landing_cta_clicked for [data-cta]. */
export function Analytics() {
  const path = usePathname();
  useEffect(() => { if (!path) return; void client().then(p => { if (!p) return; p.register({ surface: surfaceOf(location.pathname) }); p.capture(EVENTS.pageview, { $current_url: location.href }); }); }, [path]);
  useEffect(() => {
    const click = (e: MouseEvent) => { const el = e.target instanceof Element ? e.target.closest<HTMLElement>("[data-cta]") : null; if (el?.dataset.cta) track(EVENTS.landing_cta_clicked, { target: el.dataset.cta }); };
    document.addEventListener("click", click); return () => document.removeEventListener("click", click);
  }, []);
  return null;
}
