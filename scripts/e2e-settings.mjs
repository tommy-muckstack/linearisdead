// Settings area (finding 6): reachable from the sidebar, every section changes something real.
import fs from "node:fs";
import { run, ok, BASE, demo, guest, settle, shot } from "./e2e-lib.mjs";
const go = async (p, label) => { await p.locator("nav[aria-label=Settings] a", { hasText: label }).click(); await p.waitForURL(/settings\//); await settle(p, 200); };
await run("settings", async ({ newPage }) => {
  const p = await demo(newPage);
  await p.getByTestId("settings-link").click(); await p.waitForURL(/\/app\/settings$/); await p.getByTestId("settings").waitFor();
  ok(await p.getByRole("heading", { name: "Preferences" }).isVisible(), "sidebar gear opens Settings › Preferences");
  for (const l of ["Preferences", "Profile", "Notifications", "Security & access", "General", "Members", "Labels", "Import / export", "Engineering"]) ok(await p.locator("nav[aria-label=Settings] a", { hasText: l }).count() === 1, `settings nav: ${l}`);
  await shot(p, "14-settings");
  // preferences: home view + auto-assign
  await p.getByLabel("Default home view").selectOption("my"); await p.goto(BASE + "/app"); await p.waitForURL(/\/app\/my$/); ok(true, "home view: /app opens My issues");
  await p.goto(BASE + "/app/settings"); await p.getByLabel("Default home view").selectOption("active");
  await p.getByLabel("Auto-assign to self").check(); await p.keyboard.press("Escape");
  await p.goto(BASE + "/app/active"); await p.waitForSelector("[data-testid=issue-row]"); await p.mouse.move(1, 1); await p.keyboard.press("c");
  ok(await p.getByRole("dialog", { name: "New issue" }).getByLabel("Assignee").inputValue() === "Demo User", "auto-assign pre-fills me as assignee"); await p.keyboard.press("Escape");
  // profile
  await p.goto(BASE + "/app/settings/account"); await p.getByLabel("Display name").fill("Demo Person"); await p.keyboard.press("Enter"); await settle(p);
  await p.goto(BASE + "/app/my"); await p.waitForSelector("[data-testid=issue-row]"); await p.locator("[data-testid=issue-row]").first().click();
  ok((await p.getByTestId("prop-assignee").innerText()).includes("Demo Person"), "renaming yourself updates your assignments");
  // notifications filter the inbox
  await p.goto(BASE + "/app/inbox"); const before = await p.getByTestId("notification").count();
  await p.goto(BASE + "/app/settings/notifications"); await p.getByLabel("Status changes").uncheck(); await settle(p);
  await p.goto(BASE + "/app/inbox"); const after = await p.getByTestId("notification").count(); ok(after < before, `turning off status changes trims the inbox (${before} → ${after})`);
  // members
  await p.goto(BASE + "/app/settings/members"); await p.getByLabel("New member name or email").fill("qa@example.com"); await p.getByRole("button", { name: "Add member" }).click();
  ok((await p.getByTestId("members").innerText()).includes("qa@example.com"), "member added");
  await p.getByRole("button", { name: "Remove qa@example.com" }).click(); ok(!(await p.getByTestId("members").innerText()).includes("qa@example.com"), "member removed");
  // labels
  await go(p, "Labels"); await p.getByLabel("New label name").fill("Security"); await p.getByRole("button", { name: "Create label" }).click();
  ok((await p.getByTestId("labels").locator("input").evaluateAll(is => is.map(i => i.value))).includes("Security"), "label created");
  await p.getByLabel("Rename Bug").fill("Defect"); await p.keyboard.press("Enter"); await settle(p);
  await p.goto(BASE + "/app/all"); ok(await p.locator(".lin-tag", { hasText: "Defect" }).count() > 0 && !(await p.locator(".lin-tag", { hasText: /^Bug$/ }).count()), "renaming a label renames it on issues");
  // team: identifier, triage, estimates
  await p.goto(BASE + "/app/settings/team"); await p.getByLabel("Identifier").fill("APP"); await p.keyboard.press("Enter"); await settle(p);
  await p.getByLabel("Estimate scale").selectOption("tshirt"); await p.getByLabel("Enable triage").uncheck(); await settle(p);
  await p.goto(BASE + "/app/all"); ok(await p.locator("[data-ident^='APP-']").count() > 0, "identifier change renames issue IDs");
  ok(!(await p.locator("nav.lin-nav a", { hasText: /^Triage/ }).count()), "turning triage off hides it from the sidebar");
  await p.locator("[data-testid=issue-row]").first().click(); await p.keyboard.press("e"); ok(await p.getByRole("option", { name: "XL" }).isVisible(), "estimate picker follows the T-shirt scale"); await p.keyboard.press("Escape");
  // import / export round trip
  await p.goto(BASE + "/app/settings/import-export");
  const [dl] = await Promise.all([p.waitForEvent("download"), p.getByRole("button", { name: "Export JSON" }).click()]);
  const json = fs.readFileSync(await dl.path(), "utf8"); ok(JSON.parse(json).teamKey === "APP", "JSON export contains the workspace");
  const [csv] = await Promise.all([p.waitForEvent("download"), p.getByRole("button", { name: "Export CSV" }).click()]);
  const csvText = fs.readFileSync(await csv.path(), "utf8"); ok(csvText.startsWith("ID,Title,Status") && csvText.includes("APP-1,"), "CSV export has a header and issues");
  await p.getByLabel("Import JSON backup").setInputFiles({ name: "bad.json", mimeType: "application/json", buffer: Buffer.from("{}") });
  ok((await p.getByRole("alert").filter({ hasText: "export" }).innerText()).includes("isn't a LinearIsDead workspace export"), "import rejects a bad file");
  const w = JSON.parse(json); w.teamName = "Imported team";
  await p.getByLabel("Import JSON backup").setInputFiles({ name: "ok.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(w)) }); await settle(p);
  await p.goto(BASE + "/app/settings/team"); ok(await p.getByLabel("Team name").inputValue() === "Imported team", "import replaces the workspace");
  // general: URL + delete
  await p.goto(BASE + "/app/settings/workspace"); await p.getByLabel("Workspace URL").fill("Demo Co!"); await p.keyboard.press("Enter"); await settle(p);
  ok(await p.getByLabel("Workspace URL").inputValue() === "demo-co", "workspace URL is slugified");
  ok(await p.getByRole("button", { name: "Delete workspace" }).isDisabled(), "delete needs typed confirmation");
  await p.getByLabel("Type DELETE to confirm").fill("DELETE"); await p.getByRole("button", { name: "Delete workspace" }).click();
  await p.getByTestId("onboarding").waitFor(); ok(true, "deleting the workspace returns to onboarding");
  // security: demo / guest
  const gp = await guest(newPage); await gp.goto(BASE + "/app/settings/security"); ok(await gp.getByTestId("signin-prompt").isVisible(), "guests get an inline sign-in prompt for security settings");
  await gp.goto(BASE + "/app/settings/nope"); ok(await gp.getByTestId("app-not-found").isVisible(), "unknown settings page → not found");
  await gp.goto(BASE + "/app/active"); await gp.waitForSelector("[data-testid=linear-app]"); await gp.keyboard.press("g"); await gp.keyboard.press("s"); await gp.waitForURL(/settings$/); ok(true, "G then S opens settings");
});
