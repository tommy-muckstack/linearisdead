import { addComment, asMember, createIssue, createProject, emptyWorkspace, ensureCycles, currentCycle, updateIssue, type Workspace } from "./model";
/** Teammates in the demo workspace are roles, never real people. */
export const DEMO_TEAM = ["Design lead", "Backend engineer", "Mobile engineer"];
/** A believable first workspace so the demo isn't empty. Built through the same functions the UI uses. */
export function seedWorkspace(me: string, now = new Date()): Workspace {
  let ws = emptyWorkspace(me); ws = { ...ws, members: [me, ...DEMO_TEAM] };
  ws = ensureCycles(ws, new Date(+now - 6 * 86_400_000)); ws = ensureCycles(ws, now); const cur = currentCycle(ws, now)!; const next = ws.cycles.find(c => +new Date(c.startsAt) > +now)!;
  const p1 = createProject(ws, "Onboarding revamp", "Shorter sign-up, a guided first project, and an empty state that teaches."); ws = p1.ws;
  const p2 = createProject(ws, "Billing v2", "Usage-based invoices and a self-serve customer portal."); ws = p2.ws;
  ws = { ...ws, projects: ws.projects.map(p => p.id === p1.project.id ? { ...p, status: "started" } : p) };
  const t = (n: number) => new Date(+now - n * 3_600_000 * 24);
  const seed: [string, Parameters<typeof createIssue>[1], number][] = [
    ["Sign-up form drops the plus sign in emails", { status: "in_progress", priority: 1, assignee: me, labels: ["Bug"], projectId: p1.project.id, cycleId: cur.id, estimate: 2 }, 5],
    ["Guided first project: pick a template", { status: "in_progress", priority: 2, assignee: DEMO_TEAM[0], labels: ["Feature"], projectId: p1.project.id, cycleId: cur.id, estimate: 5 }, 4],
    ["Empty state for the issues list", { status: "todo", priority: 3, assignee: me, labels: ["Improvement"], projectId: p1.project.id, cycleId: cur.id, estimate: 2 }, 4],
    ["Welcome email copy review", { status: "done", priority: 4, assignee: DEMO_TEAM[1], projectId: p1.project.id, cycleId: cur.id, estimate: 1 }, 3],
    ["Skip-for-now on the invite teammates step", { status: "in_review", priority: 3, assignee: me, labels: ["Improvement"], projectId: p1.project.id, cycleId: cur.id, estimate: 2 }, 2],
    ["Usage meter in the billing settings", { status: "todo", priority: 2, assignee: DEMO_TEAM[2], labels: ["Feature"], projectId: p2.project.id, cycleId: cur.id, estimate: 3 }, 3],
    ["Invoice PDF shows the wrong tax line", { status: "todo", priority: 1, assignee: null, labels: ["Bug"], projectId: p2.project.id, cycleId: cur.id, estimate: 2 }, 2],
    ["Customer portal: update card", { status: "backlog", priority: 3, assignee: null, labels: ["Feature"], projectId: p2.project.id, estimate: 5 }, 6],
    ["Proration when seats change mid-month", { status: "backlog", priority: 2, assignee: null, labels: ["Feature"], projectId: p2.project.id, cycleId: next.id, estimate: 5 }, 6],
    ["Dark mode contrast on the board columns", { status: "todo", priority: 4, assignee: me, labels: ["Bug"], cycleId: cur.id, estimate: 1 }, 1],
    ["Keyboard shortcut cheat sheet", { status: "backlog", priority: 0, assignee: null, labels: ["Improvement"], estimate: 2 }, 7],
    ["Export issues as CSV", { status: "backlog", priority: 4, assignee: null, labels: ["Feature"], estimate: 3 }, 8],
    ["Flaky test in the notifications suite", { status: "done", priority: 3, assignee: DEMO_TEAM[1], labels: ["Bug"], cycleId: cur.id, estimate: 1 }, 2],
    ["Rename 'Workspace' to 'Team' in settings", { status: "canceled", priority: 0, assignee: null, labels: [] }, 9],
  ];
  for (const [title, input, ago] of seed) {
    const made = createIssue(ws, { title, ...input }, t(ago)); ws = made.ws;
    // a teammate filed it in Todo and moved it on, so the activity log shows real history
    if (input.status && input.status !== "todo" && input.status !== "backlog") { const who = input.assignee && input.assignee !== me ? input.assignee : DEMO_TEAM[0]; const st = input.status;
      ws = { ...ws, issues: ws.issues.map(i => i.id === made.issue.id ? { ...i, status: "todo", completedAt: null } : i) };
      ws = asMember(ws, who, w => updateIssue(w, made.issue.id, { status: st }, new Date(+t(ago) + 3_600_000))); }
    if (input.status === "done") ws = { ...ws, issues: ws.issues.map(i => i.id === made.issue.id ? { ...i, completedAt: new Date(+now - 3_600_000 * (ago > 2 ? 30 : 6)).toISOString() } : i) };
  }
  // sub-issues and due dates, so the issue pane shows them out of the box
  const byTitle = (t: string) => ws.issues.find(i => i.title === t)!;
  const parent = byTitle("Guided first project: pick a template");
  for (const [title, st] of [["Template gallery layout", "done"], ["Pre-fill the first project from a template", "todo"]] as const) {
    const r = asMember(ws, DEMO_TEAM[0], w => createIssue(w, { title, status: st, parentId: parent.id, projectId: parent.projectId, cycleId: parent.cycleId, assignee: DEMO_TEAM[0], estimate: 2 }, t(3)).ws); ws = r;
  }
  const day = (n: number) => new Date(+now + n * 86_400_000).toISOString().slice(0, 10);
  ws = updateIssue(ws, byTitle("Invoice PDF shows the wrong tax line").id, { dueDate: day(2) }, t(1));
  ws = updateIssue(ws, byTitle("Usage meter in the billing settings").id, { dueDate: day(9) }, t(1));
  ws = asMember(ws, DEMO_TEAM[1], w => updateIssue(w, byTitle("Sign-up form drops the plus sign in emails").id, { priority: 1, dueDate: day(-1) }, t(1)));
  // triage, initiatives, roadmap dates, teammates talking on your issues (fills the Inbox)
  for (const [title, who, ago] of [["Export button missing on mobile", DEMO_TEAM[2], 1], ["Crash when pasting a long title", DEMO_TEAM[1], 0]] as const)
    ws = asMember(ws, who, w => createIssue(w, { title, status: "triage", labels: ["Bug"] }, t(ago)).ws);
  ws = { ...ws, workspaceName: "Demo workspace", urlKey: "demo", triageEnabled: true,
    projects: ws.projects.map((p, n) => ({ ...p, startDate: day(n ? 3 : -20), targetDate: day(n ? 60 : 25) })),
    initiatives: [{ id: "ini_demo", name: "Self-serve growth", description: "Make it possible to sign up, start and pay without talking to us.", status: "active", owner: me, projectIds: ws.projects.map(p => p.id), targetDate: day(75) }] };
  const mine = byTitle("Empty state for the issues list");
  ws = asMember(ws, DEMO_TEAM[0], w => addComment(w, mine.id, "Mocks are in the design file, the illustration is final.", t(0.2)));
  ws = asMember(ws, DEMO_TEAM[1], w => updateIssue(w, byTitle("Skip-for-now on the invite teammates step").id, { estimate: 3 }, t(0.1)));
  return ws;
}
