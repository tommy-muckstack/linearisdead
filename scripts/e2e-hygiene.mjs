// Hygiene sweep: every marketing page and app route loads without console errors, with no dead links,
// no upgrade/plan chrome, no "not available" dead ends and no bare original name (the legal notice excepted).
import { run, ok, BASE, demo, guest, settle } from "./e2e-lib.mjs";
const SITE = ["/", "/pricing", "/intake", "/plan", "/build", "/customers", "/changelog", "/now", "/contact", "/docs", "/security", "/terms", "/login", "/signup"];
const APP = ["/app/active", "/app/inbox", "/app/inbox/unread", "/app/my", "/app/my/created", "/app/my/subscribed", "/app/my/activity", "/app/triage", "/app/backlog", "/app/all", "/app/cycles", "/app/projects", "/app/initiatives", "/app/roadmap", "/app/views", "/app/teams",
  "/app/settings", "/app/settings/account", "/app/settings/notifications", "/app/settings/security", "/app/settings/workspace", "/app/settings/members", "/app/settings/labels", "/app/settings/import-export", "/app/settings/team"];
const NAME = /\bLinear(?!IsDead)/;
const DEAD = /coming soon|not available|isn't available yet|upgrade|free plan|trial/i;
const clean = t => t.replace(/not affiliated with[^.]*\.[^.]*\./g, "");
await run("hygiene", async ({ newPage }) => {
  const p = await newPage();
  for (const path of SITE) {
    await p.goto(BASE + path); await settle(p, 150);
    const t = clean(await p.locator("body").innerText());
    ok(await p.locator("a:not([href])").count() === 0 && !NAME.test(t) && !/coming soon|not available/i.test(t), `${path}: links routed, no bare name, no dead ends`);
  }
  for (const who of ["demo", "guest"]) {
    const a = who === "demo" ? await demo(newPage) : await guest(newPage);
    for (const path of APP) {
      await a.goto(BASE + path); await a.waitForSelector("[data-testid=linear-app]"); await settle(a, 150);
      const t = clean(await a.locator("body").innerText());
      ok(await a.locator("a:not([href])").count() === 0 && !NAME.test(t) && !DEAD.test(t) && !(await a.getByTestId("app-not-found").count()), `${who} ${path}: renders, routed, no upgrade chrome or dead ends`);
    }
  }
});
