"use client";
// Inbox, My issues tabs, Triage, Teams, Initiatives, Roadmap and the in-app 404.
import Link from "next/link";
import { useState } from "react";
import { identifier, inbox, initiativeStats, myActivity, projectStats, type Initiative, type Issue, type Project, type Workspace } from "@/lib/linear/model";
import { Avatar, StatusIcon, fmtDate, fmtDay } from "./ui";
import { IssueRow, type RowProps } from "./Views";

const ago = (iso: string) => { const m = Math.round((Date.now() - +new Date(iso)) / 60_000); return m < 1 ? "just now" : m < 60 ? `${m}m ago` : m < 1440 ? `${Math.round(m / 60)}h ago` : fmtDate(iso); };

export function InboxView({ ws, filter, onOpen, onRead, onHide }: { ws: Workspace; filter: "all" | "unread"; onOpen: (issueId: string, nid: string) => void; onRead: (ids: string[]) => void; onHide: (ids: string[]) => void }) {
  const all = inbox(ws); const list = filter === "unread" ? all.filter(n => !n.read) : all; const unread = all.filter(n => !n.read);
  return <div className="lin-inbox" data-testid="inbox">
    <div className="lin-tabs" role="tablist"><Link role="tab" aria-selected={filter === "all"} className={filter === "all" ? "on" : ""} href="/app/inbox">All</Link><Link role="tab" aria-selected={filter === "unread"} className={filter === "unread" ? "on" : ""} href="/app/inbox/unread">Unread{unread.length ? ` ${unread.length}` : ""}</Link>
      <span style={{ flex: 1 }} /><button className="iconbtn" disabled={!unread.length} onClick={() => onRead(unread.map(n => n.id))}>Mark all as read</button><button className="iconbtn" disabled={!all.some(n => n.read)} onClick={() => onHide(all.filter(n => n.read).map(n => n.id))}>Delete all read</button></div>
    {!list.length ? <div className="lin-emptystate"><h3>{filter === "unread" ? "You're all caught up" : "No notifications"}</h3><p className="ids-muted">Changes and comments by teammates on issues you created, are assigned to or commented on show up here.</p></div>
      : list.map(n => { const i = ws.issues.find(x => x.id === n.issueId); if (!i) return null;
        return <div key={n.id} className={"lin-note" + (n.read ? "" : " unread")} data-testid="notification">
          <button className="lin-note__main" onClick={() => onOpen(i.id, n.id)}><span className="lin-note__dot" aria-label={n.read ? "Read" : "Unread"} /><Avatar name={n.by} />
            <span className="lin-note__txt"><b>{identifier(ws, i)} {i.title}</b><span><b>{n.by}</b> {n.text}</span></span><span className="ids-muted lin-note__at">{ago(n.at)}</span></button>
          <button className="iconbtn" aria-label="Delete notification" onClick={() => onHide([n.id])}>✕</button></div>; })}
  </div>;
}

export const MY_TABS = [["", "Assigned"], ["created", "Created"], ["subscribed", "Subscribed"], ["activity", "Activity"]] as const;
export function MyTabs({ tab }: { tab: string }) {
  return <div className="lin-tabs" role="tablist" data-testid="my-tabs">{MY_TABS.map(([k, l]) => <Link key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} href={"/app/my" + (k ? "/" + k : "")}>{l}</Link>)}</div>;
}
export function MyActivity({ ws, onOpen }: { ws: Workspace; onOpen: (id: string) => void }) {
  const list = myActivity(ws).slice(0, 200);
  if (!list.length) return <div className="lin-emptystate"><h3>No activity yet</h3><p className="ids-muted">Your changes and comments appear here.</p></div>;
  return <ul className="lin-feed" data-testid="my-activity">{list.map(a => { const i = ws.issues.find(x => x.id === a.issueId)!; return <li key={a.id}><button onClick={() => onOpen(i.id)}><StatusIcon status={i.status} /><span className="lin-row__id">{identifier(ws, i)}</span><span className="lin-feed__t">{i.title}</span><span className="ids-muted">You {a.text}</span><span className="ids-muted">{ago(a.at)}</span></button></li>; })}</ul>;
}

export function TriageView({ ws, rp, list, onAccept, onDecline, onDuplicate, onNew }: { ws: Workspace; rp: RowProps; list: Issue[]; onAccept: (id: string) => void; onDecline: (id: string) => void; onDuplicate: (id: string) => void; onNew: () => void }) {
  if (ws.triageEnabled === false) return <div className="lin-emptystate"><h3>Triage is off for this team</h3><p className="ids-muted">Turn it on in <Link href="/app/settings/team">team settings</Link> to review new issues before they reach the backlog.</p></div>;
  return <div data-testid="triage">
    <p className="lin-summary ids-muted">New issues wait here for a decision. Focus one and press <kbd className="lin-kbd">1</kbd> accept, <kbd className="lin-kbd">2</kbd> decline, <kbd className="lin-kbd">3</kbd> mark as duplicate. <button className="iconbtn" onClick={onNew}>＋ File to triage</button></p>
    {!list.length ? <div className="lin-emptystate"><h3>Triage is empty</h3><p className="ids-muted">Nothing is waiting for a decision.</p></div>
      : list.map(i => <div key={i.id} className="lin-triage-row"><IssueRow issue={i} {...rp} /><div className="lin-triage-acts">
        <button className="iconbtn" onClick={() => onAccept(i.id)} data-testid="accept">Accept</button><button className="iconbtn" onClick={() => onDecline(i.id)}>Decline</button><button className="iconbtn" onClick={() => onDuplicate(i.id)}>Duplicate</button></div></div>)}
  </div>;
}

export function TeamsView({ ws }: { ws: Workspace }) {
  const open = ws.issues.filter(i => !["done", "canceled"].includes(i.status)).length;
  return <div className="lin-ptable" data-testid="teams"><div className="lin-ptable__hd lin-teams"><span>Team</span><span>Identifier</span><span>Members</span><span>Open issues</span><span>Cycle length</span></div>
    <div className="lin-prow lin-teams"><Link href="/app" className="lin-prow__name">{ws.teamName}</Link><span>{ws.teamKey}</span><span>{ws.members.length}</span><span>{open}</span><span>{ws.cycleDays} days</span></div>
    <p className="ids-muted" style={{ padding: "16px 12px", fontSize: 13 }}>Rename the team, change its identifier, cycles, estimates and triage in <Link href="/app/settings/team">team settings</Link>.</p></div>;
}

export function InitiativesView({ ws, onNew, onUpdate, onDelete }: { ws: Workspace; onNew: (name: string) => void; onUpdate: (id: string, p: Partial<Initiative>) => void; onDelete: (id: string) => void }) {
  const [name, setName] = useState(""); const list = ws.initiatives ?? [];
  return <div className="lin-projects" data-testid="initiatives">
    <form className="lin-newproj" onSubmit={e => { e.preventDefault(); if (name.trim()) { onNew(name); setName(""); } }}><input className="ids-input" aria-label="New initiative name" placeholder="New initiative name" value={name} onChange={e => setName(e.target.value)} /><button className="ids-btn ids-btn--primary">Create initiative</button></form>
    {!list.length && <p className="ids-muted" style={{ padding: 24 }}>Initiatives group projects toward a goal. Name one above.</p>}
    {list.map(ini => { const s = initiativeStats(ws, ini); const free = ws.projects.filter(p => !ini.projectIds.includes(p.id));
      return <section key={ini.id} className="lin-ini" data-testid="initiative">
        <header><b>{ini.name}</b><select aria-label={`Status of ${ini.name}`} value={ini.status} onChange={e => onUpdate(ini.id, { status: e.target.value as Initiative["status"] })}>{["planned", "active", "completed"].map(x => <option key={x}>{x}</option>)}</select>
          <span className="ids-muted">{s.projects} project{s.projects === 1 ? "" : "s"} · {s.active} active · {s.percent}% done</span>
          <label className="lin-sel"><span className="ids-muted">Target</span><input type="date" aria-label={`Target date of ${ini.name}`} value={ini.targetDate ?? ""} onChange={e => onUpdate(ini.id, { targetDate: e.target.value || null })} /></label>
          <button className="iconbtn" aria-label={`Delete ${ini.name}`} onClick={() => onDelete(ini.id)}>Delete</button></header>
        <input className="lin-ini__desc" aria-label={`Description of ${ini.name}`} placeholder="What is this initiative for?" defaultValue={ini.description} onBlur={e => e.target.value !== ini.description && onUpdate(ini.id, { description: e.target.value })} />
        <div className="lin-ini__projects">{ini.projectIds.map(id => ws.projects.find(p => p.id === id)).filter(Boolean).map(p => { const ps = projectStats(ws, p!.id); return <span key={p!.id} className="lin-tag">
          <Link href={`/app/project/${p!.id}`}>{p!.name}</Link> {ps.percent}% <button aria-label={`Remove ${p!.name}`} onClick={() => onUpdate(ini.id, { projectIds: ini.projectIds.filter(x => x !== p!.id) })}>×</button></span>; })}
          {free.length > 0 && <select aria-label={`Add project to ${ini.name}`} value="" onChange={e => e.target.value && onUpdate(ini.id, { projectIds: [...ini.projectIds, e.target.value] })}><option value="">＋ Add project</option>{free.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>}</div>
      </section>; })}
  </div>;
}

const DAY = 86_400_000;
export function RoadmapView({ ws, onDates }: { ws: Workspace; onDates: (id: string, p: Partial<Project>) => void }) {
  const dated = ws.projects.filter(p => p.startDate || p.targetDate); const undated = ws.projects.filter(p => !p.startDate && !p.targetDate);
  const now = new Date(); const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const months = Array.from({ length: 6 }, (_, n) => new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + n, 1)));
  const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 6, 1)); const span = +end - +start;
  const pct = (d: string) => Math.max(0, Math.min(100, ((+new Date(d + "T00:00:00Z") - +start) / span) * 100));
  const dateIn = (p: Project, k: "startDate" | "targetDate", label: string) => <input type="date" aria-label={`${label} of ${p.name}`} value={p[k] ?? ""} onChange={e => onDates(p.id, { [k]: e.target.value || null })} />;
  return <div className="lin-roadmap" data-testid="roadmap">
    <div className="lin-rm__grid"><div className="lin-rm__hd"><span />{months.map(m => <span key={+m}>{m.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })}</span>)}</div>
      {dated.map(p => { const s = p.startDate ?? p.targetDate!, t = p.targetDate ?? p.startDate!; const l = pct(s), r = pct(t); const st = projectStats(ws, p.id);
        return <div key={p.id} className="lin-rm__row" data-testid="roadmap-row"><Link href={`/app/project/${p.id}`} className="lin-rm__name">{p.name}<small className="ids-muted">{p.startDate ? fmtDay(p.startDate) : "?"} → {p.targetDate ? fmtDay(p.targetDate) : "?"}</small></Link>
          <div className="lin-rm__track"><i className="lin-rm__today" style={{ left: pct(new Date().toISOString().slice(0, 10)) + "%" }} /><b className={"lin-rm__bar lin-rm__bar--" + p.status} style={{ left: l + "%", width: Math.max(1.5, r - l) + "%" }} title={`${st.percent}% done`}><em style={{ width: st.percent + "%" }} /></b></div></div>; })}
      {!dated.length && <p className="ids-muted" style={{ padding: 16 }}>No project has dates yet. Set a start or target date below and it appears on the timeline.</p>}</div>
    <h3 className="lin-pane__h">Project dates</h3>
    <div className="lin-rm__dates">{ws.projects.map(p => <div key={p.id}><b>{p.name}</b><label className="lin-sel"><span className="ids-muted">Start</span>{dateIn(p, "startDate", "Start date")}</label><label className="lin-sel"><span className="ids-muted">Target</span>{dateIn(p, "targetDate", "Target date")}</label></div>)}
      {!ws.projects.length && <p className="ids-muted">Create a project first in <Link href="/app/projects">Projects</Link>.</p>}{undated.length > 0 && dated.length > 0 && <p className="ids-muted" style={{ fontSize: 12 }}>{undated.length} project{undated.length > 1 ? "s" : ""} without dates.</p>}</div>
  </div>;
}

export function AppNotFound() {
  return <div className="lin-emptystate" data-testid="app-not-found"><h3>This page doesn&apos;t exist</h3><p className="ids-muted">The link may be old or mistyped.</p><p><Link href="/app" className="ids-btn ids-btn--outline ids-btn--sm">Go to active issues</Link></p></div>;
}
export type { Issue };
