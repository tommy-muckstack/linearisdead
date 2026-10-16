"use client";
// PostHog client, shared IsDead project. Requests go through our own origin (/ingest → PostHog) so ad blockers don't drop them;
// the key is the project's publishable token. No-op without NEXT_PUBLIC_POSTHOG_KEY, on localhost and under Do Not Track.
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { BP } from "@/lib/basepath";
import { EVENTS, PRODUCT, type EventName, type Props, type Surface } from "./taxonomy";
type PH = typeof import("posthog-js").default;
let ph: PH | null = null; let loading: Promise<PH | null> | null = null;
const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const surfaceOf = (path: string): Surface => (path === `${BP}/app` || path.startsWith(`${BP}/app/`) ? "app" : "landing");
function skipped() {
  if (!KEY || typeof window === "undefined") return true;
  const debug = process.env.NODE_ENV !== "production" && localStorage.getItem("ln_ph_debug") === "1"; // dev only: send from localhost + automated browsers
  if (debug) return false;
  return /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || navigator.doNotTrack === "1";
}
async function client(): Promise<PH | null> {
  if (skipped()) return null;
  if (ph) return ph;
  loading ??= import("posthog-js").then(m => {
    const p = m.default; const debug = process.env.NODE_ENV !== "production";
    p.init(KEY!, {
      api_host: `${location.origin}${BP}/ingest`, ui_host: "https://us.posthog.com",
      capture_pageview: false, capture_pageleave: true, autocapture: false, disable_session_recording: true,
      persistence: "localStorage+cookie", person_profiles: "identified_only", debug, opt_out_useragent_filter: debug,
    });
    // product/surface/platform are persisted super properties; set them here or the hub's values leak in through the shared cookie.
    p.register({ product: PRODUCT, surface: surfaceOf(location.pathname), platform: "web", env: debug ? "development" : "production" });
    ph = p; return p;
  }).catch(() => null);
  return loading;
}
/** Fire a taxonomy event. Safe anywhere on the client; never throws, never blocks. */
export function track(event: EventName, props: Props = {}) {
  void client().then(p => { try { p?.capture(event, { surface: surfaceOf(location.pathname), ...props }); } catch { /* analytics must never break the app */ } });
}
/** Link this browser to the signed-in account. Guests and the demo account stay anonymous. */
export function identify(uid: string, account: "firebase" | "guest" | "demo") {
  void client().then(p => { if (!p) return; if (account === "firebase") { if (p.get_distinct_id() !== uid) p.identify(uid); } else p.register({ account_type: account }); });
}
export function resetIdentity() { void client().then(p => p?.reset()); }
/** Mount once in the root layout: boots the client and sends a $pageview per route change. */
export function Analytics() {
  const path = usePathname();
  useEffect(() => { if (!path) return; track(EVENTS.pageview, { $current_url: location.href, surface: surfaceOf(location.pathname) }); }, [path]);
  useEffect(() => {
    const click = (e: MouseEvent) => { const el = e.target instanceof Element ? e.target.closest<HTMLElement>("[data-cta]") : null; if (el) track(EVENTS.landing_cta_clicked, { target: el.dataset.cta }); };
    document.addEventListener("click", click); return () => document.removeEventListener("click", click);
  }, []);
  return null;
}
