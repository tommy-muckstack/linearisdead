// Before/after screenshots for the QA findings plus the 390px no-horizontal-scroll check.
//   TAG=before|after BASE=http://localhost:3041/linearisdead node scripts/qa-shots.mjs
import { run, ok, shot, BASE, demo } from "./e2e-lib.mjs";
process.env.SHOTS = "1";
const hasHScroll = p => p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
await run("qa shots (" + (process.env.TAG || "after") + ")", async ({ newPage }) => {
  const p = await newPage();
  await p.goto(BASE + "/"); await p.waitForLoadState("networkidle"); await shot(p, "01-home");
  await p.goto(BASE + "/pricing"); await shot(p, "02-pricing");
  await p.goto(BASE + "/"); await p.waitForLoadState("networkidle"); await p.locator(".lns-mega button, .ln-nav nav >> text=Product").first().hover(); await shot(p, "03-nav-product");
  const r = await p.goto(BASE + "/plan"); await shot(p, "04-plan"); ok(r.status() === 200, "/plan → 200");
  await p.goto(BASE + "/zzqx/not-a-page"); await shot(p, "05-404");
  await p.context().clearCookies(); await p.goto(BASE + "/login"); await shot(p, "06-login");
  const d = await demo(newPage); await shot(d, "09-app-home");
  await d.mouse.move(1, 1); await d.keyboard.press("c"); await shot(d, "10-create-issue"); await d.keyboard.press("Escape");
  await d.locator("[data-testid=issue-row]").first().click(); await d.getByTestId("issue-pane").waitFor(); await shot(d, "12-issue-detail");
  await d.goto(BASE + "/app/settings"); await d.getByTestId("settings").waitFor(); await shot(d, "14-settings");
  // 390px: marketing, auth and the app
  const pages = ["/", "/pricing", "/plan", "/docs", "/changelog", "/login", "/signup"];
  for (const path of pages) {
    const m = await newPage({ w: 390, h: 844 }); await m.goto(BASE + path); await m.waitForTimeout(300);
    ok(!(await hasHScroll(m)), `390px ${path}: no horizontal scroll`); if (["/", "/pricing", "/login"].includes(path)) await shot(m, "m-" + (path.replace(/\//g, "") || "home"));
  }
  const m = await demo(newPage, { w: 390, h: 844 });
  for (const path of ["/app/active", "/app/inbox", "/app/my", "/app/triage", "/app/projects", "/app/initiatives", "/app/roadmap", "/app/views", "/app/cycles", "/app/settings", "/app/settings/team"]) {
    await m.goto(BASE + path); await m.waitForSelector("[data-testid=linear-app]"); await m.waitForTimeout(300);
    ok(!(await hasHScroll(m)), `390px ${path}: no horizontal scroll`); if (path === "/app/active") await shot(m, "m-app"); if (path === "/app/settings") await shot(m, "m-settings");
  }
  await m.goto(BASE + "/app/active"); await m.locator("[data-testid=issue-row]").first().click(); await m.getByTestId("issue-pane").waitFor(); await m.waitForTimeout(300);
  ok(!(await hasHScroll(m)), "390px issue pane: no horizontal scroll"); await shot(m, "m-issue");
});
