"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { STATUSES, type Priority, type Status } from "@/lib/linear/model";

export function StatusIcon({ status, size = 14 }: { status: Status; size?: number }) {
  const s = STATUSES.find(x => x.id === status)!; const c = s.color; const r = 5.5;
  return <svg width={size} height={size} viewBox="0 0 14 14" aria-label={s.label} role="img" style={{ flex: "none" }}>
    {status === "triage" && <><circle cx="7" cy="7" r="6.2" fill={c} /><path d="M4.2 7h5.6M8 5.2 9.8 7 8 8.8" fill="none" stroke="#08090A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></>}
    {status === "backlog" && <circle cx="7" cy="7" r={r} fill="none" stroke={c} strokeWidth="1.5" strokeDasharray="2 2" />}
    {status === "todo" && <circle cx="7" cy="7" r={r} fill="none" stroke={c} strokeWidth="1.5" />}
    {(status === "in_progress" || status === "in_review") && <><circle cx="7" cy="7" r={r} fill="none" stroke={c} strokeWidth="1.5" /><path d={status === "in_progress" ? "M7 7 L7 3 A4 4 0 0 1 7 11 Z" : "M7 7 L7 3 A4 4 0 1 1 3 7 Z"} fill={c} /></>}
    {status === "done" && <><circle cx="7" cy="7" r="6.2" fill={c} /><path d="M4.3 7.2 6.3 9.2 9.8 5" fill="none" stroke="#08090A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>}
    {status === "canceled" && <><circle cx="7" cy="7" r="6.2" fill={c} /><path d="M4.8 4.8 9.2 9.2M9.2 4.8 4.8 9.2" stroke="#08090A" strokeWidth="1.5" strokeLinecap="round" /></>}
  </svg>;
}
export function PriorityIcon({ priority, size = 14 }: { priority: Priority; size?: number }) {
  if (priority === 1) return <svg width={size} height={size} viewBox="0 0 14 14" aria-label="Urgent" role="img"><rect x="1" y="1" width="12" height="12" rx="3" fill="#F2994A" /><path d="M7 3.8v4M7 9.4v.8" stroke="#08090A" strokeWidth="1.6" strokeLinecap="round" /></svg>;
  const lit = priority === 0 ? 0 : 5 - priority; // high=3 medium=2 low=1
  return <svg width={size} height={size} viewBox="0 0 14 14" aria-label={["No priority", "", "High", "Medium", "Low"][priority]} role="img">
    {priority === 0 ? <path d="M2 7h2.5M5.8 7h2.5M9.6 7H12" stroke="#6C707A" strokeWidth="1.6" strokeLinecap="round" />
      : [0, 1, 2].map(i => <rect key={i} x={2 + i * 4} y={9 - i * 3} width="2.6" height={3 + i * 3} rx=".8" fill={i < lit ? "#C9CCD3" : "#3A3D45"} />)}</svg>;
}
export const initials = (n: string | null) => n ? n.split(/\s+/).map(x => x[0]).slice(0, 2).join("").toUpperCase() : "";
const hue = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 7);
export function Avatar({ name, size = 18 }: { name: string | null; size?: number }) {
  if (!name) return <span className="lin-avatar lin-avatar--none" style={{ width: size, height: size }} aria-label="Unassigned" />;
  return <span className="lin-avatar" title={name} style={{ width: size, height: size, background: `hsl(${hue(name)} 45% 38%)`, fontSize: size * 0.48 }}>{initials(name)}</span>;
}
export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

export type Opt = { id: string; label: string; icon?: React.ReactNode; hint?: string; checked?: boolean };
/** Keyboard-driven picker: type to filter, ↑/↓ to move, Enter to pick, Esc to close. */
export function Picker({ title, options, multi, onPick, onClose }: { title: string; options: Opt[]; multi?: boolean; onPick: (id: string) => void; onClose: () => void }) {
  const [q, setQ] = useState(""); const [i, setI] = useState(0); const ref = useRef<HTMLInputElement>(null);
  useEffect(() => ref.current?.focus(), []);
  const list = useMemo(() => options.filter(o => o.label.toLowerCase().includes(q.toLowerCase())), [options, q]);
  const pick = (o?: Opt) => { if (!o) return; onPick(o.id); if (!multi) onClose(); };
  return <div className="lin-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="lin-pop" role="dialog" aria-label={title}>
      <input ref={ref} className="lin-pop__q" placeholder={`${title}…`} value={q} onChange={e => { setQ(e.target.value); setI(0); }}
        onKeyDown={e => { if (e.key === "ArrowDown") { e.preventDefault(); setI(x => Math.min(x + 1, list.length - 1)); } else if (e.key === "ArrowUp") { e.preventDefault(); setI(x => Math.max(0, x - 1)); }
          else if (e.key === "Enter") { e.preventDefault(); pick(list[i]); } else if (e.key === "Escape") { e.preventDefault(); onClose(); } }} />
      <ul role="listbox">{list.map((o, n) => <li key={o.id} role="option" aria-selected={n === i} className={n === i ? "on" : ""} onMouseEnter={() => setI(n)} onClick={() => pick(o)}>
        {o.icon}<span>{o.label}</span>{multi && o.checked && <b className="lin-check">✓</b>}{o.hint && <kbd>{o.hint}</kbd>}</li>)}
        {!list.length && <li className="lin-empty">No matches</li>}</ul>
    </div></div>;
}
export const Kbd = ({ children }: { children: React.ReactNode }) => <kbd className="lin-kbd">{children}</kbd>;
/** "2026-10-24" → "Oct 24" (calendar day, no timezone shift). */
export const fmtDay = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
