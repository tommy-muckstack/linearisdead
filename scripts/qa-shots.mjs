// Before/after screenshots for the QA findings plus the 390px no-horizontal-scroll check.
//   TAG=before|after SHOTS=1 BASE=http://localhost:3041/linearisdead node scripts/qa-shots.mjs
import { run, ok, shot, BASE, demo } from "./e2e-lib.mjs";
process.env.SHOTS = "1";
const hasHScroll = p => p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
await run("qa shots (" + (process.env.TAG || "after") + ")", async ({ newPage }) => {
  const p = await newPage();
  await p.goto(BASE + "/"); await shot(p, "01-home");
  await p.goto(BASE + "/pricing"); await shot(p, "02-pricing");
  await p.goto(BASE + "/"); const prod = p.locator(".ln-nav nav >> text=Product").first(); await prod.hover(); await shot(p, "03-nav-product");
  const r = await p.goto(BASE + "/plan"); await shot(p, "04-plan"); console.log("  /plan →", r?.status());
  await p.goto(BASE + "/zzqx-not-a-page"); await shot(p, "05-404");
  await p.context().clearCookies(); await p.goto(BASE + "/login"); await shot(p, "06-login");
  const email = p.getByRole("button", { name: /continue with email/i }); if (await email.count()) { await email.click(); }
  const cont = p.getByRole("button", { name: /^continue/i }).last(); if (await cont.count()) { await cont.click(); } await shot(p, "07-login-email");
  const d = await demo(newPage); await shot(d, "09-app-home");
  await d.keyboard.press("c"); await shot(d, "10-create-issue"); await d.keyboard.press("Escape");
  await d.locator("[data-testid=issue-row]").first().click(); await d.getByTestId("issue-pane").waitFor(); await shot(d, "12-issue-detail");
  await d.goto(BASE + "/app/settings"); await shot(d, "14-settings");
  for (const path of ["/", "/pricing", "/login", "/app"]) {
    const m = path === "/app" ? await demo(newPage, { w: 390, h: 844 }) : await newPage({ w: 390, h: 844 });
    if (path !== "/app") await m.goto(BASE + path);
    await m.waitForTimeout(300); ok(!(await hasHScroll(m)), `390px ${path}: no horizontal scroll`);
    await shot(m, "m-" + (path.replace(/\//g, "") || "home"));
  }
});
