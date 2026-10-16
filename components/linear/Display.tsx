"use client";
// Display options menu (layout, grouping, sub-grouping, ordering, toggles, visible properties) and the saved Views page.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DISPLAY_PROPS, GROUPINGS, ORDERINGS, filterIssues, type Display, type SavedView, type Workspace } from "@/lib/linear/model";

export function DisplayMenu({ d, onChange }: { d: Display; onChange: (p: Partial<Display>) => void }) {
  const [open, setOpen] = useState(false); const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!open) return;
    const down = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); setOpen(false); } };
    document.addEventListener("mousedown", down); window.addEventListener("keydown", key, true);
    return () => { document.removeEventListener("mousedown", down); window.removeEventListener("keydown", key, true); }; }, [open]);
  const sel = (label: string, value: string, opts: [string, string][], set: (v: string) => void, disabled = false) => <label className="lin-dm__row"><span>{label}</span><select aria-label={label} value={value} disabled={disabled} onChange={e => set(e.target.value)}>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>;
  const tog = (label: string, on: boolean, set: (v: boolean) => void) => <label className="lin-dm__row"><span>{label}</span><input type="checkbox" role="switch" aria-label={label} checked={on} onChange={e => set(e.target.checked)} /></label>;
  return <div className="lin-dm" ref={ref}>
    <button className="lin-dm__btn" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(o => !o)} data-testid="display-btn">Display</button>
    {open && <div className="lin-dm__pop" role="dialog" aria-label="Display options">
      <div className="lin-seg lin-dm__seg" role="group" aria-label="Layout"><button className={d.layout === "list" ? "on" : ""} aria-pressed={d.layout === "list"} onClick={() => onChange({ layout: "list" })}>List</button><button className={d.layout === "board" ? "on" : ""} aria-pressed={d.layout === "board"} onClick={() => onChange({ layout: "board" })}>Board</button></div>
      {sel("Grouping", d.layout === "board" ? "status" : d.group, GROUPINGS, v => onChange({ group: v as Display["group"] }), d.layout === "board")}
      {sel("Sub-grouping", d.subGroup, [["none", "No sub-grouping"], ...GROUPINGS.filter(([g]) => g !== "none" && g !== d.group)], v => onChange({ subGroup: v as Display["subGroup"] }), d.layout === "board")}
      {sel("Ordering", d.order, ORDERINGS, v => onChange({ order: v as Display["order"] }))}
      {tog("Show sub-issues", d.showSub, v => onChange({ showSub: v }))}
      {tog("Show empty groups", d.showEmpty, v => onChange({ showEmpty: v }))}
      <div className="lin-dm__h">Display properties</div>
      <div className="lin-dm__props">{DISPLAY_PROPS.map(([k, l]) => <button key={k} aria-pressed={d.props.includes(k)} className={d.props.includes(k) ? "on" : ""} onClick={() => onChange({ props: d.props.includes(k) ? d.props.filter(x => x !== k) : [...d.props, k] })}>{l}</button>)}</div>
    </div>}
  </div>;
}

/** Name prompt for "Save view". */
export function SaveViewDialog({ filter, onSave, onClose }: { filter: string; onSave: (name: string) => void; onClose: () => void }) {
  const [name, setName] = useState("");
  return <div className="lin-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <form className="lin-modal lin-savev" role="dialog" aria-label="Save view" onSubmit={e => { e.preventDefault(); if (name.trim()) onSave(name); }} onKeyDown={e => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } }}>
      <div className="ids-muted" style={{ fontSize: 12 }}>Save view</div>
      <input autoFocus className="lin-modal__title" aria-label="View name" placeholder="View name" value={name} onChange={e => setName(e.target.value)} />
      <p className="ids-muted" style={{ fontSize: 12, margin: 0 }}>Filter: <code>{filter || "all issues"}</code> · keeps the current display options</p>
      <footer><span style={{ flex: 1 }} /><button type="button" className="ids-btn ids-btn--ghost ids-btn--sm" onClick={onClose}>Cancel</button><button className="ids-btn ids-btn--primary ids-btn--sm" disabled={!name.trim()}>Save view</button></footer>
    </form></div>;
}

export function ViewsPage({ ws, onCreate, onUpdate, onDelete }: { ws: Workspace; onCreate: (name: string, filter: string) => void; onUpdate: (id: string, p: Partial<SavedView>) => void; onDelete: (id: string) => void }) {
  const [name, setName] = useState(""), [filter, setFilter] = useState(""); const views = ws.views ?? [];
  const team = ws.issues.filter(i => i.status !== "triage");
  return <div className="lin-projects" data-testid="views">
    <form className="lin-newproj" onSubmit={e => { e.preventDefault(); if (name.trim()) { onCreate(name, filter); setName(""); setFilter(""); } }}>
      <input className="ids-input" aria-label="New view name" placeholder="View name" value={name} onChange={e => setName(e.target.value)} />
      <input className="ids-input" aria-label="New view filter" placeholder="Filter, e.g. label:bug is:open" value={filter} onChange={e => setFilter(e.target.value)} />
      <button className="ids-btn ids-btn--primary" disabled={!name.trim()}>New view</button></form>
    {!views.length ? <p className="ids-muted" style={{ padding: "8px 4px" }}>No saved views yet. Create one here, or type a filter on any issue list and press <b>Save view</b>.</p>
      : <div className="lin-ptable"><div className="lin-ptable__hd lin-vrow"><span>Name</span><span>Filter</span><span>Issues</span><span /></div>
        {views.map(v => <div key={v.id} className="lin-prow lin-vrow" data-testid="view-row">
          <span><button className={"lin-star" + (v.favorite ? " on" : "")} aria-label={v.favorite ? `Remove ${v.name} from favorites` : `Add ${v.name} to favorites`} aria-pressed={v.favorite} onClick={() => onUpdate(v.id, { favorite: !v.favorite })}>★</button> <Link href={`/app/view/${v.id}`} className="lin-prow__name">{v.name}</Link></span>
          <code className="ids-muted">{v.filter || "all issues"}</code><span>{filterIssues(ws, v.filter, team).length}</span>
          <button className="iconbtn" aria-label={`Delete view ${v.name}`} onClick={() => onDelete(v.id)}>Delete</button></div>)}</div>}
  </div>;
}
