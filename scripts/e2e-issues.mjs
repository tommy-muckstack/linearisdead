// Issue fields in the create modal and detail pane, sub-issues and the activity log (findings 12, 13).
import { run, ok, demo, settle, shot } from "./e2e-lib.mjs";
await run("issues", async ({ newPage }) => {
  const p = await demo(newPage);
  await p.mouse.move(1, 1); await p.keyboard.press("c");
  const modal = p.getByRole("dialog", { name: "New issue" });
  await p.getByLabel("Issue title").fill("Cold start takes four seconds");
  await modal.getByTestId("create-labels").click();
  await p.getByRole("option", { name: "Bug" }).getByRole("checkbox").check();
  await p.getByLabel("Find or create a label").fill("Performance"); await p.keyboard.press("Enter");
  ok((await modal.getByTestId("create-labels").innerText()) === "Bug, Performance", "labels picker: existing + newly created label");
  await p.getByLabel("Find or create a label").press("Escape");
  ok(await modal.isVisible(), "Escape in the label picker closes only the picker");
  await modal.getByLabel("Estimate").selectOption("3");
  await modal.getByLabel("Due date").fill("2026-11-20");
  await shot(p, "10-create-issue");
  await p.getByTestId("create-submit").click(); await modal.waitFor({ state: "detached" });
  const row = p.locator("[data-testid=issue-row]", { hasText: "Cold start takes four seconds" });
  ok(await row.isVisible(), "issue created");
  ok((await row.innerText()).includes("Nov 20"), "row shows the due date");
  await row.click(); const pane = p.getByTestId("issue-pane"); await pane.waitFor();
  ok((await pane.getByTestId("prop-labels").innerText()).includes("Performance"), "pane: labels saved");
  ok((await pane.getByTestId("prop-estimate").innerText()).includes("3 points"), "pane: estimate saved");
  ok((await pane.getByTestId("prop-due").innerText()).includes("Nov 20"), "pane: due date saved");
  // change status, priority and assignee from the keyboard; each lands in Activity
  await p.keyboard.press("s"); await p.getByPlaceholder("Change status…").fill("review"); await p.keyboard.press("Enter"); await settle(p);
  await p.keyboard.press("p"); await p.getByPlaceholder("Set priority…").fill("urgent"); await p.keyboard.press("Enter"); await settle(p);
  await p.keyboard.press("a"); await p.getByPlaceholder("Assign to…").fill("design"); await p.keyboard.press("Enter"); await settle(p);
  await p.keyboard.press("Shift+D"); await p.getByPlaceholder("Set due date…").fill("tomorrow"); await p.keyboard.press("Enter"); await settle(p);
  const act = await pane.getByTestId("activity").innerText();
  ok(act.includes("created the issue"), "activity: created");
  ok(act.includes("changed status from Todo to In Review"), "activity: status change");
  ok(act.includes("set priority to Urgent"), "activity: priority change");
  ok(act.includes("assigned the issue to Design lead"), "activity: assignee change");
  ok(/set the due date to/.test(act), "activity: due date change (⇧D)");
  // sub-issues
  await pane.getByTestId("add-sub").click(); ok((await modal.innerText()).includes("New sub-issue of"), "Add sub-issue opens the modal with the parent set");
  await p.getByLabel("Issue title").fill("Defer analytics init"); await p.getByTestId("create-submit").click(); await modal.waitFor({ state: "detached" });
  await row.click(); await pane.waitFor();
  ok((await pane.getByTestId("sub-issues").innerText()).includes("Defer analytics init"), "parent lists the sub-issue");
  ok((await pane.getByTestId("sub-issues").innerText()).includes("0/1"), "sub-issue progress 0/1");
  await shot(p, "12-issue-detail");
  await pane.getByTestId("sub-row").first().click(); ok((await pane.getByTestId("parent-link").innerText()).includes("Cold start"), "sub-issue pane links back to its parent");
  // persistence
  await p.reload(); await p.waitForSelector("[data-testid=issue-row]");
  await p.locator("[data-testid=issue-row]", { hasText: "Cold start takes four seconds" }).click();
  ok((await p.getByTestId("activity").innerText()).includes("changed status from Todo to In Review"), "activity survives a reload");
  // seeded teammates' history is attributed to them
  await p.locator("[data-testid=issue-row]", { hasText: "Guided first project" }).click();
  ok(/Design lead changed status from Todo to In Progress/.test(await p.getByTestId("activity").innerText()), "seeded activity is attributed to the teammate (a role, not a real name)");
});
