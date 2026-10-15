"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { PRIORITIES, STATUSES, currentCycle, parseQuickCreate, type IssueInput, type Workspace } from "@/lib/linear/model";

export function CreateModal({ ws, initial, onCreate, onClose }: { ws: Workspace; initial?: IssueInput; onCreate: (i: IssueInput, more: boolean) => void; onClose: () => void }) {
  const [text, setText] = useState(initial?.title ?? ""); const [desc, setDesc] = useState("");
  const [o, setO] = useState<IssueInput>({ status: "todo", ...initial }); const ref = useRef<HTMLInputElement>(null);
  useEffect(() => ref.current?.focus(), []);
  const parsed = useMemo(() => parseQuickCreate(text, ws), [text, ws]);
  const merged: IssueInput = { ...o, ...Object.fromEntries(Object.entries(parsed).filter(([k, v]) => k !== "title" && v !== undefined)), title: parsed.title, description: desc };
  const submit = (more: boolean) => { if (!merged.title?.trim()) return; onCreate(merged, more); if (more) { setText(""); setDesc(""); ref.current?.focus(); } };
  const sel = (label: string, value: string, set: (v: string) => void, opts: [string, string][]) => <label className="lin-sel"><span className="ids-muted">{label}</span><select value={value} onChange={e => set(e.target.value)}>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>;
  const cur = currentCycle(ws);
  return <div className="lin-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <form className="lin-modal" role="dialog" aria-label="New issue" onSubmit={e => { e.preventDefault(); submit(false); }} onKeyDown={e => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit(e.shiftKey); } }}>
      <div className="ids-muted" style={{ fontSize: 12 }}>New issue · {ws.teamKey}</div>
      <input ref={ref} className="lin-modal__title" aria-label="Issue title" placeholder="Issue title" value={text} onChange={e => setText(e.target.value)} />
      <textarea className="lin-modal__desc" aria-label="Issue description" placeholder="Add description…" value={desc} onChange={e => setDesc(e.target.value)} />
      <p className="ids-muted" style={{ fontSize: 12, margin: 0 }}>Shortcuts in the title: <code>!urgent</code> <code>@me</code> <code>#bug</code> <code>+project</code> <code>~3</code> <code>/progress</code></p>
      <div className="lin-modal__props">
        {sel("Status", merged.status ?? "todo", v => setO({ ...o, status: v as any }), STATUSES.map(s => [s.id, s.label]))}
        {sel("Priority", String(merged.priority ?? 0), v => setO({ ...o, priority: +v as any }), PRIORITIES.map(p => [String(p.id), p.label]))}
        {sel("Assignee", merged.assignee ?? "", v => setO({ ...o, assignee: v || null }), [["", "Unassigned"], ...ws.members.map(m => [m, m] as [string, string])])}
        {sel("Project", merged.projectId ?? "", v => setO({ ...o, projectId: v || null }), [["", "No project"], ...ws.projects.map(p => [p.id, p.name] as [string, string])])}
        {sel("Cycle", merged.cycleId ?? "", v => setO({ ...o, cycleId: v || null }), [["", "No cycle"], ...ws.cycles.filter(c => +new Date(c.endsAt) > Date.now()).map(c => [c.id, `Cycle ${c.number}${c.id === cur?.id ? " (current)" : ""}`] as [string, string])])}
      </div>
      {!!merged.labels?.length && <div className="lin-modal__tags">{merged.labels.map(l => <span key={l} className="lin-tag">{l}</span>)}</div>}
      <footer><span className="ids-muted" style={{ fontSize: 12, flex: 1 }}>⌘↵ create · ⇧⌘↵ create more · esc cancel</span><button type="button" className="ids-btn ids-btn--ghost ids-btn--sm" onClick={onClose}>Cancel</button><button className="ids-btn ids-btn--primary ids-btn--sm" data-testid="create-submit">Create issue</button></footer>
    </form></div>;
}
