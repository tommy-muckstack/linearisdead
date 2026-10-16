// Shared Playwright helpers for the e2e scripts.
//   BASE=http://localhost:3041/linearisdead node scripts/e2e-<area>.mjs
// Every script fails on page errors and console errors (expected 404 probes excluded).
import fs from "node:fs";
import { chromium } from "@playwright/test";
export const BASE = process.env.BASE || "http://localhost:3041/linearisdead";
let failures = 0;
export function ok(cond, msg) { if (cond) console.log("  ✓ " + msg); else { failures++; console.log("  ✗ " + msg); } }
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36";
export async function run(name, fn) {
  const browser = await chromium.launch({ headless: process.env.HEADED !== "1" });
  const errors = [];
  const newPage = async (o = {}) => {
    const ctx = await browser.newContext({ viewport: { width: o.w ?? 1440, height: o.h ?? 900 }, userAgent: UA, permissions: ["clipboard-read", "clipboard-write"] });
    const page = await ctx.newPage();
    page.on("pageerror", e => errors.push("pageerror: " + e.message));
    page.on("console", m => { if (m.type() === "error" && !/status of (404|401|403)/.test(m.text())) errors.push(m.text()); });
    return page;
  };
  console.log(name);
  try { await fn({ browser, newPage }); } catch (e) { failures++; console.log("  ✗ threw: " + (e?.stack ?? e)); }
  ok(errors.length === 0, "no console errors" + (errors.length ? ": " + errors.slice(0, 5).join(" | ") : ""));
  await browser.close();
  console.log(failures ? `${failures} FAILED` : "all passed"); process.exit(failures ? 1 : 0);
}
/** Fresh guest session that has finished (or skipped) onboarding and lands on the issue list. */
export async function guest(newPage, o) {
  const p = await newPage(o); await p.goto(BASE + "/app");
  await p.waitForSelector("[data-testid=linear-app], [data-testid=onboarding]");
  if (await p.getByTestId("onboarding").count()) { await p.getByRole("button", { name: /skip/i }).first().click(); }
  await p.waitForSelector("[data-testid=linear-app]"); return p;
}
/** Demo account (dev / DEMO_MODE only): a seeded workspace. */
export async function demo(newPage, o) {
  const p = await newPage(o); await p.goto(BASE + "/login");
  await p.getByRole("button", { name: "Use the demo account" }).click(); await p.waitForURL(/\/app/);
  await p.waitForSelector("[data-testid=issue-row]"); return p;
}
export const settle = (p, ms = 300) => p.waitForTimeout(ms);
/** SHOTS=1 saves docs/qa/2026-10-16/<TAG|after>-<name>.jpg (small jpegs for PR bodies). */
export async function shot(p, name, o = {}) {
  if (process.env.SHOTS !== "1") return;
  fs.mkdirSync("docs/qa/2026-10-16", { recursive: true }); await p.waitForTimeout(250);
  await p.screenshot({ path: `docs/qa/2026-10-16/${process.env.TAG || "after"}-${name}.jpg`, type: "jpeg", quality: 55, ...o });
}
