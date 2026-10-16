"use client";
// First-run setup, same steps as the original: workspace (name + URL), first team, teammates, then where to start.
import { useState } from "react";
import { emptyWorkspace, ensureCycles, slugify, teamKeyFrom, type Workspace } from "@/lib/linear/model";
import { seedWorkspace } from "@/lib/linear/seed";
import { BP } from "@/lib/basepath";
import { Mark } from "@/components/Mark";

type Draft = { name: string; url: string; urlTouched: boolean; team: string; key: string; keyTouched: boolean; people: string[]; start: "empty" | "sample" };
export function buildWorkspace(me: string, d: Draft): Workspace {
  const base = d.start === "sample" ? seedWorkspace(me) : ensureCycles(emptyWorkspace(me));
  const members = [...new Set([...base.members, ...d.people.map(p => p.trim()).filter(Boolean)])];
  return { ...base, workspaceName: d.name.trim() || "My workspace", urlKey: slugify(d.url) || slugify(d.name) || "workspace", teamName: d.team.trim() || "Engineering", teamKey: (d.key.trim() || teamKeyFrom(d.team)).toUpperCase().slice(0, 5), members, triageEnabled: true };
}

export function Onboarding({ me, guest, onDone }: { me: string; guest: boolean; onDone: (ws: Workspace) => void }) {
  const [step, setStep] = useState(0); const [err, setErr] = useState(""); const [person, setPerson] = useState("");
  const [d, setD] = useState<Draft>({ name: "", url: "", urlTouched: false, team: "Engineering", key: "ENG", keyTouched: false, people: [], start: "sample" });
  const set = (p: Partial<Draft>) => { setErr(""); setD(x => ({ ...x, ...p })); };
  const skip = () => onDone(buildWorkspace(me, { ...d, name: d.name || "My workspace", start: "empty" }));
  const next = (e: React.FormEvent) => { e.preventDefault();
    if (step === 0) { if (!d.name.trim()) return setErr("Give your workspace a name."); if (!slugify(d.url || d.name)) return setErr("Use letters or numbers in the workspace URL."); }
    if (step === 1) { if (!d.team.trim()) return setErr("Name your first team."); if (!/^[A-Za-z]{1,5}$/.test(d.key.trim())) return setErr("The identifier is 1–5 letters, like ENG."); }
    if (step === 2 && person.trim()) { set({ people: [...d.people, person.trim()] }); setPerson(""); return; }
    if (step < 3) setStep(step + 1); else onDone(buildWorkspace(me, d)); };
  const addPerson = () => { const p = person.trim(); if (!p) return; if (d.people.includes(p) || p === me) return setErr("Already added."); set({ people: [...d.people, p] }); setPerson(""); };
  const titles = ["Create a new workspace", "Create your first team", "Invite your teammates", "How do you want to start?"];
  const subs = ["Workspaces are shared environments where teams work on projects, cycles and issues.", "Teams own issues, cycles and triage. Their identifier prefixes every issue, like ENG-12.", "Add the people you work with so you can assign them issues. LinearIsDead doesn't send invite emails.", "Start from a clean slate or explore a sample workspace first. You can change everything later."];
  return <div className="lin-onb" data-testid="onboarding">
    <form className="lin-onb__card" onSubmit={next} noValidate>
      <div className="lin-onb__mark"><Mark size={30} /></div>
      <ol className="lin-onb__steps" aria-label="Setup steps">{titles.map((t, n) => <li key={t} className={n === step ? "on" : n < step ? "done" : ""} aria-current={n === step ? "step" : undefined} />)}</ol>
      <h1>{titles[step]}</h1><p className="ids-muted">{subs[step]}</p>
      {step === 0 && <>
        <label htmlFor="onb-name">Workspace name</label><input id="onb-name" autoFocus value={d.name} placeholder="Acme" onChange={e => set({ name: e.target.value, url: d.urlTouched ? d.url : slugify(e.target.value) })} />
        <label htmlFor="onb-url">Workspace URL</label><div className="lin-onb__url"><span>yourappisdead.com{BP}/</span><input id="onb-url" value={d.url} placeholder="acme" onChange={e => set({ url: e.target.value, urlTouched: true })} /></div>
      </>}
      {step === 1 && <>
        <label htmlFor="onb-team">Team name</label><input id="onb-team" autoFocus value={d.team} onChange={e => set({ team: e.target.value, key: d.keyTouched ? d.key : teamKeyFrom(e.target.value) })} />
        <label htmlFor="onb-key">Identifier</label><input id="onb-key" value={d.key} maxLength={5} onChange={e => set({ key: e.target.value.toUpperCase(), keyTouched: true })} />
        <p className="ids-muted" style={{ fontSize: 12 }}>Issues will look like {(d.key || "ENG").toUpperCase()}-1.</p>
      </>}
      {step === 2 && <>
        <label htmlFor="onb-person">Name or email</label>
        <div className="lin-onb__row"><input id="onb-person" autoFocus value={person} placeholder="teammate@example.com" onChange={e => { setPerson(e.target.value); setErr(""); }} /><button type="button" className="ids-btn ids-btn--outline ids-btn--sm" onClick={addPerson}>Add</button></div>
        {d.people.length > 0 && <ul className="lin-onb__people" data-testid="onb-people">{d.people.map(p => <li key={p}>{p}<button type="button" aria-label={`Remove ${p}`} onClick={() => set({ people: d.people.filter(x => x !== p) })}>×</button></li>)}</ul>}
      </>}
      {step === 3 && <div className="lin-onb__choices" role="radiogroup" aria-label="Start with">
        {([["sample", "Sample workspace", "A few projects, a cycle in flight and issues to try the shortcuts on."], ["empty", "Empty workspace", "Just your team and its first cycle."]] as const).map(([k, t, s]) =>
          <label key={k} className={d.start === k ? "on" : ""}><input type="radio" name="start" checked={d.start === k} onChange={() => set({ start: k })} /><b>{t}</b><span className="ids-muted">{s}</span></label>)}
        {guest && <p className="ids-muted" style={{ fontSize: 12 }}>You&apos;re working as a guest. Sign in any time to keep this workspace on your account.</p>}
      </div>}
      {err && <p role="alert" className="lin-onb__err">{err}</p>}
      <button className="ids-btn ids-btn--primary lin-onb__cta" data-testid="onb-continue">{step === 3 ? "Open workspace" : step === 2 && person.trim() ? "Add teammate" : "Continue"}</button>
      <div className="lin-onb__foot">{step > 0 ? <button type="button" className="iconbtn" onClick={() => { setErr(""); setStep(step - 1); }}>Back</button> : <span />}<button type="button" className="iconbtn" onClick={skip}>Skip setup</button></div>
    </form>
  </div>;
}
