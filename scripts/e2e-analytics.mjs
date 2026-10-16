// Checks PostHog wiring end to end through the /ingest proxy: $pageview on the landing page, a CTA click, then app events.
// Needs NEXT_PUBLIC_POSTHOG_KEY in the dev server's env. Uses the dev-only ln_ph_debug flag so localhost + headless Chrome send.
import { chromium } from "@playwright/test";
const BASE = process.env.BASE || "http://localhost:3023/linearisdead";
const b = await chromium.launch(); const ctx = await b.newContext(); const p = await ctx.newPage();
const sent = []; const errs = [];
// Bodies are gzipped, so read event names from posthog-js debug logging and require that /ingest/e/ POSTs succeed.
let posts = 0;
p.on("console", m => { const x = m.text().match(/^\[PostHog\.js\] send "([^"]+)"/); if (x) sent.push(x[1]); });
p.on("requestfinished", r => { if (r.url().includes("/ingest/e/") && r.method() === "POST") posts++; });
p.on("response", r => { if (r.url().includes("/ingest/") && r.status() >= 400) errs.push(`${r.status()} ${r.url()}`); });
p.on("pageerror", e => errs.push(e.message));
await p.goto(BASE + "/"); await p.evaluate(() => localStorage.setItem("ln_ph_debug", "1")); await p.reload({ waitUntil: "networkidle" });
await p.click("[data-cta=nav_signup]"); await p.waitForURL(/login/);
await p.goto(BASE + "/app", { waitUntil: "networkidle" }); await p.waitForTimeout(800);
await p.keyboard.press("c"); await p.keyboard.type("Analytics smoke issue"); await p.keyboard.press("Enter"); await p.waitForTimeout(500);
await p.keyboard.press("Meta+k"); await p.waitForTimeout(3000);
await b.close();
const want = ["$pageview", "landing_cta_clicked", "app_issue_created", "app_command_menu_opened"];
const missing = want.filter(e => !sent.includes(e));
console.log("sent:", [...new Set(sent)].join(", ")); if (errs.length) console.log("errors:", errs.join("\n"));
if (!posts) errs.push("no /ingest/e/ POST completed");
if (missing.length || errs.length) { console.log("FAIL missing:", missing.join(", ")); process.exit(1); } else console.log("PASS");
