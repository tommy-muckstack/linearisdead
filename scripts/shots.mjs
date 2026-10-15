// Drives the production build with the demo account: smoke-tests the keyboard flow AND captures product shots.
import fs from "node:fs"; import assert from "node:assert/strict";
import { withApp, demoPage, out } from "./shotlib.mjs";
const dir = out("linearisdead"); const pub = new URL("../public/home/", import.meta.url).pathname; fs.mkdirSync(pub, { recursive: true });
const save = async (page, name, home = true) => { await page.screenshot({ path: `${dir}/${name}.png` }); if (home) fs.copyFileSync(`${dir}/${name}.png`, `${pub}${name}.png`); };
await withApp("linearisdead", async ({ base, browser }) => {
  const { ctx, page } = await demoPage(browser, base, { w: 1440, h: 900 });
  await page.waitForSelector('[data-testid="issue-row"]');
  const rows = () => page.locator('[data-testid="issue-row"]').count(); const n0 = await rows();
  // quick create with C
  await page.keyboard.press("c"); await page.getByLabel("Issue title").fill("Ship the keyboard cheat sheet !urgent @me #docs ~2"); await page.keyboard.press("Control+Enter");
  await page.waitForFunction(n => document.querySelectorAll('[data-testid="issue-row"]').length === n + 1, n0);
  assert.ok(await page.getByText("Ship the keyboard cheat sheet").first().isVisible());
  // move focus with j/k then set status with S
  await page.mouse.move(1, 1); await page.keyboard.press("j"); await page.keyboard.press("s"); await page.getByPlaceholder("Change status…").fill("review"); await page.keyboard.press("Enter");
  await page.getByTestId("toast").waitFor(); assert.match(await page.getByTestId("toast").innerText(), /In Review/);
  await save(page, "list");
  // select two with x, bulk priority
  await page.keyboard.press("x"); await page.keyboard.press("j"); await page.keyboard.press("x"); assert.match(await page.getByTestId("bulk-bar").innerText(), /2 selected/);
  await page.keyboard.press("p"); await page.getByPlaceholder("Set priority…").fill("high"); await page.keyboard.press("Enter"); await page.keyboard.press("Escape");
  // filter
  await page.keyboard.press("/"); await page.getByLabel("Filter issues").fill("assignee:me label:bug"); await page.waitForTimeout(150);
  const filtered = await rows(); assert.ok(filtered > 0 && filtered < n0, `filter narrowed rows (${filtered} of ${n0})`); await page.getByLabel("Filter issues").fill("");
  // open issue pane, edit title, comment
  await page.locator('[data-testid="issue-row"]').first().click(); await page.getByTestId("issue-pane").waitFor();
  await page.getByLabel("Leave a comment").fill("Looks good to me"); await page.keyboard.press("Enter"); await page.getByText("Looks good to me").waitFor();
  await save(page, "issue"); await page.keyboard.press("Escape"); await page.keyboard.press("Escape"); await page.getByTestId("issue-pane").waitFor({ state: "detached" });
  // palette
  await page.keyboard.press("Control+k"); await page.getByPlaceholder("Type a command or search…").fill("go to"); await page.waitForTimeout(150); await save(page, "palette"); await page.keyboard.press("Escape");
  // board + drag
  await page.keyboard.press("v"); await page.getByTestId("board").waitFor(); await page.waitForTimeout(200);
  const card = page.locator('[data-col="todo"] [data-testid="card"]').first(); const target = page.locator('[data-col="done"]');
  const todoBefore = await page.locator('[data-col="todo"] [data-testid="card"]').count(); await card.dragTo(target);
  await page.waitForFunction(n => document.querySelectorAll('[data-col="todo"] [data-testid="card"]').length === n - 1, todoBefore);
  await save(page, "board");
  // undo restores
  await page.mouse.click(700, 880); await page.keyboard.press("Control+z"); await page.waitForFunction(n => document.querySelectorAll('[data-col="todo"] [data-testid="card"]').length === n, todoBefore);
  await page.keyboard.press("v");
  // g c → cycles, burn-up, roll over
  await page.keyboard.press("g"); await page.keyboard.press("c"); await page.getByTestId("cycles").waitFor(); await page.getByTestId("burnup").waitFor();
  assert.match(await page.getByTestId("cycle-stats").innerText(), /Scope/); await page.waitForTimeout(250); await save(page, "cycles");
  // g p → projects, create one
  await page.keyboard.press("g"); await page.keyboard.press("p"); await page.getByTestId("projects").waitFor();
  await page.getByLabel("New project name").fill("Mobile app"); await page.getByRole("button", { name: "Create project" }).click(); await page.getByText("Mobile app").first().waitFor(); await save(page, "projects", false);
  // persistence across reload
  await page.reload(); await page.getByText("Mobile app").first().waitFor();
  // mobile
  const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const mp = await m.newPage();
  await mp.goto(base + "/login"); await mp.getByRole("button", { name: "Use the demo account" }).click(); await mp.waitForURL(/\/app/); await mp.waitForSelector('[data-testid="issue-row"]'); await mp.screenshot({ path: `${dir}/mobile-app.png` });
  await mp.goto(base); await mp.screenshot({ path: `${dir}/mobile-home.png` }); await m.close();
  // marketing + login
  const hp = await ctx.newPage(); await hp.setViewportSize({ width: 1440, height: 900 }); await hp.goto(base); await hp.screenshot({ path: `${dir}/home-top.png` }); await hp.screenshot({ path: `${dir}/home-full.png`, fullPage: true });
  await ctx.clearCookies(); await hp.goto(base + "/login"); await hp.screenshot({ path: `${dir}/login.png` });
  console.log("linearisdead smoke OK");
});
