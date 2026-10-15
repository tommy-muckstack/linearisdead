import { createIssue, createProject, emptyWorkspace, ensureCycles, currentCycle, type Workspace } from "./model";
/** A believable first workspace so the demo isn't empty. Built through the same functions the UI uses. */
export function seedWorkspace(me: string, now = new Date()): Workspace {
  let ws = emptyWorkspace(me); ws = { ...ws, members: [me, "Ada Lovelace", "Grace Hopper", "Linus T."] };
  ws = ensureCycles(ws, new Date(+now - 6 * 86_400_000)); ws = ensureCycles(ws, now); const cur = currentCycle(ws, now)!; const next = ws.cycles.find(c => +new Date(c.startsAt) > +now)!;
  const p1 = createProject(ws, "Onboarding revamp", "Shorter sign-up, a guided first project, and an empty state that teaches."); ws = p1.ws;
  const p2 = createProject(ws, "Billing v2", "Usage-based invoices and a self-serve customer portal."); ws = p2.ws;
  ws = { ...ws, projects: ws.projects.map(p => p.id === p1.project.id ? { ...p, status: "started" } : p) };
  const t = (n: number) => new Date(+now - n * 3_600_000 * 24);
  const seed: [string, Parameters<typeof createIssue>[1], number][] = [
    ["Sign-up form drops the plus sign in emails", { status: "in_progress", priority: 1, assignee: me, labels: ["Bug"], projectId: p1.project.id, cycleId: cur.id, estimate: 2 }, 5],
    ["Guided first project: pick a template", { status: "in_progress", priority: 2, assignee: "Ada Lovelace", labels: ["Feature"], projectId: p1.project.id, cycleId: cur.id, estimate: 5 }, 4],
    ["Empty state for the issues list", { status: "todo", priority: 3, assignee: me, labels: ["Improvement"], projectId: p1.project.id, cycleId: cur.id, estimate: 2 }, 4],
    ["Welcome email copy review", { status: "done", priority: 4, assignee: "Grace Hopper", projectId: p1.project.id, cycleId: cur.id, estimate: 1 }, 3],
    ["Skip-for-now on the invite teammates step", { status: "in_review", priority: 3, assignee: me, labels: ["Improvement"], projectId: p1.project.id, cycleId: cur.id, estimate: 2 }, 2],
    ["Usage meter in the billing settings", { status: "todo", priority: 2, assignee: "Linus T.", labels: ["Feature"], projectId: p2.project.id, cycleId: cur.id, estimate: 3 }, 3],
    ["Invoice PDF shows the wrong tax line", { status: "todo", priority: 1, assignee: null, labels: ["Bug"], projectId: p2.project.id, cycleId: cur.id, estimate: 2 }, 2],
    ["Customer portal: update card", { status: "backlog", priority: 3, assignee: null, labels: ["Feature"], projectId: p2.project.id, estimate: 5 }, 6],
    ["Proration when seats change mid-month", { status: "backlog", priority: 2, assignee: null, labels: ["Feature"], projectId: p2.project.id, cycleId: next.id, estimate: 5 }, 6],
    ["Dark mode contrast on the board columns", { status: "todo", priority: 4, assignee: me, labels: ["Bug"], cycleId: cur.id, estimate: 1 }, 1],
    ["Keyboard shortcut cheat sheet", { status: "backlog", priority: 0, assignee: null, labels: ["Improvement"], estimate: 2 }, 7],
    ["Export issues as CSV", { status: "backlog", priority: 4, assignee: null, labels: ["Feature"], estimate: 3 }, 8],
    ["Flaky test in the notifications suite", { status: "done", priority: 3, assignee: "Grace Hopper", labels: ["Bug"], cycleId: cur.id, estimate: 1 }, 2],
    ["Rename 'Workspace' to 'Team' in settings", { status: "canceled", priority: 0, assignee: null, labels: [] }, 9],
  ];
  for (const [title, input, ago] of seed) {
    const made = createIssue(ws, { title, ...input }, t(ago)); ws = made.ws;
    if (input.status === "done") ws = { ...ws, issues: ws.issues.map(i => i.id === made.issue.id ? { ...i, completedAt: new Date(+now - 3_600_000 * (ago > 2 ? 30 : 6)).toISOString() } : i) };
  }
  return ws;
}
