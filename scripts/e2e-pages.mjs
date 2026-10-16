// Marketing feature pages, 404 / workspace-slug behaviour and pricing copy (findings 3, 15, 16).
import { run, ok, BASE, shot } from "./e2e-lib.mjs";
const PAGES = ["/intake", "/plan", "/build", "/customers", "/changelog", "/now", "/contact", "/docs", "/security", "/terms"];
const NAME = /\bLinear(?!IsDead)/; // the original's name may only appear in the not-affiliated notice
await run("pages", async ({ newPage }) => {
  const p = await newPage();
  for (const path of PAGES) {
    const r = await p.goto(BASE + path); ok(r.status() === 200, `${path} → 200`);
    ok(await p.locator("h1").first().isVisible(), `${path} has a heading`);
    const text = (await p.locator("main").innerText()).replace(/not affiliated with[^.]*\.[^.]*\./g, "");
    ok(!NAME.test(text), `${path}: no bare "Linear" in page copy`);
    const hrefs = await p.locator("main a[href^='/']").evaluateAll(as => as.map(a => a.getAttribute("href")));
    for (const h of [...new Set(hrefs)].filter(h => !h.includes("#") || h.split("#")[0])) {
      const res = await p.request.get(new URL(BASE).origin + h.split("#")[0], { maxRedirects: 0 });
      ok(res.status() < 400, `${path}: link ${h} → ${res.status()}`);
    }
  }
  await p.goto(BASE + "/plan"); await shot(p, "04-plan");
  await p.goto(BASE + "/changelog"); await shot(p, "04-changelog");
  // workspace slug → login (signed out); deeper unknown path → branded 404
  await p.goto(BASE + "/some-workspace"); ok(/\/login\?callbackUrl=%2Fapp$/.test(p.url()), "unknown slug while signed out → login: " + p.url());
  const r = await p.goto(BASE + "/some/deep/path"); ok(r.status() === 404, "deep unknown path → 404");
  ok(await p.getByTestId("not-found").isVisible(), "404 is branded (nav, message, ways out)");
  ok(await p.getByTestId("not-found").getByRole("link", { name: "Open the app" }).isVisible(), "404 offers the app"); await shot(p, "05-404");
  await p.goto(BASE + "/app"); await p.waitForSelector("[data-testid=linear-app], [data-testid=onboarding]");
  await p.goto(BASE + "/another-workspace"); ok(/\/app$/.test(p.url()), "unknown slug with a session → the app");
  // pricing copy
  await p.goto(BASE + "/pricing"); const t = (await p.locator(".mp-desk").innerText()).replace(/not affiliated with[^.]*\.[^.]*\./g, "");
  ok(t.includes("Zendesk and Intercom integrations"), "pricing: Zendesk and Intercom integrations");
  ok(t.includes("Account management") && t.includes("Migration & onboarding support"), "pricing: Enterprise list matches");
  ok(!/Trusted by|40,000/.test(t), "pricing: no borrowed customer claims");
  ok(!NAME.test(t), "pricing: no bare Linear name");
  ok((await p.getByTestId("free-note").innerText()).includes("no paid plans"), "pricing says LinearIsDead has no paid plans");
  await shot(p, "02-pricing");
  const m = await newPage({ w: 390, h: 844 }); await m.goto(BASE + "/pricing"); const mt = (await m.locator(".mp").innerText()).replace(/not affiliated with[^.]*\.[^.]*\./g, "");
  ok(!NAME.test(mt) && !/Trusted by|40,000/.test(mt), "390 pricing: no bare Linear, no borrowed claims");
  ok(await m.locator(".ln-pm-foot [data-testid=site-foot]").isVisible(), "390 pricing uses the routed footer");
});
