"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { PRIORITIES, STATUSES, currentCycle, identifier, parseQuickCreate, type IssueInput, type Workspace } from "@/lib/linear/model";
import { ESTIMATES } from "./estimates";

/** Multi-select for labels: tick existing ones or type a new name and press Enter. */
function LabelPicker({ all, value, onChange }: { all: string[]; value: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false), [q, setQ] = useState(""); const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!open) return; const f = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); }; document.addEventListener("mousedown", f); return () => document.removeEventListener("mousedown", f); }, [open]);
  const list = all.filter(l => l.toLowerCase().includes(q.toLowerCase()));
  const toggle = (l: string) => onChange(value.includes(l) ? value.filter(x => x !== l) : [...value, l]);
  const exact = all.some(l => l.toLowerCase() === q.trim().toLowerCase());
  return <div className="lin-lpick" ref={ref}>
    <button type="button" className="lin-chip" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(o => !o)} data-testid="create-labels">{value.length ? value.join(", ") : "Labels"}</button>
    {open && <div className="lin-lpick__pop" role="listbox" aria-label="Labels" aria-multiselectable>
      <input autoFocus placeholder="Find or create a label…" aria-label="Find or create a label" value={q} onChange={e => setQ(e.target.value)}
        onKeyDown={e => { if (e.key === "Escape") { e.stopPropagation(); setOpen(false); } if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); const n = q.trim(); if (!n) return; toggle(all.find(l => l.toLowerCase() === n.toLowerCase()) ?? n); setQ(""); } }} />
      {list.map(l => <label key={l} role="option" aria-selected={value.includes(l)}><input type="checkbox" checked={value.includes(l)} onChange={() => toggle(l)} /> {l}</label>)}
      {q.trim() && !exact && <button type="button" onClick={() => { toggle(q.trim()); setQ(""); }}>Create label “{q.trim()}”</button>}
    </div>}
  </div>;
}

export function CreateModal({ ws, initial, onCreate, onClose }: { ws: Workspace; initial?: IssueInput; onCreate: (i: IssueInput, more: boolean) => void; onClose: () => void }) {
  const [text, setText] = useState(initial?.title ?? ""); const [desc, setDesc] = useState("");
  const [o, setO] = useState<IssueInput>({ status: "todo", labels: [], ...initial }); const ref = useRef<HTMLInputElement>(null);
  useEffect(() => ref.current?.focus(), []);
  const parsed = useMemo(() => parseQuickCreate(text, ws), [text, ws]);
  const labels = [...new Set([...(o.labels ?? []), ...(parsed.labels ?? [])])];
  const merged: IssueInput = { ...o, ...Object.fromEntries(Object.entries(parsed).filter(([k, v]) => k !== "title" && v !== undefined)), labels, title: parsed.title, description: desc };
  const submit = (more: boolean) => { if (!merged.title?.trim()) return; onCreate(merged, more); if (more) { setText(""); setDesc(""); ref.current?.focus(); } };
  const sel = (label: string, value: string, set: (v: string) => void, opts: [string, string][]) => <label className="lin-sel"><span className="ids-muted">{label}</span><select aria-label={label} value={value} onChange={e => set(e.target.value)}>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>;
  const cur = currentCycle(ws); const parent = ws.issues.find(i => i.id === o.parentId);
  return <div className="lin-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <form className="lin-modal" role="dialog" aria-label="New issue" onSubmit={e => { e.preventDefault(); submit(false); }} onKeyDown={e => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit(e.shiftKey); } }}>
      <div className="ids-muted" style={{ fontSize: 12 }}>{parent ? <>New sub-issue of {identifier(ws, parent)} · {parent.title}</> : <>New issue · {ws.teamKey}</>}</div>
      <input ref={ref} className="lin-modal__title" aria-label="Issue title" placeholder="Issue title" value={text} onChange={e => setText(e.target.value)} />
      <textarea className="lin-modal__desc" aria-label="Issue description" placeholder="Add description…" value={desc} onChange={e => setDesc(e.target.value)} />
      <p className="ids-muted" style={{ fontSize: 12, margin: 0 }}>Shortcuts in the title: <code>!urgent</code> <code>@me</code> <code>#bug</code> <code>+project</code> <code>~3</code> <code>/progress</code></p>
      <div className="lin-modal__props">
        {sel("Status", merged.status ?? "todo", v => setO({ ...o, status: v as IssueInput["status"] }), STATUSES.map(s => [s.id, s.label]))}
        {sel("Priority", String(merged.priority ?? 0), v => setO({ ...o, priority: +v as IssueInput["priority"] }), PRIORITIES.map(p => [String(p.id), p.label]))}
        {sel("Assignee", merged.assignee ?? "", v => setO({ ...o, assignee: v || null }), [["", "Unassigned"], ...ws.members.map(m => [m, m] as [string, string])])}
        <LabelPicker all={[...new Set([...ws.labels, ...labels])]} value={labels} onChange={v => { setO({ ...o, labels: v }); if (parsed.labels?.some(l => !v.includes(l))) setText(text.split(/\s+/).filter(w => !(w.startsWith("#") && !v.some(l => l.toLowerCase() === w.slice(1).toLowerCase()))).join(" ")); }} />
        {sel("Estimate", merged.estimate == null ? "" : String(merged.estimate), v => setO({ ...o, estimate: v ? +v : null }), [["", "No estimate"], ...ESTIMATES(ws).map(([n, l]) => [String(n), l] as [string, string])])}
        <label className="lin-sel"><span className="ids-muted">Due</span><input type="date" aria-label="Due date" value={merged.dueDate ?? ""} onChange={e => setO({ ...o, dueDate: e.target.value || null })} /></label>
        {sel("Project", merged.projectId ?? "", v => setO({ ...o, projectId: v || null }), [["", "No project"], ...ws.projects.map(p => [p.id, p.name] as [string, string])])}
        {sel("Cycle", merged.cycleId ?? "", v => setO({ ...o, cycleId: v || null }), [["", "No cycle"], ...ws.cycles.filter(c => +new Date(c.endsAt) > Date.now()).map(c => [c.id, `Cycle ${c.number}${c.id === cur?.id ? " (current)" : ""}`] as [string, string])])}
        {sel("Parent", o.parentId ?? "", v => setO({ ...o, parentId: v || null }), [["", "No parent issue"], ...ws.issues.slice(0, 300).map(i => [i.id, `${identifier(ws, i)} ${i.title.slice(0, 40)}`] as [string, string])])}
      </div>
      <footer><span className="ids-muted" style={{ fontSize: 12, flex: 1 }}>⌘↵ create · ⇧⌘↵ create more · esc cancel</span><button type="button" className="ids-btn ids-btn--ghost ids-btn--sm" onClick={onClose}>Cancel</button><button className="ids-btn ids-btn--primary ids-btn--sm" data-testid="create-submit">Create issue</button></footer>
    </form></div>;
}
