// Display options (ordering, grouping, sub-grouping, toggles, properties) and saved views (findings 18, 5).
import { run, ok, BASE, demo, settle, shot } from "./e2e-lib.mjs";
const open = async p => { if (!(await p.getByRole("dialog", { name: "Display options" }).count())) await p.getByTestId("display-btn").click(); return p.getByRole("dialog", { name: "Display options" }); };
const titles = p => p.locator("[data-testid=issue-row] .lin-row__title").allInnerTexts();
await run("display + views", async ({ newPage }) => {
  const p = await demo(newPage); await p.goto(BASE + "/app/all"); await p.waitForSelector("[data-testid=issue-row]");
  let d = await open(p);
  for (const l of ["Grouping", "Sub-grouping", "Ordering", "Show sub-issues", "Show empty groups"]) ok(await d.getByLabel(l, { exact: true }).isVisible(), `display menu: ${l}`);
  ok(await d.getByRole("button", { name: "Board" }).isVisible() && await d.locator(".lin-dm__props button").count() >= 10, "display menu: layout + display properties");
  await shot(p, "18-display-menu");
  // grouping by label, sub-grouping by priority
  await d.getByLabel("Grouping", { exact: true }).selectOption("label"); await settle(p);
  ok(await p.locator("[data-group='l:Feature']").count() === 1, "group by label");
  await d.getByLabel("Sub-grouping").selectOption("priority"); await settle(p);
  ok(await p.locator("[data-group='l:Feature'] [data-subgroup]").count() > 0, "sub-groups render inside groups");
  await d.getByLabel("Sub-grouping").selectOption("none"); await d.getByLabel("Grouping", { exact: true }).selectOption("none"); await settle(p);
  // ordering
  await d.getByLabel("Ordering").selectOption("created"); await settle(p);
  const created = await p.locator("[data-testid=issue-row] .lin-row__date[title=Created]").evaluateAll(es => es.map(e => +new Date(e.textContent + " 2026")));
  ok(created.length > 5 && created.every((n, i, a) => i === 0 || a[i - 1] >= n), "order by last created (newest first)");
  await d.getByLabel("Ordering").selectOption("due"); await settle(p);
  const first = (await titles(p))[0]; ok(/Sign-up form drops/.test(first), "order by due date puts the earliest due first: " + first);
  // toggles
  const withSubs = await p.locator("[data-testid=issue-row]").count(); await d.getByLabel("Show sub-issues").uncheck(); await settle(p);
  ok(await p.locator("[data-testid=issue-row]").count() < withSubs, "hiding sub-issues removes them from the list"); await d.getByLabel("Show sub-issues").check();
  await d.getByLabel("Grouping", { exact: true }).selectOption("status"); await p.keyboard.press("Escape"); await p.getByLabel("Filter issues").fill("priority:urgent"); d = await open(p);
  ok(await p.locator(".lin-group__empty").count() === 0, "empty groups hidden by default"); await d.getByLabel("Show empty groups").check(); await settle(p);
  ok(await p.locator(".lin-group__empty").count() > 0, "show empty groups keeps groups with no issues"); await p.keyboard.press("Escape"); await p.getByLabel("Filter issues").fill(""); d = await open(p);
  // display properties
  ok(await p.locator("[data-testid=issue-row] .lin-row__id").count() > 0, "ID shown by default");
  await d.getByRole("button", { name: "ID", exact: true }).click(); await d.getByRole("button", { name: "Updated" }).click(); await settle(p);
  ok(await p.locator("[data-testid=issue-row] .lin-row__id").count() === 0, "hiding the ID property removes it from rows");
  ok(await p.locator("[data-testid=issue-row] [data-prop=updated]").count() > 0, "showing Updated adds it to rows");
  await p.keyboard.press("Escape"); ok(!(await p.getByRole("dialog", { name: "Display options" }).count()), "Escape closes the display menu");
  await p.reload(); await p.waitForSelector("[data-testid=issue-row]"); ok(await p.locator("[data-testid=issue-row] .lin-row__id").count() === 0, "display options persist");
  d = await open(p); await d.getByRole("button", { name: "ID", exact: true }).click(); await d.getByLabel("Show empty groups").uncheck(); await p.keyboard.press("Escape");
  // save a view from a filter
  await p.getByLabel("Filter issues").fill("label:bug is:open"); await p.getByTestId("save-view").click();
  await p.getByLabel("View name").fill("Open bugs"); await p.getByRole("dialog", { name: "Save view" }).getByRole("button", { name: "Save view" }).click(); await p.waitForURL(/\/app\/view\//);
  await p.getByRole("heading", { name: "Open bugs" }).waitFor(); await p.waitForSelector("[data-testid=issue-row]"); ok(true, "saved view opens under its name");
  const n = await p.locator("[data-testid=issue-row]").count(); ok(n > 0 && (await p.locator("[data-testid=issue-row]").allInnerTexts()).every(t => /Bug/.test(t)), `view applies its filter (${n} bugs)`);
  d = await open(p); await d.getByLabel("Grouping", { exact: true }).selectOption("priority"); await settle(p); ok(await p.locator("[data-group='1']").count() === 1, "view display: group by priority"); await p.keyboard.press("Escape");
  await shot(p, "18-saved-view");
  // views page, favorite, sidebar
  await p.locator("nav.lin-nav a", { hasText: /^Views/ }).click(); await p.getByTestId("views").waitFor();
  ok(await p.getByTestId("view-row").count() === 1, "Views page lists the saved view");
  await p.getByRole("button", { name: "Add Open bugs to favorites" }).click();
  ok(await p.locator("nav.lin-nav a", { hasText: "Open bugs" }).isVisible(), "favorited view appears in the sidebar");
  await p.getByLabel("New view name").fill("Urgent"); await p.getByLabel("New view filter").fill("priority:urgent"); await p.getByRole("button", { name: "New view" }).click(); await p.waitForURL(/\/app\/view\//);
  ok((await p.getByTestId("view-filter").innerText()).includes("priority:urgent"), "New view from the Views page");
  await p.locator("nav.lin-nav a", { hasText: "Open bugs" }).click(); await p.waitForSelector("[data-testid=issue-row]"); await settle(p);
  ok(await p.locator("[data-group='1'], [data-group='2'], [data-group='3']").count() > 0, "the view keeps its own display options (grouped by priority)");
  await p.goto(BASE + "/app/all"); await p.waitForSelector("[data-testid=issue-row]"); ok(await p.locator("[data-group=todo]").count() === 1, "other lists keep the general display options (status)");
  await p.goto(BASE + "/app/views"); await p.getByRole("button", { name: "Delete view Urgent" }).click(); ok(await p.getByTestId("view-row").count() === 1, "delete a view");
  await p.goto(BASE + "/app/view/missing"); await p.waitForSelector("[data-testid=linear-app]"); await settle(p); ok(await p.getByTestId("app-not-found").isVisible(), "unknown view → not found");
  // board via display menu, V still toggles
  await p.goto(BASE + "/app/active"); await p.waitForSelector("[data-testid=issue-row]"); d = await open(p); await d.getByRole("button", { name: "Board" }).click(); await p.getByTestId("board").waitFor();
  ok(await d.getByLabel("Grouping", { exact: true }).isDisabled(), "board fixes grouping to status columns"); await p.keyboard.press("Escape"); await p.mouse.move(1, 1); await p.keyboard.press("v"); await p.getByTestId("issue-list").waitFor(); ok(true, "V toggles back to list");
});
