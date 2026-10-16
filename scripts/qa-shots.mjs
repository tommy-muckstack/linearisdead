import { chromium } from "@playwright/test";
const [base, out] = [process.argv[2], process.argv[3]];
const b = await chromium.launch(); const errs = [];
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
for (const [n, path, w] of [["home", "/", 1440], ["login", "/login", 1440], ["app", "/app", 1440], ["pricing390", "/pricing", 390]]) {
  const p = await ctx.newPage(); p.on("console", m => m.type() === "error" && errs.push(n + ": " + m.text())); p.on("pageerror", e => errs.push(n + ": " + e.message));
  await p.setViewportSize({ width: w, height: 900 });
  await p.goto(base + path, { waitUntil: "networkidle" }); await p.waitForTimeout(800);
  await p.screenshot({ path: `${out}/${n}.png` }); await p.close();
}
console.log(errs.join("\n") || "no console errors"); await b.close();
