// Marketing nav, mega-menus, footer links, layout and hero mock (findings 1, 2, 14, 17).
import { run, ok, BASE, shot } from "./e2e-lib.mjs";
const NAME = /\bLinear(?!IsDead)/;
const visible = (p, text) => p.locator(".lns-panel").getByText(text, { exact: true }).isVisible();
await run("marketing", async ({ newPage }) => {
  const p = await newPage();
  await p.goto(BASE + "/"); await p.waitForLoadState("networkidle");
  // mega-menus open on hover, close on leave; keyboard opens them too
  await p.locator(".lns-mega button", { hasText: "Product" }).hover(); await p.waitForTimeout(150);
  ok(await visible(p, "Intake") && await visible(p, "Plan") && await visible(p, "Build"), "Product mega-menu opens on hover");
  await shot(p, "03-nav-product");
  await p.mouse.move(700, 600); await p.waitForTimeout(400); ok(!(await p.locator(".lns-panel").count()), "menu closes when the pointer leaves");
  await p.locator(".lns-mega button", { hasText: "Resources" }).focus(); await p.waitForTimeout(100);
  ok(await visible(p, "Documentation") && await visible(p, "Changelog"), "Resources menu opens on keyboard focus");
  await p.keyboard.press("Escape"); ok(!(await p.locator(".lns-panel").count()), "Escape closes the menu");
  await p.locator(".lns-mega button", { hasText: "Product" }).hover(); await p.locator(".lns-panel").getByText("Intake", { exact: true }).click(); await p.waitForURL(/\/intake$/);
  ok(p.url().endsWith("/intake"), "clicking a menu item navigates");
  for (const [label, path] of [["Customers", "/customers"], ["Pricing", "/pricing"], ["Now", "/now"], ["Contact", "/contact"]]) {
    await p.goto(BASE + "/"); await p.waitForLoadState("networkidle"); await p.locator(".lns-links > a", { hasText: label }).click(); await p.waitForURL(new RegExp(path + "$")); ok(p.url().endsWith(path), `nav ${label} → ${path}`);
  }
  // grey nav links, centered container
  await p.goto(BASE + "/");
  ok(await p.locator(".lns-links > a").first().evaluate(a => getComputedStyle(a).color) === "rgb(138, 143, 152)", "nav links are grey, not link-blue");
  const wide = await newPage({ w: 1920, h: 1000 }); await wide.goto(BASE + "/");
  const left = await wide.locator(".ln-page").evaluate(e => e.getBoundingClientRect().left); ok(Math.abs(left - 240) < 2, `page is centered at 1920px (left ${left})`);
  // hero mock
  const hero = await p.locator(".frame").innerText();
  ok(hero.includes("1 / 84"), "hero pager reads 1 / 84");
  ok(!/Karri|jon\b|Jori|Opus/i.test(hero), "hero mock has no real people's names or model names");
  ok(!(await p.locator(".app .rv").count()), "overlapping Reviews/Revert block is gone");
  ok(await p.locator(".hdr .tools svg").count() >= 4, "hero toolbar icons present");
  await shot(p, "01-home");
  // no dead links anywhere on home / pricing; every internal link resolves; no bare original name
  for (const path of ["/", "/pricing"]) {
    await p.goto(BASE + path);
    ok(await p.locator("a:not([href])").count() === 0, `${path}: no <a> without href`);
    const hrefs = [...new Set(await p.locator("a[href]").evaluateAll(as => as.filter(a => a.offsetParent || a.closest(".mp-desk")).map(a => a.getAttribute("href"))))];
    let bad = [];
    for (const h of hrefs) {
      if (/^https?:/.test(h)) { if (!/^https:\/\/(github\.com\/tommy-muckstack\/linearisdead|yourappisdead\.com)/.test(h)) bad.push(h); continue; }
      const r = await p.request.get(new URL(BASE).origin + h.split("#")[0], { maxRedirects: 0 }); if (r.status() >= 400) bad.push(h + " " + r.status());
    }
    ok(!bad.length, `${path}: all ${hrefs.length} links resolve` + (bad.length ? ": " + bad.join(", ") : ""));
    const txt = (await p.locator("body").innerText()).replace(/not affiliated with[^.]*\.[^.]*\./g, "");
    ok(!NAME.test(txt), `${path}: no bare "Linear" in copy`);
    ok(!/40,000|Gabriel|Koblov|OpenAI|Coinbase/.test(txt), `${path}: no borrowed customers, quotes or logos`);
  }
  const footLinks = await p.locator("[data-testid=site-foot] a").count(); ok(footLinks >= 25, `footer has ${footLinks} routed links`);
  // 390: menu sheet
  const m = await newPage({ w: 390, h: 844 }); await m.goto(BASE + "/"); await m.waitForLoadState("networkidle");
  await m.getByRole("button", { name: "Menu" }).click(); ok(await m.getByRole("dialog", { name: "Menu" }).isVisible(), "390: menu button opens the sheet");
  await m.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: "Plan" }).click(); await m.waitForURL(/\/plan$/); ok(m.url().endsWith("/plan"), "390: sheet links navigate");
  ok(!(await m.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)), "390 /plan: no horizontal scroll");
});
