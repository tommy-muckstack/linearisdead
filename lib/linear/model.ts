// LinearIsDead core: issues, projects, cycles. Pure functions over a plain JSON workspace so they are easy to test and to persist.
export type StatusType = "triage" | "backlog" | "unstarted" | "started" | "completed" | "canceled";
export type Status = "triage" | "backlog" | "todo" | "in_progress" | "in_review" | "done" | "canceled";
export const STATUSES: { id: Status; label: string; type: StatusType; color: string }[] = [
  { id: "triage", label: "Triage", type: "triage", color: "#E8833A" },
  { id: "backlog", label: "Backlog", type: "backlog", color: "#6C707A" },
  { id: "todo", label: "Todo", type: "unstarted", color: "#A3A7B0" },
  { id: "in_progress", label: "In Progress", type: "started", color: "#F2C94C" },
  { id: "in_review", label: "In Review", type: "started", color: "#4CB782" },
  { id: "done", label: "Done", type: "completed", color: "#7B86E8" },
  { id: "canceled", label: "Canceled", type: "canceled", color: "#6C707A" },
];
export const statusInfo = (s: Status) => STATUSES.find(x => x.id === s)!;
export const isDone = (s: Status) => statusInfo(s).type === "completed";
export const isOpen = (s: Status) => !["completed", "canceled"].includes(statusInfo(s).type);

export type Priority = 0 | 1 | 2 | 3 | 4;
export const PRIORITIES: { id: Priority; label: string; key: string }[] = [
  { id: 0, label: "No priority", key: "none" }, { id: 1, label: "Urgent", key: "urgent" }, { id: 2, label: "High", key: "high" }, { id: 3, label: "Medium", key: "medium" }, { id: 4, label: "Low", key: "low" },
];
export const priorityLabel = (p: Priority) => PRIORITIES[p].label;

export type Comment = { id: string; by: string; body: string; at: string };
/** One entry in an issue's activity log. `from`/`to` are display values (labels, names, dates), never ids. */
export type ActivityKind = "created" | "status" | "priority" | "assignee" | "label_added" | "label_removed" | "project" | "cycle" | "estimate" | "due" | "parent" | "title" | "description";
export type Activity = { id: string; at: string; by: string; kind: ActivityKind; from?: string | null; to?: string | null };
export type Issue = {
  id: string; number: number; title: string; description: string; status: Status; priority: Priority;
  assignee: string | null; labels: string[]; projectId: string | null; cycleId: string | null; estimate: number | null;
  /** YYYY-MM-DD */ dueDate: string | null; parentId: string | null; creator: string;
  createdAt: string; updatedAt: string; completedAt: string | null; comments: Comment[]; history: Activity[];
};
export type Project = { id: string; name: string; summary: string; status: "planned" | "started" | "paused" | "completed"; lead: string | null; targetDate: string | null; startDate?: string | null };
export type Initiative = { id: string; name: string; description: string; status: "planned" | "active" | "completed"; owner: string | null; projectIds: string[]; targetDate: string | null };
export type Cycle = { id: string; number: number; startsAt: string; endsAt: string };
export type Workspace = {
  teamKey: string; teamName: string; me: string; members: string[]; labels: string[];
  nextNumber: number; nextCycleNumber: number; cycleDays: number;
  issues: Issue[]; projects: Project[]; cycles: Cycle[];
  /** Settings › Teams › Estimates. Optional so older saved workspaces still load. */
  estimateScale?: "fibonacci" | "linear" | "exponential" | "tshirt";
  /** Workspace name and URL key (onboarding / Settings › Workspace). */
  workspaceName?: string; urlKey?: string;
  triageEnabled?: boolean; initiatives?: Initiative[];
  /** Inbox: notification ids the user has read or removed. */
  inboxRead?: string[]; inboxHidden?: string[];
  /** Settings › Preferences / Notifications. */
  homeView?: "active" | "my" | "inbox"; autoAssign?: boolean;
  views?: SavedView[];
  notify?: { status: boolean; assignee: boolean; comments: boolean; other: boolean };
};

const DAY = 86_400_000;
let seq = 0;
export const uid = (p = "x") => `${p}_${Date.now().toString(36)}${(seq++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export const identifier = (ws: Workspace, i: Issue) => `${ws.teamKey}-${i.number}`;
const iso = (d: Date) => d.toISOString();
const startOfDay = (d: Date) => { const x = new Date(d); x.setUTCHours(0, 0, 0, 0); return x; };

export type IssueInput = Partial<Pick<Issue, "title" | "description" | "status" | "priority" | "assignee" | "labels" | "projectId" | "cycleId" | "estimate" | "dueDate" | "parentId">>;

export function createIssue(ws: Workspace, input: IssueInput, now = new Date()): { ws: Workspace; issue: Issue } {
  const title = (input.title ?? "").trim();
  if (!title) throw new Error("An issue needs a title");
  const status = input.status ?? "todo";
  const issue: Issue = {
    id: uid("iss"), number: ws.nextNumber, title, description: input.description ?? "", status, priority: input.priority ?? 0,
    assignee: input.assignee ?? null, labels: [...new Set(input.labels ?? [])], projectId: input.projectId ?? null, cycleId: input.cycleId ?? null, estimate: input.estimate ?? null,
    dueDate: input.dueDate ?? null, parentId: input.parentId && ws.issues.some(i => i.id === input.parentId) ? input.parentId : null, creator: ws.me,
    createdAt: iso(now), updatedAt: iso(now), completedAt: isDone(status) ? iso(now) : null, comments: [],
    history: [{ id: uid("a"), at: iso(now), by: ws.me, kind: "created" }],
  };
  const labels = [...new Set([...ws.labels, ...issue.labels])];
  return { ws: { ...ws, nextNumber: ws.nextNumber + 1, labels, issues: [issue, ...ws.issues] }, issue };
}

export function updateIssue(ws: Workspace, id: string, patch: IssueInput, now = new Date()): Workspace {
  return { ...ws, issues: ws.issues.map(i => {
    if (i.id !== id) return i;
    const p = { ...patch }; if (p.parentId && (p.parentId === id || isDescendant(ws, p.parentId, id))) delete p.parentId; // no cycles
    const next: Issue = { ...i, ...p, title: p.title !== undefined ? (p.title.trim() || i.title) : i.title, updatedAt: iso(now) };
    if (p.status && p.status !== i.status) next.completedAt = isDone(p.status) ? iso(now) : null;
    const log = diffActivity(ws, i, next, now);
    return log.length ? { ...next, history: [...(i.history ?? []), ...log] } : next;
  }), labels: patch.labels ? [...new Set([...ws.labels, ...patch.labels])] : ws.labels };
}
const isDescendant = (ws: Workspace, maybeChild: string, ancestor: string): boolean => {
  let cur = ws.issues.find(i => i.id === maybeChild); const seen = new Set<string>();
  while (cur?.parentId && !seen.has(cur.id)) { if (cur.parentId === ancestor) return true; seen.add(cur.id); cur = ws.issues.find(i => i.id === cur!.parentId); }
  return false;
};
/** Activity entries for every tracked field that changed between two versions of an issue. */
export function diffActivity(ws: Workspace, a: Issue, b: Issue, now = new Date()): Activity[] {
  const out: Activity[] = []; const at = iso(now);
  const add = (kind: ActivityKind, from: string | null, to: string | null) => out.push({ id: uid("a"), at, by: ws.me, kind, from, to });
  const proj = (x: string | null) => ws.projects.find(p => p.id === x)?.name ?? null;
  const cyc = (x: string | null) => { const c = ws.cycles.find(c => c.id === x); return c ? `Cycle ${c.number}` : null; };
  const par = (x: string | null) => { const p = ws.issues.find(i => i.id === x); return p ? identifier(ws, p) : null; };
  if (a.status !== b.status) add("status", statusInfo(a.status).label, statusInfo(b.status).label);
  if (a.priority !== b.priority) add("priority", priorityLabel(a.priority), priorityLabel(b.priority));
  if (a.assignee !== b.assignee) add("assignee", a.assignee, b.assignee);
  for (const l of b.labels) if (!a.labels.includes(l)) add("label_added", null, l);
  for (const l of a.labels) if (!b.labels.includes(l)) add("label_removed", l, null);
  if (a.projectId !== b.projectId) add("project", proj(a.projectId), proj(b.projectId));
  if (a.cycleId !== b.cycleId) add("cycle", cyc(a.cycleId), cyc(b.cycleId));
  if (a.estimate !== b.estimate) add("estimate", a.estimate == null ? null : String(a.estimate), b.estimate == null ? null : String(b.estimate));
  if ((a.dueDate ?? null) !== (b.dueDate ?? null)) add("due", a.dueDate ?? null, b.dueDate ?? null);
  if ((a.parentId ?? null) !== (b.parentId ?? null)) add("parent", par(a.parentId ?? null), par(b.parentId ?? null));
  if (a.title !== b.title) add("title", a.title, b.title);
  if (a.description !== b.description) add("description", null, null);
  return out;
}
/** Deleting a parent keeps its sub-issues; they just lose the parent link. */
export const deleteIssues = (ws: Workspace, ids: string[]): Workspace => ({ ...ws, issues: ws.issues.filter(i => !ids.includes(i.id)).map(i => (i.parentId && ids.includes(i.parentId) ? { ...i, parentId: null } : i)) });
export const subIssues = (ws: Workspace, id: string) => ws.issues.filter(i => i.parentId === id).sort((a, b) => a.number - b.number);
export function subProgress(ws: Workspace, id: string) { const s = subIssues(ws, id).filter(i => i.status !== "canceled"); return { total: s.length, done: s.filter(i => isDone(i.status)).length }; }
/** Fill fields added after a workspace was first saved, so old browser data keeps working. */
export function normalizeIssue(i: Issue): Issue {
  if (i.history && i.creator !== undefined && i.dueDate !== undefined && i.parentId !== undefined) return i;
  return { ...i, dueDate: i.dueDate ?? null, parentId: i.parentId ?? null, creator: i.creator ?? "", history: i.history ?? [{ id: uid("a"), at: i.createdAt, by: i.creator ?? "", kind: "created" }] };
}
export function normalizeWorkspace(ws: Workspace): Workspace {
  let changed = false; const issues = ws.issues.map(i => { const n = normalizeIssue(i); if (n !== i) changed = true; return n; });
  return changed ? { ...ws, issues } : ws;
}
/** Today in the viewer's calendar as YYYY-MM-DD. */
export const todayISO = (now = new Date()) => new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
export const isOverdue = (i: Pick<Issue, "dueDate" | "status">, now = new Date()) => !!i.dueDate && isOpen(i.status) && i.dueDate < todayISO(now);
export function addComment(ws: Workspace, id: string, body: string, now = new Date()): Workspace {
  const b = body.trim(); if (!b) return ws;
  return { ...ws, issues: ws.issues.map(i => i.id === id ? { ...i, updatedAt: iso(now), comments: [...i.comments, { id: uid("c"), by: ws.me, body: b, at: iso(now) }] } : i) };
}
export const toggleLabel = (i: Issue, label: string) => i.labels.includes(label) ? i.labels.filter(l => l !== label) : [...i.labels, label];

/** Quick-create syntax: `Fix login redirect !urgent @me #bug +Onboarding ~3 /done`. */
export function parseQuickCreate(text: string, ws: Pick<Workspace, "me" | "members" | "labels"> & { projects?: Project[] }): IssueInput {
  const out: IssueInput = {}; const words: string[] = []; const labels: string[] = [];
  for (const w of text.trim().split(/\s+/)) {
    let m: RegExpMatchArray | null;
    if ((m = w.match(/^!(urgent|high|med|medium|low|none|[0-4])$/i))) { const k = m[1].toLowerCase(); out.priority = (/^[0-4]$/.test(k) ? +k : { urgent: 1, high: 2, med: 3, medium: 3, low: 4, none: 0 }[k]) as Priority; }
    else if ((m = w.match(/^@(\w[\w.-]*)$/))) { const n = m[1].toLowerCase(); out.assignee = n === "me" ? ws.me : ws.members.find(x => x.toLowerCase().startsWith(n)) ?? null; if (!out.assignee) words.push(w); }
    else if ((m = w.match(/^#([\w-]+)$/))) { const n = m[1].toLowerCase(); labels.push(ws.labels.find(l => l.toLowerCase() === n) ?? m[1]); }
    else if ((m = w.match(/^\+([\w-]+)$/)) && ws.projects) { const p = ws.projects.find(p => p.name.toLowerCase().replace(/\s+/g, "-").startsWith(m![1].toLowerCase())); if (p) out.projectId = p.id; else words.push(w); }
    else if ((m = w.match(/^~(\d{1,2})$/))) out.estimate = +m[1];
    else if ((m = w.match(/^\/(backlog|todo|progress|review|done|canceled)$/i))) out.status = ({ backlog: "backlog", todo: "todo", progress: "in_progress", review: "in_review", done: "done", canceled: "canceled" } as const)[m[1].toLowerCase() as "todo"];
    else words.push(w);
  }
  if (labels.length) out.labels = labels;
  out.title = words.join(" ");
  return out;
}

// ---- filtering: `login status:todo,in_progress priority:high assignee:me label:bug project:onboarding cycle:current is:open` ----
export type Filter = { text: string; status: Status[]; priority: Priority[]; assignee: string[]; label: string[]; project: string[]; cycle: string[]; open?: boolean };
export function parseFilter(q: string): Filter {
  const f: Filter = { text: "", status: [], priority: [], assignee: [], label: [], project: [], cycle: [] }; const words: string[] = [];
  for (const w of q.trim().split(/\s+/).filter(Boolean)) {
    const m = w.match(/^(status|priority|assignee|label|project|cycle|is):(.+)$/i);
    if (!m) { words.push(w); continue; }
    const key = m[1].toLowerCase(); const vals = m[2].toLowerCase().split(",").filter(Boolean);
    if (key === "status") for (const v of vals) { const s = STATUSES.find(s => s.id === v || s.label.toLowerCase().replace(/ /g, "") === v.replace(/_/g, "")); if (s) f.status.push(s.id); }
    else if (key === "priority") for (const v of vals) { const p = PRIORITIES.find(p => p.key === v || String(p.id) === v); if (p) f.priority.push(p.id); }
    else if (key === "is") { if (vals.includes("open")) f.open = true; if (vals.includes("closed")) f.open = false; }
    else (f[key as "assignee"]).push(...vals);
  }
  f.text = words.join(" ").toLowerCase();
  return f;
}
export function currentCycle(ws: Workspace, now = new Date()): Cycle | undefined { return ws.cycles.find(c => +new Date(c.startsAt) <= +now && +now < +new Date(c.endsAt)); }
export function matches(ws: Workspace, i: Issue, f: Filter, now = new Date()): boolean {
  if (f.text && !(identifier(ws, i).toLowerCase().includes(f.text) || i.title.toLowerCase().includes(f.text) || i.description.toLowerCase().includes(f.text))) return false;
  if (f.status.length && !f.status.includes(i.status)) return false;
  if (f.priority.length && !f.priority.includes(i.priority)) return false;
  if (f.open === true && !isOpen(i.status)) return false;
  if (f.open === false && isOpen(i.status)) return false;
  if (f.assignee.length && !f.assignee.some(a => a === "none" ? !i.assignee : i.assignee && (a === "me" ? i.assignee === ws.me : i.assignee.toLowerCase().startsWith(a)))) return false;
  if (f.label.length && !f.label.some(l => i.labels.some(x => x.toLowerCase() === l))) return false;
  if (f.project.length) { const p = ws.projects.find(p => p.id === i.projectId); if (!p || !f.project.some(x => p.name.toLowerCase().replace(/\s+/g, "-").includes(x))) return false; }
  if (f.cycle.length) { const cur = currentCycle(ws, now); if (!f.cycle.some(c => (c === "current" ? cur?.id === i.cycleId : c === "none" ? !i.cycleId : ws.cycles.find(x => String(x.number) === c)?.id === i.cycleId))) return false; }
  return true;
}
export const filterIssues = (ws: Workspace, q: string, base: Issue[] = ws.issues, now = new Date()) => { const f = parseFilter(q); return base.filter(i => matches(ws, i, f, now)); };

export type GroupBy = "status" | "priority" | "assignee" | "project" | "cycle" | "label" | "none";
export const GROUPINGS: [GroupBy, string][] = [["status", "Status"], ["assignee", "Assignee"], ["project", "Project"], ["priority", "Priority"], ["cycle", "Cycle"], ["label", "Label"], ["none", "No grouping"]];
export type OrderBy = "priority" | "status" | "created" | "updated" | "due";
export const ORDERINGS: [OrderBy, string][] = [["priority", "Priority"], ["status", "Status"], ["created", "Last created"], ["updated", "Last updated"], ["due", "Due date"]];
export type Group = { key: string; label: string; issues: Issue[]; sub?: Group[] };
const statusRank = (s: Status) => STATUSES.findIndex(x => x.id === s);
export function sortIssues(list: Issue[], order: OrderBy = "priority"): Issue[] {
  const byPri = (a: Issue, b: Issue) => (a.priority || 9) - (b.priority || 9) || b.number - a.number;
  const cmp: Record<OrderBy, (a: Issue, b: Issue) => number> = {
    priority: byPri,
    status: (a, b) => statusRank(b.status) - statusRank(a.status) || byPri(a, b),
    created: (a, b) => b.createdAt.localeCompare(a.createdAt) || b.number - a.number,
    updated: (a, b) => b.updatedAt.localeCompare(a.updatedAt) || b.number - a.number,
    due: (a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999") || byPri(a, b),
  };
  return [...list].sort(cmp[order]);
}
export function groupIssues(ws: Workspace, list: Issue[], by: GroupBy, keepEmpty = false, order: OrderBy = "priority", subBy: GroupBy = "none"): Group[] {
  const finish = (g: Group): Group => (subBy !== "none" && subBy !== by ? { ...g, sub: groupIssues(ws, g.issues, subBy, false, order) } : g);
  if (by === "none") return [finish({ key: "all", label: "All issues", issues: sortIssues(list, order) })];
  const defs: { key: string; label: string; test: (i: Issue) => boolean }[] =
    by === "status" ? STATUSES.map(s => ({ key: s.id, label: s.label, test: (i: Issue) => i.status === s.id }))
    : by === "priority" ? PRIORITIES.map(p => ({ key: String(p.id), label: p.label, test: (i: Issue) => i.priority === p.id }))
    : by === "assignee" ? [...ws.members, null].map(m => ({ key: m ?? "none", label: m ?? "Unassigned", test: (i: Issue) => i.assignee === m }))
    : by === "cycle" ? [...[...ws.cycles].sort((a, b) => a.number - b.number).map(c => ({ key: c.id, label: `Cycle ${c.number}`, test: (i: Issue) => i.cycleId === c.id })), { key: "none", label: "No cycle", test: (i: Issue) => !i.cycleId }]
    : by === "label" ? [...ws.labels.map(l => ({ key: "l:" + l, label: l, test: (i: Issue) => i.labels.includes(l) })), { key: "none", label: "No label", test: (i: Issue) => !i.labels.length }]
    : [...ws.projects.map(p => ({ key: p.id, label: p.name, test: (i: Issue) => i.projectId === p.id })), { key: "none", label: "No project", test: (i: Issue) => !i.projectId }];
  return defs.map(d => finish({ key: d.key, label: d.label, issues: sortIssues(list.filter(d.test), order) })).filter(g => g.issues.length || (keepEmpty && by === "status" && g.key !== "canceled" && g.key !== "triage"));
}

// ---- display options and saved views ----
export const DISPLAY_PROPS: [string, string][] = [["id", "ID"], ["status", "Status"], ["assignee", "Assignee"], ["priority", "Priority"], ["project", "Project"], ["due", "Due date"], ["cycle", "Cycle"], ["estimate", "Estimate"], ["labels", "Labels"], ["subs", "Sub-issues"], ["created", "Created"], ["updated", "Updated"]];
export type Display = { layout: "list" | "board"; group: GroupBy; subGroup: GroupBy; order: OrderBy; showSub: boolean; showEmpty: boolean; props: string[] };
export const DEFAULT_DISPLAY: Display = { layout: "list", group: "status", subGroup: "none", order: "priority", showSub: true, showEmpty: false, props: ["id", "status", "assignee", "priority", "project", "due", "estimate", "labels", "subs", "created"] };
/** Fill in options added after a display was saved. */
export const withDisplayDefaults = (d: Partial<Display> | undefined): Display => ({ ...DEFAULT_DISPLAY, ...d, props: d?.props ?? DEFAULT_DISPLAY.props });
export type SavedView = { id: string; name: string; filter: string; display: Display; favorite: boolean; createdAt: string; owner: string };
export function saveView(ws: Workspace, name: string, filter: string, display: Display, now = new Date()): { ws: Workspace; view: SavedView } {
  const n = name.trim(); if (!n) throw new Error("A view needs a name");
  const view: SavedView = { id: uid("view"), name: n, filter: filter.trim(), display, favorite: false, createdAt: iso(now), owner: ws.me };
  return { ws: { ...ws, views: [...(ws.views ?? []), view] }, view };
}
export const updateView = (ws: Workspace, id: string, patch: Partial<Omit<SavedView, "id">>): Workspace => ({ ...ws, views: (ws.views ?? []).map(v => (v.id === id ? { ...v, ...patch } : v)) });
export const deleteView = (ws: Workspace, id: string): Workspace => ({ ...ws, views: (ws.views ?? []).filter(v => v.id !== id) });

// ---- cycles ----
/** Make sure the current and next cycle exist (cycles are back-to-back windows of `cycleDays`). */
export function ensureCycles(ws: Workspace, now = new Date()): Workspace {
  let cycles = [...ws.cycles].sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt)); let n = ws.nextCycleNumber;
  const len = ws.cycleDays * DAY;
  if (!cycles.length) { const s = startOfDay(now); cycles.push({ id: uid("cyc"), number: n++, startsAt: iso(s), endsAt: iso(new Date(+s + len)) }); }
  let guard = 0;
  while ((+new Date(cycles[cycles.length - 1].endsAt) <= +now || cycles.length < 2 || !currentCycle({ ...ws, cycles }, now)) && guard++ < 200) {
    const last = cycles[cycles.length - 1]; const s = new Date(last.endsAt);
    cycles.push({ id: uid("cyc"), number: n++, startsAt: iso(s), endsAt: iso(new Date(+s + len)) });
  }
  const hasNext = cycles.some(c => +new Date(c.startsAt) > +now);
  if (!hasNext) { const last = cycles[cycles.length - 1]; cycles.push({ id: uid("cyc"), number: n++, startsAt: last.endsAt, endsAt: iso(new Date(+new Date(last.endsAt) + len)) }); }
  return cycles.length === ws.cycles.length ? ws : { ...ws, cycles, nextCycleNumber: n };
}
export const cycleIssues = (ws: Workspace, cycleId: string) => ws.issues.filter(i => i.cycleId === cycleId);
const weight = (i: Issue) => i.estimate ?? 1;
export function cycleStats(ws: Workspace, cycleId: string) {
  const list = cycleIssues(ws, cycleId).filter(i => i.status !== "canceled");
  const scope = list.reduce((s, i) => s + weight(i), 0);
  const completed = list.filter(i => isDone(i.status)).reduce((s, i) => s + weight(i), 0);
  const started = list.filter(i => statusInfo(i.status).type === "started").reduce((s, i) => s + weight(i), 0);
  return { count: list.length, scope, completed, started, percent: scope ? Math.round((completed / scope) * 100) : 0 };
}
/** Move every unfinished issue from one cycle into another (what happens when a cycle ends). */
export function rollOver(ws: Workspace, fromId: string, toId: string): { ws: Workspace; moved: number } {
  let moved = 0;
  const issues = ws.issues.map(i => { if (i.cycleId === fromId && isOpen(i.status)) { moved++; return { ...i, cycleId: toId }; } return i; });
  return { ws: { ...ws, issues }, moved };
}
/** Daily scope vs completed points for the burn-up chart. */
export function burnup(ws: Workspace, cycle: Cycle, now = new Date()) {
  const list = cycleIssues(ws, cycle.id).filter(i => i.status !== "canceled"); const out: { day: number; date: string; scope: number; completed: number }[] = [];
  const start = +startOfDay(new Date(cycle.startsAt)); const days = Math.round((+new Date(cycle.endsAt) - start) / DAY);
  const end = Math.min(days, Math.max(0, Math.floor((+startOfDay(now) - start) / DAY)));
  for (let d = 0; d <= end; d++) {
    const t = start + (d + 1) * DAY;
    out.push({ day: d, date: new Date(start + d * DAY).toISOString().slice(0, 10),
      scope: list.filter(i => +new Date(i.createdAt) < t || (i.completedAt && +new Date(i.completedAt) < t)).reduce((s, i) => s + weight(i), 0),
      completed: list.filter(i => i.completedAt && +new Date(i.completedAt) < t).reduce((s, i) => s + weight(i), 0) });
  }
  return { points: out, totalDays: days };
}

// ---- projects ----
export function projectStats(ws: Workspace, projectId: string) {
  const list = ws.issues.filter(i => i.projectId === projectId && i.status !== "canceled");
  const done = list.filter(i => isDone(i.status)).length;
  return { total: list.length, done, percent: list.length ? Math.round((done / list.length) * 100) : 0 };
}
export function createProject(ws: Workspace, name: string, summary = ""): { ws: Workspace; project: Project } {
  const n = name.trim(); if (!n) throw new Error("A project needs a name");
  const project: Project = { id: uid("prj"), name: n, summary, status: "planned", lead: ws.me, targetDate: null };
  return { ws: { ...ws, projects: [...ws.projects, project] }, project };
}
export const setProjectStatus = (ws: Workspace, id: string, status: Project["status"]): Workspace => ({ ...ws, projects: ws.projects.map(p => p.id === id ? { ...p, status } : p) });

/** Rename a member everywhere they appear (assignees, comments, project leads, `me`). */
export function renameMember(ws: Workspace, from: string, to: string): Workspace {
  const n = to.trim(); if (!n || n === from || ws.members.includes(n)) return ws;
  const r = (x: string | null) => (x === from ? n : x);
  return { ...ws, me: ws.me === from ? n : ws.me, members: ws.members.map(m => (m === from ? n : m)),
    issues: ws.issues.map(i => ({ ...i, assignee: r(i.assignee), comments: i.comments.map(c => ({ ...c, by: r(c.by)! })) })),
    projects: ws.projects.map(p => ({ ...p, lead: r(p.lead) })) };
}
export function emptyWorkspace(me = "You", teamKey = "ENG", teamName = "Engineering"): Workspace {
  return { teamKey, teamName, me, members: [me], labels: ["Bug", "Feature", "Improvement"], nextNumber: 1, nextCycleNumber: 1, cycleDays: 14, issues: [], projects: [], cycles: [] };
}

// ---- activity log wording ----
const shortDate = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
export function activityText(a: Activity): string {
  switch (a.kind) {
    case "created": return "created the issue";
    case "status": return `changed status from ${a.from} to ${a.to}`;
    case "priority": return a.to === "No priority" ? "removed the priority" : `set priority to ${a.to}`;
    case "assignee": return a.to ? `assigned the issue to ${a.to}` : `unassigned ${a.from}`;
    case "label_added": return `added label ${a.to}`;
    case "label_removed": return `removed label ${a.from}`;
    case "project": return a.to ? `moved the issue to project ${a.to}` : `removed the issue from project ${a.from}`;
    case "cycle": return a.to ? `added the issue to ${a.to}` : `removed the issue from ${a.from}`;
    case "estimate": return a.to ? `set the estimate to ${a.to} point${a.to === "1" ? "" : "s"}` : "removed the estimate";
    case "due": return a.to ? `set the due date to ${shortDate(a.to)}` : "removed the due date";
    case "parent": return a.to ? `made this a sub-issue of ${a.to}` : "removed the parent issue";
    case "title": return `renamed the issue to “${a.to}”`;
    case "description": return "updated the description";
  }
}
/** Run `f` as another member, so the activity it records is attributed to them (seed data and tests). */
export function asMember(ws: Workspace, who: string, f: (w: Workspace) => Workspace): Workspace { return { ...f({ ...ws, me: who }), me: ws.me }; }

// ---- triage ----
export const inTriage = (i: Issue) => i.status === "triage";
export function acceptIssue(ws: Workspace, id: string, now = new Date()): Workspace { return updateIssue(ws, id, { status: "todo" }, now); }
export function declineIssue(ws: Workspace, id: string, now = new Date()): Workspace { return updateIssue(ws, id, { status: "canceled" }, now); }
export function markDuplicate(ws: Workspace, id: string, of: string, now = new Date()): Workspace {
  const orig = ws.issues.find(i => i.id === of); if (!orig || of === id) return ws;
  return addComment(updateIssue(ws, id, { status: "canceled" }, now), id, `Marked as a duplicate of ${identifier(ws, orig)}`, now);
}

// ---- inbox: activity by other people on issues you're part of ----
export type Notification = { id: string; issueId: string; at: string; by: string; text: string; read: boolean };
/** You are subscribed to issues you created, are assigned, or commented on. */
export const isSubscribed = (ws: Workspace, i: Issue) => i.assignee === ws.me || i.creator === ws.me || i.comments.some(c => c.by === ws.me);
export function inbox(ws: Workspace): Notification[] {
  const read = new Set(ws.inboxRead ?? []), hidden = new Set(ws.inboxHidden ?? []); const out: Notification[] = [];
  const n = { status: true, assignee: true, comments: true, other: true, ...ws.notify };
  const want = (k: ActivityKind) => k === "status" ? n.status : k === "assignee" ? n.assignee : n.other;
  for (const i of ws.issues) {
    if (!isSubscribed(ws, i)) continue;
    for (const a of i.history ?? []) if (a.by && a.by !== ws.me && want(a.kind)) out.push({ id: a.id, issueId: i.id, at: a.at, by: a.by, text: activityText(a), read: read.has(a.id) });
    if (n.comments) for (const c of i.comments) if (c.by !== ws.me) out.push({ id: c.id, issueId: i.id, at: c.at, by: c.by, text: `commented: ${c.body.slice(0, 140)}`, read: read.has(c.id) });
  }
  return out.filter(n => !hidden.has(n.id)).sort((a, b) => b.at.localeCompare(a.at));
}
export const markRead = (ws: Workspace, ids: string[]): Workspace => ({ ...ws, inboxRead: [...new Set([...(ws.inboxRead ?? []), ...ids])].slice(-2000) });
export const hideNotifications = (ws: Workspace, ids: string[]): Workspace => ({ ...ws, inboxHidden: [...new Set([...(ws.inboxHidden ?? []), ...ids])].slice(-2000) });
/** Your own recent changes, newest first (My issues › Activity). */
export function myActivity(ws: Workspace) {
  const out: { id: string; issueId: string; at: string; text: string }[] = [];
  for (const i of ws.issues) { for (const a of i.history ?? []) if (a.by === ws.me) out.push({ id: a.id, issueId: i.id, at: a.at, text: activityText(a) }); for (const c of i.comments) if (c.by === ws.me) out.push({ id: c.id, issueId: i.id, at: c.at, text: "commented" }); }
  return out.sort((a, b) => b.at.localeCompare(a.at));
}

// ---- initiatives ----
export function createInitiative(ws: Workspace, name: string): { ws: Workspace; initiative: Initiative } {
  const n = name.trim(); if (!n) throw new Error("An initiative needs a name");
  const initiative: Initiative = { id: uid("ini"), name: n, description: "", status: "planned", owner: ws.me, projectIds: [], targetDate: null };
  return { ws: { ...ws, initiatives: [...(ws.initiatives ?? []), initiative] }, initiative };
}
export const updateInitiative = (ws: Workspace, id: string, patch: Partial<Omit<Initiative, "id">>): Workspace => ({ ...ws, initiatives: (ws.initiatives ?? []).map(x => (x.id === id ? { ...x, ...patch } : x)) });
export const deleteInitiative = (ws: Workspace, id: string): Workspace => ({ ...ws, initiatives: (ws.initiatives ?? []).filter(x => x.id !== id) });
export function initiativeStats(ws: Workspace, ini: Initiative) {
  const ps = ini.projectIds.map(id => ws.projects.find(p => p.id === id)).filter(Boolean) as Project[];
  const all = ps.map(p => projectStats(ws, p.id)); const total = all.reduce((n, s) => n + s.total, 0), done = all.reduce((n, s) => n + s.done, 0);
  return { projects: ps.length, active: ps.filter(p => p.status === "started").length, percent: total ? Math.round((done / total) * 100) : 0 };
}
export const updateProject = (ws: Workspace, id: string, patch: Partial<Omit<Project, "id">>): Workspace => ({ ...ws, projects: ws.projects.map(p => (p.id === id ? { ...p, ...patch } : p)) });

// ---- workspace identity ----
export const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
export const teamKeyFrom = (name: string) => (name.replace(/[^A-Za-z]/g, "").slice(0, 3) || "ENG").toUpperCase();

// ---- settings: members, labels, import/export ----
export function addMember(ws: Workspace, name: string): Workspace { const n = name.trim(); return !n || ws.members.includes(n) ? ws : { ...ws, members: [...ws.members, n] }; }
/** Removing a member unassigns their issues (and project leads); you can't remove yourself. */
export function removeMember(ws: Workspace, name: string): Workspace {
  if (name === ws.me) return ws;
  return { ...ws, members: ws.members.filter(m => m !== name), issues: ws.issues.map(i => (i.assignee === name ? { ...i, assignee: null } : i)), projects: ws.projects.map(p => (p.lead === name ? { ...p, lead: null } : p)) };
}
export function renameLabel(ws: Workspace, from: string, to: string): Workspace {
  const n = to.trim(); if (!n || n === from || ws.labels.some(l => l.toLowerCase() === n.toLowerCase() && l !== from)) return ws;
  const r = (ls: string[]) => ls.map(l => (l === from ? n : l));
  return { ...ws, labels: r(ws.labels), issues: ws.issues.map(i => (i.labels.includes(from) ? { ...i, labels: r(i.labels) } : i)) };
}
export const deleteLabel = (ws: Workspace, label: string): Workspace => ({ ...ws, labels: ws.labels.filter(l => l !== label), issues: ws.issues.map(i => (i.labels.includes(label) ? { ...i, labels: i.labels.filter(l => l !== label) } : i)) });
export const addLabel = (ws: Workspace, label: string): Workspace => { const n = label.trim(); return !n || ws.labels.some(l => l.toLowerCase() === n.toLowerCase()) ? ws : { ...ws, labels: [...ws.labels, n] }; };
const csvCell = (v: unknown) => { const s = v == null ? "" : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
export function issuesCsv(ws: Workspace): string {
  const head = ["ID", "Title", "Status", "Priority", "Assignee", "Labels", "Project", "Cycle", "Estimate", "Due date", "Parent", "Created", "Completed", "Description"];
  const rows = [...ws.issues].sort((a, b) => a.number - b.number).map(i => [identifier(ws, i), i.title, statusInfo(i.status).label, priorityLabel(i.priority), i.assignee ?? "", i.labels.join("; "), ws.projects.find(p => p.id === i.projectId)?.name ?? "",
    ws.cycles.find(c => c.id === i.cycleId)?.number ?? "", i.estimate ?? "", i.dueDate ?? "", (() => { const p = ws.issues.find(x => x.id === i.parentId); return p ? identifier(ws, p) : ""; })(), i.createdAt, i.completedAt ?? "", i.description]);
  return [head, ...rows].map(r => r.map(csvCell).join(",")).join("\n") + "\n";
}
/** Validate a JSON backup before it replaces the workspace. Throws a readable error. */
export function parseBackup(text: string): Workspace {
  let w: Workspace; try { w = JSON.parse(text); } catch { throw new Error("That file isn't valid JSON."); }
  const ok = w && typeof w === "object" && typeof w.teamKey === "string" && typeof w.me === "string" && Array.isArray(w.issues) && Array.isArray(w.projects) && Array.isArray(w.cycles) && Array.isArray(w.members) && Array.isArray(w.labels);
  if (!ok) throw new Error("That file isn't a LinearIsDead workspace export.");
  return normalizeWorkspace(w);
}
