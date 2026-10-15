"use client";
import { useEffect, useState } from "react";
import { identifier, priorityLabel, statusInfo, type Issue, type IssueInput, type Workspace } from "@/lib/linear/model";
import { Avatar, PriorityIcon, StatusIcon, fmtDate } from "./ui";

export type Field = "status" | "priority" | "assignee" | "labels" | "project" | "cycle" | "estimate";
export function IssuePane({ ws, issue, onUpdate, onComment, onDelete, onClose, openPicker }: { ws: Workspace; issue: Issue; onUpdate: (p: IssueInput) => void; onComment: (b: string) => void; onDelete: () => void; onClose: () => void; openPicker: (f: Field) => void }) {
  const [title, setTitle] = useState(issue.title), [desc, setDesc] = useState(issue.description), [cmt, setCmt] = useState("");
  useEffect(() => { setTitle(issue.title); setDesc(issue.description); }, [issue.id, issue.title, issue.description]);
  const project = ws.projects.find(p => p.id === issue.projectId); const cycle = ws.cycles.find(c => c.id === issue.cycleId);
  const prop = (f: Field, label: string, key: string, body: React.ReactNode) => <button className="lin-prop" onClick={() => openPicker(f)} data-testid={`prop-${f}`}><span className="ids-muted">{label}</span><span className="lin-prop__v">{body}</span><kbd className="lin-kbd">{key}</kbd></button>;
  return <aside className="lin-pane" data-testid="issue-pane" aria-label={`Issue ${identifier(ws, issue)}`}>
    <header className="lin-pane__hd"><span className="lin-row__id">{identifier(ws, issue)}</span><span className="ids-muted" style={{ fontSize: 12 }}>Created {fmtDate(issue.createdAt)}</span>
      <span style={{ flex: 1 }} /><button className="iconbtn" onClick={onDelete} aria-label="Delete issue">Delete</button><button className="iconbtn" onClick={onClose} aria-label="Close">✕</button></header>
    <div className="lin-pane__body">
      <input className="lin-pane__title" aria-label="Title" value={title} onChange={e => setTitle(e.target.value)} onBlur={() => title.trim() !== issue.title && onUpdate({ title })} onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); if (e.key === "Escape") { e.stopPropagation(); (e.target as HTMLInputElement).blur(); } }} />
      <textarea className="lin-pane__desc" aria-label="Description" placeholder="Add description…" value={desc} onChange={e => setDesc(e.target.value)} onBlur={() => desc !== issue.description && onUpdate({ description: desc })} onKeyDown={e => { if (e.key === "Escape") { e.stopPropagation(); (e.target as HTMLTextAreaElement).blur(); } }} />
      <h4 className="lin-pane__h">Activity</h4>
      <ul className="lin-comments">{issue.comments.map(c => <li key={c.id}><Avatar name={c.by} /><div><b>{c.by}</b> <span className="ids-muted">{fmtDate(c.at)}</span><p>{c.body}</p></div></li>)}</ul>
      <form onSubmit={e => { e.preventDefault(); onComment(cmt); setCmt(""); }} className="lin-cmtform"><input className="ids-input" aria-label="Leave a comment" placeholder="Leave a comment…" value={cmt} onChange={e => setCmt(e.target.value)} onKeyDown={e => { if (e.key === "Escape") { e.stopPropagation(); (e.target as HTMLInputElement).blur(); } }} /><button className="ids-btn ids-btn--outline ids-btn--sm">Comment</button></form>
    </div>
    <div className="lin-pane__props">
      {prop("status", "Status", "S", <><StatusIcon status={issue.status} /> {statusInfo(issue.status).label}</>)}
      {prop("priority", "Priority", "P", <><PriorityIcon priority={issue.priority} /> {priorityLabel(issue.priority)}</>)}
      {prop("assignee", "Assignee", "A", <><Avatar name={issue.assignee} /> {issue.assignee ?? "Unassigned"}</>)}
      {prop("labels", "Labels", "L", issue.labels.length ? issue.labels.map(l => <span key={l} className="lin-tag">{l}</span>) : "Add label")}
      {prop("project", "Project", "R", project?.name ?? "No project")}
      {prop("cycle", "Cycle", "U", cycle ? `Cycle ${cycle.number}` : "No cycle")}
      {prop("estimate", "Estimate", "E", issue.estimate != null ? `${issue.estimate} points` : "No estimate")}
    </div>
  </aside>;
}
