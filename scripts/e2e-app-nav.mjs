// Sidebar pages (Inbox, My issues tabs, Triage, Teams, Initiatives, Roadmap), in-app 404 and onboarding (findings 5, 7).
import { run, ok, BASE, demo, settle, shot } from "./e2e-lib.mjs";
const nav = (p, label) => p.locator("nav.lin-nav a", { hasText: new RegExp("^" + label) }).first();
await run("app navigation", async ({ newPage }) => {
  // ---- onboarding (fresh guest) ----
  const g = await newPage(); await g.goto(BASE + "/app"); await g.getByTestId("onboarding").waitFor();
  ok(await g.getByRole("heading", { name: "Create a new workspace" }).isVisible(), "new visitor lands on workspace creation");
  await g.getByTestId("onb-continue").click(); ok((await g.locator(".lin-onb__err").innerText()).includes("name"), "empty workspace name is refused inline");
  await g.getByLabel("Workspace name").fill("Acme Labs"); ok(await g.getByLabel("Workspace URL").inputValue() === "acme-labs", "URL follows the name");
  await shot(g, "07-onboarding");
  await g.getByTestId("onb-continue").click(); await g.getByLabel("Team name").fill("Platform"); ok(await g.getByLabel("Identifier").inputValue() === "PLA", "identifier follows the team name");
  await g.getByTestId("onb-continue").click(); await g.getByLabel("Name or email").fill("teammate@example.com"); await g.getByRole("button", { name: "Add", exact: true }).click();
  ok((await g.getByTestId("onb-people").innerText()).includes("teammate@example.com"), "teammate added");
  await g.getByTestId("onb-continue").click(); await g.getByText("Empty workspace").click(); await g.getByTestId("onb-continue").click();
  await g.getByTestId("linear-app").waitFor(); ok(await g.locator(".lin-nav__team").innerText() === "Platform", "workspace opens with the new team");
  await g.keyboard.press("c"); await g.getByLabel("Issue title").fill("First issue"); await g.keyboard.press("Control+Enter"); await settle(g);
  ok(await g.locator("[data-ident=PLA-1]").count() === 1, "issues use the chosen identifier (PLA-1)");
  await g.goto(BASE + "/acme-labs"); await g.waitForURL(/\/app$/); ok(/\/app$/.test(g.url()), "workspace URL opens the workspace");
  await g.reload(); await g.getByTestId("linear-app").waitFor(); ok(!(await g.getByTestId("onboarding").count()), "onboarding only runs once");

  // ---- sidebar pages (demo workspace) ----
  const p = await demo(newPage);
  for (const l of ["Inbox", "My issues", "Initiatives", "Projects", "Roadmap", "Teams", "Triage", "Active", "Backlog", "All issues", "Cycles"]) ok(await nav(p, l).isVisible(), `sidebar: ${l}`);
  await shot(p, "09-app-home");
  // inbox
  await nav(p, "Inbox").click(); await p.getByTestId("inbox").waitFor();
  const notes = p.getByTestId("notification"); ok(await notes.count() > 0, "inbox lists teammates' activity on my issues");
  ok((await notes.first().innerText()).match(/Design lead|Backend engineer|Mobile engineer/), "notifications name the teammate role");
  const unread0 = await p.locator(".lin-note.unread").count(); await notes.first().locator(".lin-note__main").click(); await p.getByTestId("issue-pane").waitFor();
  ok(await p.locator(".lin-note.unread").count() === unread0 - 1, "opening a notification marks it read and opens the issue");
  await shot(p, "05-inbox");
  await p.keyboard.press("Escape"); await p.getByRole("button", { name: "Mark all as read" }).click(); ok(await p.locator(".lin-note.unread").count() === 0, "Mark all as read");
  await p.getByRole("tab", { name: /Unread/ }).click(); await p.waitForURL(/inbox\/unread$/); ok(await p.getByText("You're all caught up").isVisible(), "Unread tab is empty after marking all read");
  // my issues tabs
  await nav(p, "My issues").click(); await p.getByTestId("my-tabs").waitFor();
  for (const t of ["Created", "Subscribed"]) { await p.getByRole("tab", { name: t }).click(); await p.waitForURL(new RegExp("/my/" + t.toLowerCase() + "$")); await p.waitForSelector("[data-testid=issue-row]"); ok(await p.locator("[data-testid=issue-row]").count() > 0, `My issues › ${t} lists issues`); }
  await p.getByRole("tab", { name: "Activity" }).click(); await p.getByTestId("my-activity").waitFor(); ok(await p.locator("[data-testid=my-activity] li").count() > 0, "My issues › Activity lists my changes");
  // triage
  await nav(p, "Triage").click(); await p.getByTestId("triage").waitFor();
  const n0 = await p.locator("[data-testid=triage] [data-testid=issue-row]").count(); ok(n0 === 2, "triage holds the 2 incoming issues");
  await shot(p, "05-triage");
  await p.locator("[data-testid=triage] [data-testid=issue-row]").first().hover(); await p.keyboard.press("1"); await settle(p);
  ok((await p.getByTestId("toast").innerText()).includes("Accepted"), "1 accepts the focused issue");
  await p.locator("[data-testid=triage] [data-testid=issue-row]").first().hover(); await p.keyboard.press("3"); await p.getByPlaceholder("Duplicate of…").fill("invoice"); await p.keyboard.press("Enter"); await settle(p);
  ok(await p.locator("[data-testid=triage] [data-testid=issue-row]").count() === 0, "3 marks a duplicate (triage now empty)");
  await nav(p, "All issues").click(); await settle(p);
  const inTodo = await p.locator("[data-group=todo] [data-testid=issue-row]").filter({ hasText: /Export button missing|Crash when pasting/ }).count();
  const inCanceled = await p.locator("[data-group=canceled] [data-testid=issue-row]").filter({ hasText: /Export button missing|Crash when pasting/ }).count();
  ok(inTodo === 1 && inCanceled === 1, `accepted issue joins Todo, the duplicate is canceled (${inTodo}/${inCanceled})`);
  // teams, initiatives, roadmap
  await nav(p, "Teams").click(); await p.getByTestId("teams").waitFor(); ok((await p.getByTestId("teams").innerText()).includes("ENG"), "Teams lists the team and identifier");
  await nav(p, "Initiatives").click(); await p.getByTestId("initiatives").waitFor(); ok(await p.getByTestId("initiative").count() === 1, "seeded initiative");
  await p.getByLabel("New initiative name").fill("Reliability"); await p.getByRole("button", { name: "Create initiative" }).click();
  const ini = p.getByTestId("initiative").filter({ hasText: "Reliability" }); await ini.getByLabel("Add project to Reliability").selectOption({ label: "Billing v2" });
  await ini.getByLabel("Status of Reliability").selectOption("active");
  ok((await ini.innerText()).includes("Billing v2") && (await ini.innerText()).includes("1 project"), "initiative: create, add project, set status");
  await shot(p, "05-initiatives");
  await nav(p, "Roadmap").click(); await p.getByTestId("roadmap").waitFor(); ok(await p.getByTestId("roadmap-row").count() === 2, "roadmap shows both dated projects");
  await shot(p, "05-roadmap");
  // unknown in-app routes
  await p.goto(BASE + "/app/nope"); await p.getByTestId("app-not-found").waitFor(); ok(true, "/app/nope → in-app not found (no silent fallback to the issue list)");
  await p.goto(BASE + "/app/my/whatever"); ok(await p.getByTestId("app-not-found").isVisible(), "/app/my/whatever → not found");
  await p.goto(BASE + "/app/triage"); ok(await p.getByTestId("triage").isVisible(), "/app/triage renders Triage");
});
