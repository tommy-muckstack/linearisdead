import { describe, expect, it } from "vitest";
import { activityText, asMember, createIssue, createProject, deleteIssues, emptyWorkspace, ensureCycles, isOverdue, normalizeIssue, subIssues, subProgress, updateIssue, type Issue } from "@/lib/linear/model";
const NOW = new Date("2026-10-14T15:00:00Z");
const base = () => ensureCycles({ ...emptyWorkspace("Me"), members: ["Me", "Design lead"] }, NOW);
describe("activity log", () => {
  it("records creation, status, priority, assignee, labels, estimate, due date and project changes", () => {
    let ws = base(); const pj = createProject(ws, "Billing"); ws = pj.ws;
    const { ws: w1, issue } = createIssue(ws, { title: "Fix it", labels: ["Bug"] }, NOW);
    const w2 = updateIssue(w1, issue.id, { status: "in_review", priority: 2, assignee: "Design lead", labels: ["Feature"], estimate: 3, dueDate: "2026-10-24", projectId: pj.project.id }, NOW);
    const h = w2.issues[0].history.map(a => activityText(a));
    expect(h).toEqual(["created the issue", "changed status from Todo to In Review", "set priority to High", "assigned the issue to Design lead", "added label Feature", "removed label Bug", "moved the issue to project Billing", "set the estimate to 3 points", "set the due date to Oct 24"]);
    expect(w2.issues[0].history.every(a => a.by === "Me")).toBe(true);
  });
  it("attributes changes to whoever made them", () => {
    const { ws, issue } = createIssue(base(), { title: "x" }, NOW);
    const w = asMember(ws, "Design lead", x => updateIssue(x, issue.id, { status: "done" }, NOW));
    expect(w.issues[0].history.at(-1)).toMatchObject({ by: "Design lead", kind: "status", to: "Done" }); expect(w.me).toBe("Me");
  });
  it("records nothing when nothing changed", () => {
    const { ws, issue } = createIssue(base(), { title: "x", priority: 2 }, NOW);
    expect(updateIssue(ws, issue.id, { priority: 2 }, NOW).issues[0].history).toHaveLength(1);
  });
});
describe("sub-issues", () => {
  it("links children, reports progress and survives parent deletion", () => {
    let ws = base(); const p = createIssue(ws, { title: "Parent" }, NOW); ws = p.ws;
    ws = createIssue(ws, { title: "A", parentId: p.issue.id, status: "done" }, NOW).ws; ws = createIssue(ws, { title: "B", parentId: p.issue.id }, NOW).ws;
    expect(subIssues(ws, p.issue.id).map(i => i.title)).toEqual(["A", "B"]); expect(subProgress(ws, p.issue.id)).toEqual({ total: 2, done: 1 });
    const after = deleteIssues(ws, [p.issue.id]); expect(after.issues.every(i => i.parentId === null)).toBe(true);
  });
  it("refuses parent loops", () => {
    let ws = base(); const a = createIssue(ws, { title: "A" }, NOW); ws = a.ws; const b = createIssue(ws, { title: "B", parentId: a.issue.id }, NOW); ws = b.ws;
    expect(updateIssue(ws, a.issue.id, { parentId: b.issue.id }, NOW).issues.find(i => i.id === a.issue.id)!.parentId).toBeNull();
    expect(updateIssue(ws, a.issue.id, { parentId: a.issue.id }, NOW).issues.find(i => i.id === a.issue.id)!.parentId).toBeNull();
  });
});
describe("due dates and old data", () => {
  it("flags open overdue issues only", () => {
    expect(isOverdue({ dueDate: "2026-10-01", status: "todo" }, NOW)).toBe(true);
    expect(isOverdue({ dueDate: "2026-10-01", status: "done" }, NOW)).toBe(false);
    expect(isOverdue({ dueDate: "2026-12-01", status: "todo" }, NOW)).toBe(false);
  });
  it("upgrades issues saved before history existed", () => {
    const old = { id: "x", number: 1, title: "t", description: "", status: "todo", priority: 0, assignee: null, labels: [], projectId: null, cycleId: null, estimate: null, createdAt: NOW.toISOString(), updatedAt: NOW.toISOString(), completedAt: null, comments: [] } as unknown as Issue;
    const n = normalizeIssue(old); expect(n).toMatchObject({ dueDate: null, parentId: null }); expect(n.history[0].kind).toBe("created");
  });
});
