"use client";
import { useState } from "react";
import { burnup, cycleIssues, cycleStats, identifier, projectStats, groupIssues, type Cycle, type Group, type Issue, type Project, type Status, type Workspace, STATUSES, currentCycle } from "@/lib/linear/model";
import { Avatar, PriorityIcon, StatusIcon, fmtDate } from "./ui";

export type RowProps = { ws: Workspace; focusId: string | null; selected: Set<string>; onFocus: (id: string) => void; onSelect: (id: string) => void; onOpen: (id: string) => void };

export function IssueRow({ ws, issue, focusId, selected, onFocus, onSelect, onOpen }: RowProps & { issue: Issue }) {
  const project = ws.projects.find(p => p.id === issue.projectId);
  return <div className={"lin-row" + (focusId === issue.id ? " is-focus" : "") + (selected.has(issue.id) ? " is-sel" : "")} data-testid="issue-row" data-id={issue.id} data-ident={identifier(ws, issue)} aria-selected={focusId === issue.id}
    onMouseEnter={() => onFocus(issue.id)} onClick={() => onOpen(issue.id)}>
    <button className="lin-row__box" aria-label={`Select ${identifier(ws, issue)}`} aria-pressed={selected.has(issue.id)} onClick={e => { e.stopPropagation(); onSelect(issue.id); }}>{selected.has(issue.id) ? "✓" : ""}</button>
    <PriorityIcon priority={issue.priority} /><span className="lin-row__id">{identifier(ws, issue)}</span><StatusIcon status={issue.status} />
    <span className="lin-row__title">{issue.title}</span>
    {issue.labels.map(l => <span key={l} className="lin-tag">{l}</span>)}
    {project && <span className="lin-row__proj">{project.name}</span>}
    {issue.estimate != null && <span className="lin-row__est">{issue.estimate}</span>}
    <span className="lin-row__date">{fmtDate(issue.createdAt)}</span><Avatar name={issue.assignee} />
  </div>;
}

export function IssueList({ groups, rp, onCreateIn }: { groups: Group[]; rp: RowProps; onCreateIn: (status?: string) => void }) {
  const total = groups.reduce((n, g) => n + g.issues.length, 0);
  if (!total) return <div className="lin-emptystate" data-testid="empty"><h3>No issues here</h3><p className="ids-muted">Press <kbd className="lin-kbd">C</kbd> to create one, or loosen the filter.</p></div>;
  return <div data-testid="issue-list">{groups.map(g => <section key={g.key} className="lin-group" data-group={g.key}>
    <header className="lin-group__hd">{STATUSES.some(s => s.id === g.key) && <StatusIcon status={g.key as Status} />}<b>{g.label}</b><span className="ids-muted">{g.issues.length}</span>
      <button className="lin-plus" aria-label={`Add issue to ${g.label}`} onClick={() => onCreateIn(g.key)}>+</button></header>
    {g.issues.map(i => <IssueRow key={i.id} issue={i} {...rp} />)}</section>)}</div>;
}

export function Board({ ws, issues, rp, onMove, onCreateIn }: { ws: Workspace; issues: Issue[]; rp: RowProps; onMove: (id: string, s: Status) => void; onCreateIn: (s: string) => void }) {
  const [over, setOver] = useState<string | null>(null);
  const groups = groupIssues(ws, issues, "status", true);
  return <div className="lin-board" data-testid="board">{groups.map(g => <section key={g.key} className={"lin-col" + (over === g.key ? " is-over" : "")} data-col={g.key}
    onDragOver={e => { e.preventDefault(); setOver(g.key); }} onDragLeave={() => setOver(null)} onDrop={e => { e.preventDefault(); setOver(null); const id = e.dataTransfer.getData("text/plain"); if (id) onMove(id, g.key as Status); }}>
    <header className="lin-group__hd"><StatusIcon status={g.key as Status} /><b>{g.label}</b><span className="ids-muted">{g.issues.length}</span><button className="lin-plus" aria-label={`Add issue to ${g.label}`} onClick={() => onCreateIn(g.key)}>+</button></header>
    {g.issues.map(i => <article key={i.id} draggable data-testid="card" data-id={i.id} className={"lin-card" + (rp.focusId === i.id ? " is-focus" : "") + (rp.selected.has(i.id) ? " is-sel" : "")}
      onDragStart={e => e.dataTransfer.setData("text/plain", i.id)} onMouseEnter={() => rp.onFocus(i.id)} onClick={() => rp.onOpen(i.id)}>
      <div className="lin-card__top"><span className="lin-row__id">{identifier(ws, i)}</span><Avatar name={i.assignee} /></div>
      <div className="lin-card__title">{i.title}</div>
      <div className="lin-card__meta"><PriorityIcon priority={i.priority} />{i.labels.map(l => <span key={l} className="lin-tag">{l}</span>)}{i.estimate != null && <span className="lin-row__est">{i.estimate}</span>}</div>
    </article>)}</section>)}</div>;
}

function Progress({ pct, color = "var(--ids-color-accent)" }: { pct: number; color?: string }) {
  return <div className="lin-progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><i style={{ width: pct + "%", background: color }} /></div>;
}

export function BurnChart({ ws, cycle }: { ws: Workspace; cycle: Cycle }) {
  const { points, totalDays } = burnup(ws, cycle); const W = 560, H = 160, P = 24;
  const max = Math.max(1, ...points.map(p => p.scope)); const x = (d: number) => P + (d / Math.max(1, totalDays)) * (W - 2 * P); const y = (v: number) => H - P - (v / max) * (H - 2 * P);
  const line = (k: "scope" | "completed") => [{ day: -1, scope: points[0]?.scope ?? 0, completed: 0 }, ...points].map((p, i) => `${i ? "L" : "M"}${x(p.day + 1).toFixed(1)},${y(p[k]).toFixed(1)}`).join(" ");
  return <svg className="lin-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Cycle burn-up chart" data-testid="burnup">
    <line x1={P} y1={H - P} x2={W - P} y2={H - P} stroke="var(--ids-color-border)" /><line x1={P} y1={P / 2} x2={P} y2={H - P} stroke="var(--ids-color-border)" />
    <path d={`M${x(0)},${y(0)} L${x(totalDays)},${y(max)}`} stroke="var(--ids-color-text-subtle)" strokeDasharray="4 4" fill="none" />
    <path d={line("scope")} stroke="#6C707A" strokeWidth="2" fill="none" /><path d={line("completed")} stroke="var(--ids-color-accent)" strokeWidth="2.5" fill="none" />{points.map(p => <circle key={p.day} cx={x(p.day + 1)} cy={y(p.completed)} r="3" fill="var(--ids-color-accent)" />)}
    <text x={W - P} y={P} textAnchor="end" fontSize="11" fill="var(--ids-color-text-muted)">scope {points.at(-1)?.scope ?? 0} · done {points.at(-1)?.completed ?? 0}</text></svg>;
}

export function CyclesView({ ws, selectedId, onSelect, rp, onRoll }: { ws: Workspace; selectedId: string | null; onSelect: (id: string) => void; rp: RowProps; onRoll: (from: string, to: string) => void }) {
  const cur = currentCycle(ws); const sorted = [...ws.cycles].sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt));
  const sel = ws.cycles.find(c => c.id === (selectedId ?? cur?.id)) ?? cur; const next = sel ? ws.cycles.filter(c => +new Date(c.startsAt) >= +new Date(sel.endsAt)).sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))[0] : undefined;
  const label = (c: Cycle) => c.id === cur?.id ? "Current" : +new Date(c.startsAt) > Date.now() ? "Upcoming" : "Completed";
  return <div className="lin-cycles" data-testid="cycles">
    <aside className="lin-cycles__list">{sorted.map(c => { const s = cycleStats(ws, c.id); return <button key={c.id} className={"lin-cyc" + (sel?.id === c.id ? " on" : "")} onClick={() => onSelect(c.id)} data-testid="cycle-item">
      <b>Cycle {c.number}</b><span className="ids-muted">{fmtDate(c.startsAt)} → {fmtDate(c.endsAt)}</span><span className={"lin-tag lin-tag--" + label(c).toLowerCase()}>{label(c)}</span><Progress pct={s.percent} /></button>; })}</aside>
    {sel && <section className="lin-cycles__main">
      <header><h2 className="ids-h2" style={{ fontSize: 22, margin: 0 }}>Cycle {sel.number}</h2><span className="ids-muted">{fmtDate(sel.startsAt)} → {fmtDate(sel.endsAt)}</span>
        {next && label(sel) !== "Upcoming" && <button className="ids-btn ids-btn--outline ids-btn--sm" onClick={() => onRoll(sel.id, next.id)} data-testid="rollover">Roll unfinished into Cycle {next.number}</button>}</header>
      {(() => { const s = cycleStats(ws, sel.id); return <div className="lin-stats" data-testid="cycle-stats"><div><b>{s.scope}</b><span>Scope</span></div><div><b>{s.started}</b><span>Started</span></div><div><b>{s.completed}</b><span>Completed</span></div><div><b>{s.percent}%</b><span>Done</span></div></div>; })()}
      {label(sel) !== "Upcoming" && <BurnChart ws={ws} cycle={sel} />}
      <IssueList groups={groupIssues(ws, cycleIssues(ws, sel.id), "status")} rp={rp} onCreateIn={() => {}} />
    </section>}
  </div>;
}

export function ProjectsView({ ws, onNew, onStatus, onOpen }: { ws: Workspace; onNew: (name: string) => void; onStatus: (id: string, s: Project["status"]) => void; onOpen: (id: string) => void }) {
  const [name, setName] = useState("");
  return <div className="lin-projects" data-testid="projects">
    <form className="lin-newproj" onSubmit={e => { e.preventDefault(); if (name.trim()) { onNew(name); setName(""); } }}><input className="ids-input" aria-label="New project name" placeholder="New project name" value={name} onChange={e => setName(e.target.value)} /><button className="ids-btn ids-btn--primary">Create project</button></form>
    <div className="lin-ptable"><div className="lin-ptable__hd"><span>Name</span><span>Status</span><span>Lead</span><span>Progress</span></div>
      {ws.projects.map(p => { const s = projectStats(ws, p.id); return <div key={p.id} className="lin-prow" data-testid="project-row">
        <button className="lin-prow__name" onClick={() => onOpen(p.id)}>{p.name}</button>
        <select aria-label={`Status of ${p.name}`} value={p.status} onChange={e => onStatus(p.id, e.target.value as Project["status"])}>{["planned", "started", "paused", "completed"].map(x => <option key={x}>{x}</option>)}</select>
        <span><Avatar name={p.lead} /> {p.lead}</span><span className="lin-prow__prog"><Progress pct={s.percent} /><span className="ids-muted">{s.percent}% · {s.done}/{s.total}</span></span></div>; })}
      {!ws.projects.length && <p className="ids-muted" style={{ padding: 24 }}>No projects yet. Name one above.</p>}</div></div>;
}
