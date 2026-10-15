import { describe, it, expect } from "vitest";
import { addComment, burnup, createIssue, createProject, currentCycle, cycleStats, deleteIssues, emptyWorkspace, ensureCycles, filterIssues, groupIssues, identifier, parseFilter, parseQuickCreate, projectStats, rollOver, updateIssue } from "@/lib/linear/model";
import { seedWorkspace } from "@/lib/linear/seed";
const NOW = new Date("2026-10-14T15:00:00Z");
const base = () => ensureCycles(emptyWorkspace("Tommy"), NOW);
describe("issues", () => {
  it("numbers issues sequentially per team", () => {
    let ws = base(); ws = createIssue(ws, { title: "A" }, NOW).ws; const r = createIssue(ws, { title: "B" }, NOW);
    expect(identifier(r.ws, r.issue)).toBe("ENG-2"); expect(r.ws.issues[0].title).toBe("B");
  });
  it("rejects blank titles", () => expect(() => createIssue(base(), { title: "  " })).toThrow());
  it("stamps completedAt when moved to Done and clears it when reopened", () => {
    const { ws, issue } = createIssue(base(), { title: "x" }, NOW);
    const done = updateIssue(ws, issue.id, { status: "done" }, NOW); expect(done.issues[0].completedAt).toBe(NOW.toISOString());
    expect(updateIssue(done, issue.id, { status: "todo" }, NOW).issues[0].completedAt).toBeNull();
  });
  it("keeps the old title when edited to blank", () => {
    const { ws, issue } = createIssue(base(), { title: "Keep me" }, NOW); expect(updateIssue(ws, issue.id, { title: "   " }).issues[0].title).toBe("Keep me");
  });
  it("adds new labels to the workspace palette", () => {
    const { ws } = createIssue(base(), { title: "x", labels: ["Infra"] }, NOW); expect(ws.labels).toContain("Infra");
  });
  it("comments and deletes", () => {
    const { ws, issue } = createIssue(base(), { title: "x" }, NOW); const c = addComment(ws, issue.id, " hello ", NOW);
    expect(c.issues[0].comments[0]).toMatchObject({ body: "hello", by: "Tommy" }); expect(addComment(c, issue.id, "  ").issues[0].comments).toHaveLength(1);
    expect(deleteIssues(c, [issue.id]).issues).toHaveLength(0);
  });
});
describe("quick create", () => {
  const ws = { ...emptyWorkspace("Tommy"), members: ["Tommy", "Ada Lovelace"], projects: [] as any[] };
  const pj = createProject(ws, "Billing v2");
  it("parses priority, assignee, labels, estimate and status", () => {
    const r = parseQuickCreate("Fix the login redirect !urgent @me #bug ~3 /progress", { ...pj.ws });
    expect(r).toMatchObject({ title: "Fix the login redirect", priority: 1, assignee: "Tommy", labels: ["Bug"], estimate: 3, status: "in_progress" });
  });
  it("matches members by prefix and projects by slug", () => {
    const r = parseQuickCreate("Invoice math @ada +billing", { ...pj.ws }); expect(r.assignee).toBe("Ada Lovelace"); expect(r.projectId).toBe(pj.project.id);
  });
  it("leaves unknown @mentions in the title", () => expect(parseQuickCreate("ping @zed now", pj.ws).title).toBe("ping @zed now"));
});
describe("filters", () => {
  const ws = seedWorkspace("Tommy", NOW);
  it("parses tokens", () => expect(parseFilter("login status:todo,in_progress priority:high")).toMatchObject({ text: "login", status: ["todo", "in_progress"], priority: [2] }));
  it("filters by assignee:me and is:open", () => {
    const r = filterIssues(ws, "assignee:me is:open", ws.issues, NOW); expect(r.length).toBeGreaterThan(0); expect(r.every(i => i.assignee === "Tommy" && !["done", "canceled"].includes(i.status))).toBe(true);
  });
  it("filters by cycle:current and label", () => {
    const r = filterIssues(ws, "cycle:current label:bug", ws.issues, NOW); expect(r.length).toBeGreaterThan(0); expect(r.every(i => i.cycleId === currentCycle(ws, NOW)!.id && i.labels.includes("Bug"))).toBe(true);
  });
  it("text matches identifiers and titles", () => { expect(filterIssues(ws, "ENG-1 ", ws.issues, NOW).length).toBeGreaterThan(0); expect(filterIssues(ws, "invoice", ws.issues, NOW)[0].title).toMatch(/Invoice/); });
  it("groups by status in board order and sorts by priority", () => {
    const g = groupIssues(ws, ws.issues, "status"); expect(g.map(x => x.key).slice(0, 3)).toEqual(["backlog", "todo", "in_progress"]);
    const todo = g.find(x => x.key === "todo")!.issues; expect(todo[0].priority).toBeLessThanOrEqual(todo[todo.length - 1].priority || 9);
  });
});
describe("cycles", () => {
  it("creates a current and a next cycle", () => {
    const ws = base(); const cur = currentCycle(ws, NOW); expect(cur).toBeTruthy(); expect(ws.cycles.some(c => new Date(c.startsAt) > NOW)).toBe(true);
    expect((+new Date(cur!.endsAt) - +new Date(cur!.startsAt)) / 86_400_000).toBe(14);
  });
  it("advances cycles as time passes without gaps", () => {
    const later = new Date(NOW.getTime() + 40 * 86_400_000); const ws = ensureCycles(base(), later); expect(currentCycle(ws, later)).toBeTruthy();
    const s = [...ws.cycles].sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt)); for (let i = 1; i < s.length; i++) expect(s[i].startsAt).toBe(s[i - 1].endsAt);
    expect(new Set(ws.cycles.map(c => c.number)).size).toBe(ws.cycles.length);
  });
  it("computes progress from estimates and ignores canceled issues", () => {
    let ws = base(); const cyc = currentCycle(ws, NOW)!;
    ws = createIssue(ws, { title: "a", cycleId: cyc.id, estimate: 3, status: "done" }, NOW).ws; ws = createIssue(ws, { title: "b", cycleId: cyc.id, estimate: 1, status: "in_progress" }, NOW).ws; ws = createIssue(ws, { title: "c", cycleId: cyc.id, estimate: 8, status: "canceled" }, NOW).ws;
    expect(cycleStats(ws, cyc.id)).toMatchObject({ scope: 4, completed: 3, started: 1, percent: 75, count: 2 });
  });
  it("rolls unfinished issues into the next cycle", () => {
    const ws = seedWorkspace("Tommy", NOW); const cur = currentCycle(ws, NOW)!; const next = ws.cycles.find(c => c.id !== cur.id && new Date(c.startsAt) > NOW)!;
    const open = ws.issues.filter(i => i.cycleId === cur.id && !["done", "canceled"].includes(i.status)).length; const r = rollOver(ws, cur.id, next.id);
    expect(r.moved).toBe(open); expect(r.ws.issues.filter(i => i.cycleId === cur.id).every(i => i.status === "done")).toBe(true);
  });
  it("burn-up is monotonic and never exceeds scope", () => {
    const ws = seedWorkspace("Tommy", NOW); const cyc = currentCycle(ws, NOW)!; const { points } = burnup(ws, cyc, NOW);
    expect(points.length).toBeGreaterThan(0); for (let i = 1; i < points.length; i++) expect(points[i].completed).toBeGreaterThanOrEqual(points[i - 1].completed);
    for (const p of points) expect(p.completed).toBeLessThanOrEqual(p.scope);
  });
});
describe("projects", () => {
  it("reports completion percentage", () => {
    const ws = seedWorkspace("Tommy", NOW); const p = ws.projects[0]; const s = projectStats(ws, p.id);
    expect(s.total).toBeGreaterThan(0); expect(s.percent).toBe(Math.round((s.done / s.total) * 100));
  });
});
describe("seed", () => {
  it("builds a cycle that is already underway so the burn-up has a line", () => {
    const ws = seedWorkspace("Tommy", NOW); const cyc = currentCycle(ws, NOW)!; expect(burnup(ws, cyc, NOW).points.length).toBeGreaterThanOrEqual(6);
    expect(cycleStats(ws, cyc.id).completed).toBeGreaterThan(0);
  });
});
