"use client";
import { useEffect, useState } from "react";
import { activityText, identifier, isOverdue, priorityLabel, statusInfo, subIssues, subProgress, type Issue, type IssueInput, type Workspace } from "@/lib/linear/model";
import { Avatar, PriorityIcon, StatusIcon, fmtDate, fmtDay } from "./ui";
import { estimateLabel } from "./estimates";

export type Field = "status" | "priority" | "assignee" | "labels" | "project" | "cycle" | "estimate" | "due" | "parent";
type Props = { ws: Workspace; issue: Issue; onUpdate: (p: IssueInput) => void; onComment: (b: string) => void; onDelete: () => void; onClose: () => void; openPicker: (f: Field) => void; onOpen: (id: string) => void; onAddSub: () => void };
export function IssuePane({ ws, issue, onUpdate, onComment, onDelete, onClose, openPicker, onOpen, onAddSub }: Props) {
  const [title, setTitle] = useState(issue.title), [desc, setDesc] = useState(issue.description), [cmt, setCmt] = useState("");
  useEffect(() => { setTitle(issue.title); setDesc(issue.description); }, [issue.id, issue.title, issue.description]);
  const project = ws.projects.find(p => p.id === issue.projectId); const cycle = ws.cycles.find(c => c.id === issue.cycleId);
  const parent = ws.issues.find(i => i.id === issue.parentId); const subs = subIssues(ws, issue.id); const prog = subProgress(ws, issue.id);
  const prop = (f: Field, label: string, key: string, body: React.ReactNode) => <button className="lin-prop" onClick={() => openPicker(f)} data-testid={`prop-${f}`}><span className="ids-muted">{label}</span><span className="lin-prop__v">{body}</span><kbd className="lin-kbd">{key}</kbd></button>;
  // comments and recorded changes on one timeline, oldest first
  const timeline = [...(issue.history ?? []).map(a => ({ at: a.at, k: "a" as const, a })), ...issue.comments.map(c => ({ at: c.at, k: "c" as const, c }))].sort((x, y) => x.at.localeCompare(y.at));
  return <aside className="lin-pane" data-testid="issue-pane" aria-label={`Issue ${identifier(ws, issue)}`}>
    <header className="lin-pane__hd"><span className="lin-row__id">{identifier(ws, issue)}</span><span className="ids-muted" style={{ fontSize: 12 }}>Created {fmtDate(issue.createdAt)}{issue.creator ? ` by ${issue.creator}` : ""}</span>
      <span style={{ flex: 1 }} /><button className="iconbtn" onClick={onDelete} aria-label="Delete issue">Delete</button><button className="iconbtn" onClick={onClose} aria-label="Close">✕</button></header>
    <div className="lin-pane__body">
      {parent && <button className="lin-parent" onClick={() => onOpen(parent.id)} data-testid="parent-link">Sub-issue of <b>{identifier(ws, parent)}</b> {parent.title}</button>}
      <input className="lin-pane__title" aria-label="Title" value={title} onChange={e => setTitle(e.target.value)} onBlur={() => title.trim() !== issue.title && onUpdate({ title })} onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); if (e.key === "Escape") { e.stopPropagation(); (e.target as HTMLInputElement).blur(); } }} />
      <textarea className="lin-pane__desc" aria-label="Description" placeholder="Add description…" value={desc} onChange={e => setDesc(e.target.value)} onBlur={() => desc !== issue.description && onUpdate({ description: desc })} onKeyDown={e => { if (e.key === "Escape") { e.stopPropagation(); (e.target as HTMLTextAreaElement).blur(); } }} />
      <section className="lin-subs" data-testid="sub-issues">
        <h4 className="lin-pane__h">Sub-issues {prog.total > 0 && <span className="ids-muted">{prog.done}/{prog.total}</span>}<button className="iconbtn" onClick={onAddSub} data-testid="add-sub">＋ Add sub-issue</button></h4>
        {subs.map(s => <button key={s.id} className="lin-subrow" onClick={() => onOpen(s.id)} data-testid="sub-row"><StatusIcon status={s.status} /><span className="lin-row__id">{identifier(ws, s)}</span><span>{s.title}</span><Avatar name={s.assignee} /></button>)}
      </section>
      <h4 className="lin-pane__h">Activity</h4>
      <ul className="lin-activity" data-testid="activity">{timeline.map(t => t.k === "a"
        ? <li key={t.a.id} className="lin-act" data-kind={t.a.kind}><span className="lin-act__dot" /><span><b>{t.a.by || "Someone"}</b> {activityText(t.a)} <span className="ids-muted">· {fmtDate(t.a.at)}</span></span></li>
        : <li key={t.c.id} className="lin-cmt"><Avatar name={t.c.by} /><div><b>{t.c.by}</b> <span className="ids-muted">{fmtDate(t.c.at)}</span><p>{t.c.body}</p></div></li>)}</ul>
      <form onSubmit={e => { e.preventDefault(); onComment(cmt); setCmt(""); }} className="lin-cmtform"><input className="ids-input" aria-label="Leave a comment" placeholder="Leave a comment…" value={cmt} onChange={e => setCmt(e.target.value)} onKeyDown={e => { if (e.key === "Escape") { e.stopPropagation(); (e.target as HTMLInputElement).blur(); } }} /><button className="ids-btn ids-btn--outline ids-btn--sm">Comment</button></form>
    </div>
    <div className="lin-pane__props">
      {prop("status", "Status", "S", <><StatusIcon status={issue.status} /> {statusInfo(issue.status).label}</>)}
      {prop("priority", "Priority", "P", <><PriorityIcon priority={issue.priority} /> {priorityLabel(issue.priority)}</>)}
      {prop("assignee", "Assignee", "A", <><Avatar name={issue.assignee} /> {issue.assignee ?? "Unassigned"}</>)}
      {prop("labels", "Labels", "L", issue.labels.length ? issue.labels.map(l => <span key={l} className="lin-tag">{l}</span>) : "Add label")}
      {prop("project", "Project", "R", project?.name ?? "No project")}
      {prop("cycle", "Cycle", "U", cycle ? `Cycle ${cycle.number}` : "No cycle")}
      {prop("estimate", "Estimate", "E", issue.estimate != null ? estimateLabel(ws, issue.estimate) : "No estimate")}
      {prop("due", "Due date", "⇧D", issue.dueDate ? <span className={isOverdue(issue) ? "lin-overdue" : ""}>{fmtDay(issue.dueDate)}</span> : "No due date")}
      {prop("parent", "Parent", "⇧P", parent ? identifier(ws, parent) : "No parent")}
    </div>
  </aside>;
}
