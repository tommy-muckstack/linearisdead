"use client";
import { useState } from "react";

type C = 0 | 1 | string;
export function LnMobileCompare({ plans, groups }: { plans: string[]; groups: [string, [string, C, C, C, C][]][] }) {
  const [p, setP] = useState(0);
  const cell = (c: C) => c === 1 ? <svg width="16" height="16" viewBox="0 0 16 16" aria-label="Included"><circle cx="8" cy="8" r="8" fill="#e6e8ec" /><path d="M4.6 8.2l2.3 2.3 4.5-4.8" stroke="#0b0c0e" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
    : c === 0 ? <svg width="12" height="12" viewBox="0 0 12 12" aria-label="Not included"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="#6c7078" strokeWidth="1.4" strokeLinecap="round" /></svg>
      : <><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><circle cx="8" cy="8" r="8" fill="#e6e8ec" /><path d="M4.6 8.2l2.3 2.3 4.5-4.8" stroke="#0b0c0e" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg><span>{c}</span></>;
  return <><div className="mcmp">
    <label className="msel"><select value={p} onChange={(e) => setP(Number(e.target.value))} aria-label="Compare plan">{plans.map((n, i) => <option key={n} value={i}>{n}</option>)}</select><b>{plans[p]}</b><svg width="12" height="14" viewBox="0 0 12 14" aria-hidden><path d="M3 5l3-3 3 3M3 9l3 3 3-3" stroke="#8a8f98" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></label>
    {groups.map(([g, rows]) => <div key={g || "top"} className="mg">{g && <h4>{g}</h4>}{rows.map((r) => <div key={r[0]} className="mr"><span>{r[0]}</span><em>{cell(r[p + 1])}</em></div>)}</div>)}
    <a className="mgo">{p === 3 ? "Contact sales" : "Get started"}</a>
  </div><a className="mdoc">View docs</a></>;
}
