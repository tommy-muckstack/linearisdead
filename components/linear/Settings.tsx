"use client";
// Settings, laid out like the original: Account (Preferences, Profile, Notifications, Security & access),
// Workspace (General, Members, Labels, Import / export) and the team's settings. Every control changes something real.
import Link from "next/link";
import { useRef, useState } from "react";
import { STATUSES, addLabel, addMember, deleteLabel, issuesCsv, parseBackup, removeMember, renameLabel, renameMember, slugify, type Workspace } from "@/lib/linear/model";
import type { FirebaseClientConfig } from "@/lib/isdead-auth/config";
import { BP } from "@/lib/basepath";
import { Avatar, StatusIcon } from "./ui";

export const SETTINGS: [string, string, string][] = [
  ["Account", "preferences", "Preferences"], ["Account", "account", "Profile"], ["Account", "notifications", "Notifications"], ["Account", "security", "Security & access"],
  ["Workspace", "workspace", "General"], ["Workspace", "members", "Members"], ["Workspace", "labels", "Labels"], ["Workspace", "import-export", "Import / export"],
  ["Teams", "team", "Team"],
];
export const settingsTitle = (s?: string) => SETTINGS.find(x => x[1] === (s || "preferences"))?.[2];

type Props = { ws: Workspace; section: string; commit: (w: Workspace, msg?: string) => void; replace: (w: Workspace | null) => void; email: string; guest: boolean; demo: boolean; firebase: FirebaseClientConfig | null };
const Row = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => <div className="lin-set__row"><div><b>{label}</b>{hint && <p className="ids-muted">{hint}</p>}</div><div className="lin-set__ctl">{children}</div></div>;
const SignInPrompt = ({ what }: { what: string }) => <div className="lin-set__prompt" data-testid="signin-prompt"><p>{what} needs an account.</p><a className="ids-btn ids-btn--primary ids-btn--sm" href={`${BP}/login?callbackUrl=${encodeURIComponent(BP + "/app/settings/security")}`}>Sign in</a></div>;
function download(name: string, type: string, body: string) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([body], { type })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }
/** Text input that saves on blur or Enter. */
function Save({ value, onSave, label, placeholder, transform }: { value: string; onSave: (v: string) => void; label: string; placeholder?: string; transform?: (v: string) => string }) {
  const [v, setV] = useState(value);
  return <input className="ids-input lin-set__in" aria-label={label} placeholder={placeholder} value={v} onChange={e => setV(transform ? transform(e.target.value) : e.target.value)} onBlur={() => v.trim() && v !== value ? onSave(v.trim()) : setV(value)} onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); if (e.key === "Escape") { setV(value); e.stopPropagation(); } }} />;
}

export function SettingsView({ ws, section, commit, replace, email, guest, demo, firebase }: Props) {
  const s = section || "preferences";
  const [newMember, setNewMember] = useState(""), [newLabel, setNewLabel] = useState(""), [confirm, setConfirm] = useState(""), [msg, setMsg] = useState(""), [err, setErr] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const n = { status: true, assignee: true, comments: true, other: true, ...ws.notify };
  const body = (() => { switch (s) {
    case "preferences": return <>
      <Row label="Default home view" hint="Where /app opens."><select aria-label="Default home view" value={ws.homeView ?? "active"} onChange={e => commit({ ...ws, homeView: e.target.value as Workspace["homeView"] }, "Home view saved")}><option value="active">Active issues</option><option value="my">My issues</option><option value="inbox">Inbox</option></select></Row>
      <Row label="Auto-assign to self" hint="New issues you create are assigned to you unless you pick someone else."><input type="checkbox" role="switch" aria-label="Auto-assign to self" checked={!!ws.autoAssign} onChange={e => commit({ ...ws, autoAssign: e.target.checked }, e.target.checked ? "New issues will be assigned to you" : "Auto-assign off")} /></Row>
    </>;
    case "account": return <>
      <Row label="Display name" hint="How you appear on issues, comments and assignments in this workspace."><Save label="Display name" value={ws.me} onSave={v => { if (ws.members.includes(v)) { setErr("Someone in this workspace already has that name."); return; } setErr(""); commit(renameMember(ws, ws.me, v), "Name updated"); }} /></Row>
      <Row label="Email">{guest ? <span className="ids-muted">Guest, no email</span> : <span data-testid="account-email">{demo ? "demo@yourappisdead.com" : email}</span>}</Row>
      {guest && <SignInPrompt what="Keeping this workspace on your account" />}
    </>;
    case "notifications": return <>
      <p className="ids-muted lin-set__lead">Choose what lands in your Inbox when teammates change issues you created, are assigned to or commented on.</p>
      {([["status", "Status changes"], ["assignee", "Assignments"], ["comments", "Comments"], ["other", "Other changes (priority, labels, dates, estimates…)"]] as const).map(([k, l]) =>
        <Row key={k} label={l}><input type="checkbox" role="switch" aria-label={l} checked={n[k]} onChange={e => commit({ ...ws, notify: { ...n, [k]: e.target.checked } }, "Notification settings saved")} /></Row>)}
    </>;
    case "security": return guest ? <SignInPrompt what="Password and session settings" /> : <>
      <Row label="Password" hint="We email a link to set a new password. Accounts that use Google sign in through Google instead.">
        <button className="ids-btn ids-btn--outline ids-btn--sm" disabled={demo || !firebase} onClick={async () => { setErr(""); setMsg(""); try { const { resetPassword } = await import("@/lib/isdead-auth/client"); await resetPassword(firebase!, email); setMsg(`Reset link sent to ${email}.`); } catch (e) { setErr((e as Error).message); } }}>Send password reset email</button></Row>
      <Row label="Sessions" hint="Sign out here and on every other device. Your workspace stays in this browser."><form method="post" action={`${BP}/api/session/logout`}><button className="ids-btn ids-btn--outline ids-btn--sm">Sign out everywhere</button></form></Row>
      {demo && <p className="ids-muted">The demo account has no password to reset.</p>}
    </>;
    case "workspace": return <>
      <Row label="Workspace name"><Save label="Workspace name" value={ws.workspaceName ?? "My workspace"} onSave={v => commit({ ...ws, workspaceName: v }, "Workspace renamed")} /></Row>
      <Row label="Workspace URL" hint={`yourappisdead.com${BP}/${ws.urlKey ?? ""} opens this workspace.`}><Save label="Workspace URL" value={ws.urlKey ?? ""} transform={slugify} onSave={v => commit({ ...ws, urlKey: slugify(v) }, "URL updated")} /></Row>
      <div className="lin-set__danger"><b>Delete workspace</b><p className="ids-muted">Removes every issue, project, cycle and setting from this browser. Export a backup first.</p>
        <div className="lin-set__ctl"><input className="ids-input lin-set__in" aria-label="Type DELETE to confirm" placeholder="Type DELETE to confirm" value={confirm} onChange={e => setConfirm(e.target.value)} />
          <button className="ids-btn ids-btn--sm lin-set__del" disabled={confirm !== "DELETE"} onClick={() => replace(null)}>Delete workspace</button></div></div>
    </>;
    case "members": return <>
      <form className="lin-set__add" onSubmit={e => { e.preventDefault(); if (!newMember.trim()) return; if (ws.members.includes(newMember.trim())) { setErr("Already a member."); return; } setErr(""); commit(addMember(ws, newMember), "Member added"); setNewMember(""); }}>
        <input className="ids-input lin-set__in" aria-label="New member name or email" placeholder="Name or email" value={newMember} onChange={e => setNewMember(e.target.value)} /><button className="ids-btn ids-btn--primary ids-btn--sm">Add member</button></form>
      <p className="ids-muted lin-set__lead">Members can be assigned issues and lead projects. LinearIsDead doesn&apos;t send invite emails.</p>
      <ul className="lin-set__list" data-testid="members">{ws.members.map(m => <li key={m}><Avatar name={m} /><span>{m}{m === ws.me && <em className="ids-muted"> (you)</em>}</span><span className="ids-muted">{ws.issues.filter(i => i.assignee === m).length} issues</span>
        {m !== ws.me && <button className="iconbtn" aria-label={`Remove ${m}`} onClick={() => commit(removeMember(ws, m), `${m} removed`)}>Remove</button>}</li>)}</ul>
    </>;
    case "labels": return <>
      <form className="lin-set__add" onSubmit={e => { e.preventDefault(); if (!newLabel.trim()) return; commit(addLabel(ws, newLabel), "Label created"); setNewLabel(""); }}>
        <input className="ids-input lin-set__in" aria-label="New label name" placeholder="New label" value={newLabel} onChange={e => setNewLabel(e.target.value)} /><button className="ids-btn ids-btn--primary ids-btn--sm">Create label</button></form>
      <ul className="lin-set__list" data-testid="labels">{ws.labels.map(l => <li key={l}><Save label={`Rename ${l}`} value={l} onSave={v => commit(renameLabel(ws, l, v), "Label renamed")} /><span className="ids-muted">{ws.issues.filter(i => i.labels.includes(l)).length} issues</span>
        <button className="iconbtn" aria-label={`Delete label ${l}`} onClick={() => commit(deleteLabel(ws, l), `Label ${l} deleted`)}>Delete</button></li>)}</ul>
    </>;
    case "import-export": return <>
      <Row label="Export everything" hint="A JSON backup of the whole workspace: issues, projects, cycles, initiatives, views and settings."><button className="ids-btn ids-btn--outline ids-btn--sm" onClick={() => download(`${ws.urlKey || "workspace"}-${new Date().toISOString().slice(0, 10)}.json`, "application/json", JSON.stringify(ws, null, 2))}>Export JSON</button></Row>
      <Row label="Export issues as CSV" hint="One row per issue, for spreadsheets."><button className="ids-btn ids-btn--outline ids-btn--sm" onClick={() => download(`${ws.teamKey.toLowerCase()}-issues.csv`, "text/csv", issuesCsv(ws))}>Export CSV</button></Row>
      <Row label="Import a backup" hint="Replaces this workspace with a JSON export. You can undo with ⌘Z.">
        <input ref={file} type="file" accept="application/json,.json" aria-label="Import JSON backup" onChange={async e => { const f = e.target.files?.[0]; if (!f) return; setErr(""); try { commit(parseBackup(await f.text()), "Workspace imported"); } catch (x) { setErr((x as Error).message); } if (file.current) file.current.value = ""; }} /></Row>
    </>;
    case "team": return <>
      <Row label="Team name"><Save label="Team name" value={ws.teamName} onSave={v => commit({ ...ws, teamName: v }, "Team renamed")} /></Row>
      <Row label="Identifier" hint="Prefix for issue IDs. Changing it renames every issue ID."><Save label="Identifier" value={ws.teamKey} transform={v => v.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 5)} onSave={v => commit({ ...ws, teamKey: v }, `Issues are now ${v}-…`)} /></Row>
      <Row label="Triage" hint="Review new issues before they reach the team's backlog."><input type="checkbox" role="switch" aria-label="Enable triage" checked={ws.triageEnabled !== false} onChange={e => commit({ ...ws, triageEnabled: e.target.checked }, e.target.checked ? "Triage on" : "Triage off")} /></Row>
      <Row label="Cycle length" hint="Applies to cycles created from now on."><select aria-label="Cycle length" value={ws.cycleDays} onChange={e => commit({ ...ws, cycleDays: +e.target.value }, "Cycle length saved")}>{[7, 14, 21, 28].map(d => <option key={d} value={d}>{d / 7} week{d > 7 ? "s" : ""}</option>)}</select></Row>
      <Row label="Estimates" hint="The scale shown when estimating issues."><select aria-label="Estimate scale" value={ws.estimateScale ?? "fibonacci"} onChange={e => commit({ ...ws, estimateScale: e.target.value as Workspace["estimateScale"] }, "Estimate scale saved")}><option value="fibonacci">Fibonacci (1, 2, 3, 5, 8)</option><option value="linear">Linear (1–5)</option><option value="exponential">Exponential (1, 2, 4, 8, 16)</option><option value="tshirt">T-shirt (XS–XL)</option></select></Row>
      <h3 className="lin-pane__h">Workflow</h3>
      <ul className="lin-set__list">{STATUSES.map(st => <li key={st.id}><StatusIcon status={st.id} /><span>{st.label}</span><span className="ids-muted">{ws.issues.filter(i => i.status === st.id).length} issues</span></li>)}</ul>
    </>;
    default: return null;
  } })();
  return <div className="lin-set" data-testid="settings">
    <h2 className="lin-set__h">{settingsTitle(s)}</h2>
    {body ?? <p className="ids-muted">This settings page doesn&apos;t exist. <Link href="/app/settings">Back to settings</Link></p>}
    {err && <p role="alert" className="lin-set__err">{err}</p>}{msg && <p role="status" className="lin-set__ok">{msg}</p>}
  </div>;
}
