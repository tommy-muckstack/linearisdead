"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BP } from "@/lib/basepath";
import { useLocal } from "@/lib/useLocal";
import { Logo } from "@/components/Logo";
import {
  PRIORITIES, STATUSES, addComment, renameMember, normalizeWorkspace, todayISO, acceptIssue, declineIssue, markDuplicate, inbox, isSubscribed, markRead, hideNotifications, createInitiative, updateInitiative, deleteInitiative, updateProject, createIssue, createProject, currentCycle, deleteIssues, emptyWorkspace, ensureCycles, filterIssues, groupIssues, identifier, isOpen, rollOver, setProjectStatus, toggleLabel, updateIssue,
  type GroupBy, type Issue, type IssueInput, type Priority, type Status, type Workspace as WS,
} from "@/lib/linear/model";
import { seedWorkspace } from "@/lib/linear/seed";
import { Avatar, Kbd, Picker, PriorityIcon, StatusIcon, fmtDay, type Opt } from "./ui";
import { ESTIMATES, estimateLabel } from "./estimates";
import { Board, CyclesView, IssueList, ProjectsView, type RowProps } from "./Views";
import { IssuePane, type Field } from "./IssuePane";
import { CreateModal } from "./CreateModal";
import { AppNotFound, InboxView, InitiativesView, MyActivity, MyTabs, RoadmapView, TeamsView, TriageView } from "./Pages";
import { Onboarding } from "./Onboarding";
import { SETTINGS, SettingsView } from "./Settings";
import type { FirebaseClientConfig } from "@/lib/isdead-auth/config";
import { SHORTCUTS } from "@/lib/linear/shortcuts";

type Overlay = null | { kind: "picker"; field: Field; targets: string[] } | { kind: "create"; initial?: IssueInput } | { kind: "palette" } | { kind: "help" } | { kind: "dup"; id: string };
/** Routes under /app that render issue rows (j/k, filters, display options). */
const LIST_KINDS = ["active", "backlog", "all", "issue", "project", "my", "triage"];
const KNOWN = [...LIST_KINDS, "cycles", "projects", "inbox", "teams", "initiatives", "roadmap", "settings"];

export function Workspace({ uid, name, email, demo, guest = false, view, firebase = null }: { uid: string; name: string; email: string; demo: boolean; guest?: boolean; view: string[]; firebase?: FirebaseClientConfig | null }) {
  const router = useRouter();
  const [stored, setStored, ready] = useLocal<WS | null>(uid, "ws", null);
  const [prefs, setPrefs] = useLocal<{ group: GroupBy; layout: "list" | "board" }>(uid, "prefs", { group: "status", layout: "list" });
  const [q, setQ] = useState(""); const [openId, setOpenId] = useState<string | null>(view[0] === "issue" ? null : null);
  const [focusId, setFocusId] = useState<string | null>(null); const [selected, setSelected] = useState<Set<string>>(new Set());
  const [overlay, setOverlay] = useState<Overlay>(null); const [toast, setToast] = useState<string>(""); const [cycleSel, setCycleSel] = useState<string | null>(null);
  const history = useRef<WS[]>([]); const gPending = useRef(false); const gTimer = useRef<ReturnType<typeof setTimeout>>(undefined); const filterRef = useRef<HTMLInputElement>(null);
  const me = name || email.split("@")[0] || "You";

  // first load: demo gets a believable workspace; everyone gets cycles
  // first visit: the demo gets a seeded workspace, a guest's work follows them into their account, everyone else is onboarded
  const [onboard, setOnboard] = useState(false); const deleted = useRef(false);
  useEffect(() => { if (!ready || stored) return;
    const adopted = !demo && !guest ? adoptGuestWorkspace(uid, me) : null;
    if (adopted || (demo && !deleted.current)) setStored(adopted ?? seedWorkspace(me)); else setOnboard(true); }, [ready, stored, demo, guest, uid, me, setStored]);
  useEffect(() => { if (guest) try { localStorage.setItem(LAST_GUEST, uid); } catch { /* storage off */ } }, [guest, uid]);
  useEffect(() => { if (stored) { const n = normalizeWorkspace(ensureCycles(stored)); if (n !== stored) setStored(n); } }, [stored, setStored]);
  const ws = stored;

  const notify = useCallback((m: string) => { setToast(m); setTimeout(() => setToast(t => (t === m ? "" : t)), 2400); }, []);
  const commit = useCallback((next: WS, msg?: string) => { if (stored) history.current = [...history.current.slice(-29), stored]; setStored(next); if (msg) notify(msg); }, [stored, setStored, notify]);
  const undo = useCallback(() => { const p = history.current.pop(); if (p) { setStored(p); notify("Undone"); } }, [setStored, notify]);

  const [kind, arg] = [view[0] ?? "active", view[1]];
  const known = KNOWN.includes(kind) && (kind !== "my" || !arg || ["created", "subscribed", "activity"].includes(arg)) && (kind !== "inbox" || !arg || arg === "unread") && (kind !== "settings" || !arg || SETTINGS.some(x => x[1] === arg));
  // bare /app opens the home view chosen in Settings › Preferences
  useEffect(() => { if (!view.length && ws?.homeView && ws.homeView !== "active") router.replace(ws.homeView === "my" ? "/app/my" : "/app/inbox"); }, [view.length, ws?.homeView, router]);
  useEffect(() => { if (kind === "issue" && arg && ws) { const i = ws.issues.find(i => identifier(ws, i).toLowerCase() === arg.toLowerCase()); if (i) { setOpenId(i.id); setFocusId(i.id); } } }, [kind, arg, ws?.issues.length]);

  const base = useMemo<Issue[]>(() => {
    if (!ws) return [];
    if (kind === "my") return arg === "created" ? ws.issues.filter(i => i.creator === ws.me) : arg === "subscribed" ? ws.issues.filter(i => isSubscribed(ws, i)) : arg === "activity" ? [] : ws.issues.filter(i => i.assignee === ws.me && i.status !== "triage");
    if (kind === "triage") return ws.issues.filter(i => i.status === "triage");
    const team = ws.issues.filter(i => i.status !== "triage"); // triage issues stay out of team lists until accepted
    if (kind === "backlog") return team.filter(i => i.status === "backlog");
    if (kind === "all" || kind === "issue") return team;
    if (kind === "project" && arg) return team.filter(i => i.projectId === arg);
    if (kind !== "active") return [];
    const recent = Date.now() - 14 * 86_400_000;
    return team.filter(i => (isOpen(i.status) && i.status !== "backlog") || (i.status === "done" && i.completedAt && +new Date(i.completedAt) > recent));
  }, [ws, kind, arg]);
  const issues = useMemo(() => (ws ? filterIssues(ws, q, base) : []), [ws, q, base]);
  const groupBy: GroupBy = prefs.layout === "board" ? "status" : prefs.group;
  const groups = useMemo(() => (ws ? groupIssues(ws, issues, groupBy) : []), [ws, issues, groupBy]);
  const flat = useMemo(() => groups.flatMap(g => g.issues), [groups]);
  const onListView = known && LIST_KINDS.includes(kind) && !(kind === "my" && arg === "activity");
  const listIssues = kind === "cycles" ? (ws && cycleSel ? ws.issues.filter(i => i.cycleId === cycleSel) : []) : flat;

  useEffect(() => { if (focusId && flat.some(i => i.id === focusId)) return; if (onListView) setFocusId(flat[0]?.id ?? null); }, [flat, focusId, onListView]);
  useEffect(() => { if (focusId) document.querySelector(`[data-id="${focusId}"]`)?.scrollIntoView({ block: "nearest" }); }, [focusId]);

  const targets = useCallback((): string[] => (selected.size ? [...selected] : openId ? [openId] : focusId ? [focusId] : []), [selected, openId, focusId]);
  const apply = useCallback((ids: string[], patch: (i: Issue) => IssueInput, msg: string) => { if (!ws || !ids.length) return; let n = ws; for (const id of ids) { const i = n.issues.find(x => x.id === id); if (i) n = updateIssue(n, id, patch(i)); } commit(n, msg); }, [ws, commit]);
  const triageAct = useCallback((a: "accept" | "decline", id: string) => { if (!ws) return; commit(a === "accept" ? acceptIssue(ws, id) : declineIssue(ws, id), a === "accept" ? "Accepted · moved to Todo" : "Declined"); }, [ws, commit]);
  const go = useCallback((path: string) => { setOpenId(null); setSelected(new Set()); router.push(path); }, [router]);
  const openPicker = useCallback((field: Field, ids?: string[]) => { const t = ids ?? targets(); if (t.length) setOverlay({ kind: "picker", field, targets: t }); }, [targets]);
  const move = useCallback((d: number) => { if (!flat.length) return; const i = Math.max(0, Math.min(flat.length - 1, flat.findIndex(x => x.id === focusId) + d)); setFocusId(flat[i].id); if (openId) setOpenId(flat[i].id); }, [flat, focusId, openId]);
  const toggleSel = useCallback((id: string) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }), []);
  const remove = useCallback(() => { const t = targets(); if (!ws || !t.length) return; commit(deleteIssues(ws, t), t.length > 1 ? `${t.length} issues deleted` : "Issue deleted"); setOpenId(null); setSelected(new Set()); }, [ws, targets, commit]);
  const setLayout = useCallback((layout: "list" | "board") => setPrefs(p => ({ ...p, layout })), [setPrefs]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (overlay) return;
      const el = e.target as HTMLElement; const typing = el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOverlay({ kind: "palette" }); return; }
      if (typing) return;
      if (e.metaKey || e.ctrlKey) { if (e.key.toLowerCase() === "z") { e.preventDefault(); undo(); } else if (e.key === "Backspace" || e.key === "Delete") { e.preventDefault(); remove(); } return; }
      if (e.altKey) return;
      const k = e.key;
      if (gPending.current) { gPending.current = false; clearTimeout(gTimer.current); const to: Record<string, string> = { i: "/app/active", s: "/app/settings", m: "/app/my", b: "/app/backlog", c: "/app/cycles", p: "/app/projects", a: "/app/all" }; const d = to[k.toLowerCase()]; if (d) { e.preventDefault(); go(d); } return; }
      if (k === "g") { gPending.current = true; clearTimeout(gTimer.current); gTimer.current = setTimeout(() => (gPending.current = false), 1200); return; }
      if (kind === "triage" && focusId && ["1", "2", "3"].includes(k)) { e.preventDefault(); if (k === "1") triageAct("accept", focusId); else if (k === "2") triageAct("decline", focusId); else setOverlay({ kind: "dup", id: focusId }); return; }
      const map: Record<string, Field> = { s: "status", p: "priority", a: "assignee", l: "labels", r: "project", u: "cycle", e: "estimate" };
      if (k === "c" || k === "C") { e.preventDefault(); setOverlay({ kind: "create" }); }
      else if (k === "j" || k === "ArrowDown") { if (onListView) { e.preventDefault(); move(1); } }
      else if (k === "k" || k === "ArrowUp") { if (onListView) { e.preventDefault(); move(-1); } }
      else if (k === "Enter") { if (focusId && onListView) { e.preventDefault(); setOpenId(focusId); } }
      else if (k === "x") { if (focusId) { e.preventDefault(); toggleSel(focusId); } }
      else if (e.shiftKey && (k === "D" || k === "P")) { e.preventDefault(); openPicker(k === "D" ? "due" : "parent"); }
      else if (map[k.toLowerCase()] && !e.shiftKey) { e.preventDefault(); openPicker(map[k.toLowerCase()]); }
      else if (k === "v") { e.preventDefault(); setLayout(prefs.layout === "list" ? "board" : "list"); }
      else if (k === "/") { e.preventDefault(); filterRef.current?.focus(); }
      else if (k === "?") { e.preventDefault(); setOverlay({ kind: "help" }); }
      else if (k === "Escape") { if (openId) setOpenId(null); else if (selected.size) setSelected(new Set()); else if (q) setQ(""); }
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [overlay, focusId, openId, selected, q, onListView, prefs.layout, move, go, undo, remove, openPicker, setLayout, toggleSel, kind]);

  if (!ws) return onboard ? <Onboarding me={me} guest={guest} onDone={w => { setStored(w); setOnboard(false); }} /> : <div className="lin-loading" role="status">Loading your workspace…</div>;

  const rp: RowProps = { ws, focusId, selected, onFocus: setFocusId, onSelect: toggleSel, onOpen: id => { setFocusId(id); setOpenId(id); } };
  const opened = openId ? ws.issues.find(i => i.id === openId) : null;
  const cur = currentCycle(ws);
  const counts = { active: ws.issues.filter(i => isOpen(i.status) && !["backlog", "triage"].includes(i.status)).length, my: ws.issues.filter(i => i.assignee === ws.me && isOpen(i.status) && i.status !== "triage").length, backlog: ws.issues.filter(i => i.status === "backlog").length, triage: ws.issues.filter(i => i.status === "triage").length, inbox: inbox(ws).filter(n => !n.read).length };
  const titles: Record<string, string> = { active: "Active issues", my: "My issues", backlog: "Backlog", all: "All issues", cycles: "Cycles", projects: "Projects", issue: "All issues", project: ws.projects.find(p => p.id === arg)?.name ?? "Project", inbox: "Inbox", triage: "Triage", teams: "Teams", initiatives: "Initiatives", roadmap: "Roadmap" };

  // ---- pickers ----
  const pickerFor = (o: Extract<Overlay, { kind: "picker" }>) => {
    const t = ws.issues.filter(i => o.targets.includes(i.id)); const ids = o.targets; const first = t[0];
    switch (o.field) {
      case "status": return { title: "Change status", opts: STATUSES.map(s => ({ id: s.id, label: s.label, icon: <StatusIcon status={s.id} />, checked: first?.status === s.id })) as Opt[], pick: (id: string) => apply(ids, () => ({ status: id as Status }), `Status → ${STATUSES.find(s => s.id === id)!.label}`) };
      case "priority": return { title: "Set priority", opts: PRIORITIES.map(p => ({ id: String(p.id), label: p.label, icon: <PriorityIcon priority={p.id} /> })), pick: (id: string) => apply(ids, () => ({ priority: +id as Priority }), `Priority → ${PRIORITIES[+id].label}`) };
      case "assignee": return { title: "Assign to", opts: [...ws.members.map(m => ({ id: m, label: m, icon: <Avatar name={m} /> })), { id: "", label: "Unassigned", icon: <Avatar name={null} /> }], pick: (id: string) => apply(ids, () => ({ assignee: id || null }), id ? `Assigned to ${id}` : "Unassigned") };
      case "labels": return { title: "Toggle label", multi: true, opts: ws.labels.map(l => ({ id: l, label: l, checked: t.length > 0 && t.every(i => i.labels.includes(l)) })), pick: (id: string) => { const all = t.every(i => i.labels.includes(id)); apply(ids, i => ({ labels: all ? i.labels.filter(l => l !== id) : i.labels.includes(id) ? i.labels : [...i.labels, id] }), all ? `Removed ${id}` : `Added ${id}`); } };
      case "project": return { title: "Set project", opts: [{ id: "", label: "No project" }, ...ws.projects.map(p => ({ id: p.id, label: p.name }))], pick: (id: string) => apply(ids, () => ({ projectId: id || null }), id ? "Project set" : "Project cleared") };
      case "cycle": return { title: "Add to cycle", opts: [{ id: "", label: "No cycle" }, ...ws.cycles.filter(c => +new Date(c.endsAt) > Date.now()).map(c => ({ id: c.id, label: `Cycle ${c.number}${c.id === cur?.id ? " · current" : " · upcoming"}` }))], pick: (id: string) => apply(ids, () => ({ cycleId: id || null }), id ? "Added to cycle" : "Removed from cycle") };
      case "due": { const d = (n: number) => todayISO(new Date(Date.now() + n * 86_400_000)); const fri = (5 - new Date().getDay() + 7) % 7 || 7;
        const presets = [{ id: d(0), label: "Today" }, { id: d(1), label: "Tomorrow" }, { id: d(fri), label: "End of this week" }, { id: d(7), label: "In one week" }, { id: d(14), label: "In two weeks" }, { id: d(30), label: "In a month" }, { id: "", label: "No due date" }];
        return { title: "Set due date", opts: presets.filter((o, n) => presets.findIndex(x => x.id === o.id) === n).map(o => ({ ...o, hint: o.id ? fmtDay(o.id) : undefined })), pick: (id: string) => apply(ids, () => ({ dueDate: id || null }), id ? `Due ${fmtDay(id)}` : "Due date cleared") }; }
      case "parent": return { title: "Set parent issue", opts: [{ id: "", label: "No parent" }, ...ws.issues.filter(i => !ids.includes(i.id)).slice(0, 300).map(i => ({ id: i.id, label: `${identifier(ws, i)} ${i.title}`, icon: <StatusIcon status={i.status} /> }))], pick: (id: string) => apply(ids, () => ({ parentId: id || null }), id ? "Parent set" : "Parent removed") };
      default: return { title: "Estimate", opts: [{ id: "", label: "No estimate" }, ...ESTIMATES(ws).map(([n, l]) => ({ id: String(n), label: l }))], pick: (id: string) => apply(ids, () => ({ estimate: id ? +id : null }), id ? `Estimate → ${estimateLabel(ws, +id)}` : "Estimate cleared") };
    }
  };

  // ---- command palette ----
  const paletteItems: Opt[] = [
    { id: "cmd:create", label: "Create issue", hint: "C" }, { id: "cmd:status", label: "Change status…", hint: "S" }, { id: "cmd:priority", label: "Set priority…", hint: "P" }, { id: "cmd:assign", label: "Assign to…", hint: "A" }, { id: "cmd:label", label: "Add label…", hint: "L" },
    { id: "nav:/app/inbox", label: "Go to Inbox" }, { id: "nav:/app/triage", label: "Go to Triage" }, { id: "nav:/app/initiatives", label: "Go to Initiatives" }, { id: "nav:/app/roadmap", label: "Go to Roadmap" }, { id: "nav:/app/teams", label: "Go to Teams" },
    { id: "nav:/app/active", label: "Go to Active issues", hint: "G I" }, { id: "nav:/app/settings", label: "Open settings", hint: "G S" }, { id: "nav:/app/my", label: "Go to My issues", hint: "G M" }, { id: "nav:/app/backlog", label: "Go to Backlog", hint: "G B" }, { id: "nav:/app/all", label: "Go to All issues", hint: "G A" }, { id: "nav:/app/cycles", label: "Go to Cycles", hint: "G C" }, { id: "nav:/app/projects", label: "Go to Projects", hint: "G P" },
    { id: "cmd:view", label: `Switch to ${prefs.layout === "list" ? "board" : "list"} layout`, hint: "V" }, { id: "cmd:undo", label: "Undo last change", hint: "⌘Z" }, { id: "cmd:help", label: "Keyboard shortcuts", hint: "?" },
    ...ws.issues.slice(0, 200).map(i => ({ id: "iss:" + i.id, label: `${identifier(ws, i)} ${i.title}`, icon: <StatusIcon status={i.status} /> })),
  ];
  const runPalette = (id: string) => {
    const [t, v] = [id.split(":")[0], id.slice(id.indexOf(":") + 1)];
    if (t === "nav") go(v); else if (t === "iss") { go("/app/all"); setFocusId(v); setOpenId(v); }
    else setTimeout(() => { if (v === "create") setOverlay({ kind: "create" }); else if (v === "view") setLayout(prefs.layout === "list" ? "board" : "list"); else if (v === "undo") undo(); else if (v === "help") setOverlay({ kind: "help" });
      else openPicker(({ status: "status", priority: "priority", assign: "assignee", label: "labels" } as Record<string, Field>)[v]); }, 0);
  };

  const nav = (href: string, label: string, active: boolean, count?: number, key?: string) => <Link href={href} className={"lin-nav__item" + (active ? " on" : "")} onClick={() => { setOpenId(null); setSelected(new Set()); }}><span>{label}</span>{count != null && <em>{count}</em>}{key && <kbd className="lin-kbd">{key}</kbd>}</Link>;

  if (kind === "settings") return <div className="lin" data-testid="linear-app">
    <aside className="lin-side lin-side--settings">
      <Link href="/app" className="lin-back" data-testid="back-to-app">‹ Back to app</Link>
      <nav className="lin-nav" aria-label="Settings">{["Account", "Workspace", "Teams"].map(g => <div key={g}><div className="lin-nav__label">{g}</div>
        {SETTINGS.filter(x => x[0] === g).map(([, k, l]) => <Fragment key={k}>{nav(`/app/settings/${k}`, g === "Teams" ? ws.teamName : l, (arg || "preferences") === k)}</Fragment>)}</div>)}</nav>
    </aside>
    <main className="lin-main"><header className="lin-main__hd"><h1>Settings</h1></header>
      <div className="lin-scroll">{known ? <SettingsView key={arg} ws={ws} section={arg ?? ""} commit={commit} replace={w => { history.current = []; if (!w) { deleted.current = true; setOnboard(true); router.push("/app"); } setStored(w); }} email={email} guest={guest} demo={demo} firebase={firebase} /> : <AppNotFound />}</div></main>
    {toast && <div className="lin-toast" role="status" data-testid="toast">{toast}{history.current.length > 0 && <button onClick={undo}>Undo</button>}</div>}
  </div>;

  return <div className="lin" data-testid="linear-app">
    <aside className="lin-side">
      <div className="lin-side__top"><Link href="/app" style={{ color: "inherit", textDecoration: "none" }}><Logo size={22} /></Link></div>
      <button className="ids-btn ids-btn--outline lin-newbtn" onClick={() => setOverlay({ kind: "create" })} data-testid="new-issue"><span>＋ New issue</span><Kbd>C</Kbd></button>
      <nav className="lin-nav" aria-label="Workspace">
        {nav("/app/inbox", "Inbox", kind === "inbox", counts.inbox || undefined)}{nav("/app/my", "My issues", kind === "my", counts.my, "G M")}
        <div className="lin-nav__label">Workspace</div>
        {nav("/app/initiatives", "Initiatives", kind === "initiatives", (ws.initiatives ?? []).length || undefined)}{nav("/app/projects", "Projects", kind === "projects" || kind === "project", ws.projects.length, "G P")}
        {kind === "project" || kind === "projects" ? ws.projects.map(p => <Link key={p.id} href={`/app/project/${p.id}`} className={"lin-nav__item lin-nav__sub" + (arg === p.id ? " on" : "")}>{p.name}</Link>) : null}
        {nav("/app/roadmap", "Roadmap", kind === "roadmap")}{nav("/app/teams", "Teams", kind === "teams")}
        <div className="lin-nav__label">Your teams</div>
        <div className="lin-nav__team">{ws.teamName}</div>
        {ws.triageEnabled !== false && nav("/app/triage", "Triage", kind === "triage", counts.triage || undefined)}
        {nav("/app/active", "Active", kind === "active", counts.active, "G I")}{nav("/app/backlog", "Backlog", kind === "backlog", counts.backlog, "G B")}{nav("/app/all", "All issues", kind === "all" || kind === "issue")}
        {nav("/app/cycles", "Cycles", kind === "cycles", undefined, "G C")}
      </nav>
      <div className="lin-side__foot">{guest
        ? <><a className="lin-guest" href={`${BP}/login?callbackUrl=${encodeURIComponent(BP + "/app")}`} data-testid="guest-signin"><b>Guest</b> · Sign in to keep your work</a>
          <Link className="iconbtn" href="/app/settings" aria-label="Settings" data-testid="settings-link">⚙</Link><button className="iconbtn" onClick={() => setOverlay({ kind: "help" })} aria-label="Keyboard shortcuts">?</button></>
        : <><Link className="iconbtn" href="/app/settings" aria-label="Settings" data-testid="settings-link">⚙</Link><span className="ids-muted" style={{ fontSize: 12 }}>{demo ? "Demo account" : email}</span>
          <button className="iconbtn" onClick={() => setOverlay({ kind: "help" })} aria-label="Keyboard shortcuts">?</button>
          <form method="post" action={`${BP}/api/session/logout`} style={{ margin: 0 }}><button className="iconbtn">Sign out</button></form></>}</div>
    </aside>
    <main className="lin-main">
      <header className="lin-main__hd">
        <h1>{known ? titles[kind] ?? "Issues" : "Not found"}</h1>
        {onListView && <>
          <input ref={filterRef} className="lin-filter" aria-label="Filter issues" placeholder="Filter…  e.g. status:todo priority:high assignee:me label:bug" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === "Escape") { e.stopPropagation(); setQ(""); (e.target as HTMLInputElement).blur(); } if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }} />
          {prefs.layout === "list" && <label className="lin-sel"><span className="ids-muted">Group</span><select aria-label="Group by" value={prefs.group} onChange={e => setPrefs(p => ({ ...p, group: e.target.value as GroupBy }))}>{["status", "priority", "assignee", "project", "none"].map(g => <option key={g}>{g}</option>)}</select></label>}
          <div className="lin-seg" role="group" aria-label="Layout"><button className={prefs.layout === "list" ? "on" : ""} aria-pressed={prefs.layout === "list"} onClick={() => setLayout("list")}>List</button><button className={prefs.layout === "board" ? "on" : ""} aria-pressed={prefs.layout === "board"} onClick={() => setLayout("board")}>Board</button></div></>}
      </header>
      {kind === "my" && <MyTabs tab={arg ?? ""} />}
      {kind === "project" && arg && ws.projects.find(p => p.id === arg) && <p className="lin-summary ids-muted">{ws.projects.find(p => p.id === arg)!.summary}</p>}
      {selected.size > 0 && <div className="lin-bulk" role="status" data-testid="bulk-bar"><b>{selected.size} selected</b><button className="iconbtn" onClick={() => openPicker("status")}>Status</button><button className="iconbtn" onClick={() => openPicker("priority")}>Priority</button><button className="iconbtn" onClick={() => openPicker("assignee")}>Assign</button><button className="iconbtn" onClick={() => openPicker("labels")}>Label</button><button className="iconbtn" onClick={remove}>Delete</button><button className="iconbtn" onClick={() => setSelected(new Set())}>Clear</button></div>}
      <div className={"lin-body" + (opened ? " has-pane" : "")}>
        <div className="lin-scroll">
          {!known ? <AppNotFound />
            : kind === "inbox" ? <InboxView ws={ws} filter={arg === "unread" ? "unread" : "all"} onOpen={(id, nid) => { setStored(markRead(ws, [nid])); setFocusId(id); setOpenId(id); }} onRead={ids => commit(markRead(ws, ids), "Marked as read")} onHide={ids => commit(hideNotifications(ws, ids), ids.length > 1 ? `${ids.length} notifications deleted` : "Notification deleted")} />
            : kind === "my" && arg === "activity" ? <MyActivity ws={ws} onOpen={id => { setFocusId(id); setOpenId(id); }} />
            : kind === "triage" ? <TriageView ws={ws} rp={rp} list={flat} onAccept={id => triageAct("accept", id)} onDecline={id => triageAct("decline", id)} onDuplicate={id => setOverlay({ kind: "dup", id })} onNew={() => setOverlay({ kind: "create", initial: { status: "triage" } })} />
            : kind === "teams" ? <TeamsView ws={ws} />
            : kind === "initiatives" ? <InitiativesView ws={ws} onNew={n => commit(createInitiative(ws, n).ws, "Initiative created")} onUpdate={(id, p) => commit(updateInitiative(ws, id, p))} onDelete={id => commit(deleteInitiative(ws, id), "Initiative deleted")} />
            : kind === "roadmap" ? <RoadmapView ws={ws} onDates={(id, p) => commit(updateProject(ws, id, p), "Dates updated")} />
            : kind === "cycles" ? <CyclesView ws={ws} selectedId={cycleSel} onSelect={setCycleSel} rp={rp} onRoll={(f, t) => { const r = rollOver(ws, f, t); commit(r.ws, r.moved ? `${r.moved} issue${r.moved > 1 ? "s" : ""} rolled over` : "Nothing to roll over"); }} />
            : kind === "projects" ? <ProjectsView ws={ws} onNew={n => commit(createProject(ws, n).ws, "Project created")} onStatus={(id, s) => commit(setProjectStatus(ws, id, s))} onOpen={id => go(`/app/project/${id}`)} />
            : prefs.layout === "board" ? <Board ws={ws} issues={issues} rp={rp} onMove={(id, s) => apply([id], () => ({ status: s }), `Moved to ${STATUSES.find(x => x.id === s)!.label}`)} onCreateIn={s => setOverlay({ kind: "create", initial: { status: s as Status } })} />
            : <IssueList groups={groups} rp={rp} onCreateIn={s => setOverlay({ kind: "create", initial: s === "status" || !STATUSES.some(x => x.id === s) ? undefined : { status: s as Status } })} />}
        </div>
        {opened && <IssuePane ws={ws} issue={opened} onUpdate={p => commit(updateIssue(ws, opened.id, p))} onComment={b => commit(addComment(ws, opened.id, b), "Comment added")} onDelete={remove} onClose={() => setOpenId(null)} openPicker={f => openPicker(f, [opened.id])} onOpen={id => { setFocusId(id); setOpenId(id); }} onAddSub={() => setOverlay({ kind: "create", initial: { parentId: opened.id, projectId: opened.projectId, cycleId: opened.cycleId } })} />}
      </div>
    </main>
    {toast && <div className="lin-toast" role="status" data-testid="toast">{toast}{history.current.length > 0 && <button onClick={undo}>Undo</button>}</div>}
    {overlay?.kind === "picker" && (() => { const p = pickerFor(overlay); return <Picker title={p.title} options={p.opts} multi={(p as any).multi} onPick={p.pick} onClose={() => setOverlay(null)} />; })()}
    {overlay?.kind === "dup" && <Picker title="Duplicate of" options={ws.issues.filter(i => i.id !== overlay.id && i.status !== "triage").slice(0, 300).map(i => ({ id: i.id, label: `${identifier(ws, i)} ${i.title}`, icon: <StatusIcon status={i.status} /> }))} onPick={of => commit(markDuplicate(ws, overlay.id, of), "Marked as duplicate")} onClose={() => setOverlay(null)} />}
    {overlay?.kind === "palette" && <Picker title="Type a command or search" options={paletteItems} onPick={runPalette} onClose={() => setOverlay(null)} />}
    {overlay?.kind === "create" && <CreateModal ws={ws} initial={overlay.initial} onClose={() => setOverlay(null)} onCreate={(input, more) => { const r = createIssue(ws, { ...input, projectId: input.projectId ?? (kind === "project" ? arg ?? null : null) }); commit(r.ws, `Created ${identifier(r.ws, r.issue)}`); if (!more) { setOverlay(null); setFocusId(r.issue.id); } }} />}
    {overlay?.kind === "help" && <div className="lin-overlay" onMouseDown={e => { if (e.target === e.currentTarget) setOverlay(null); }}><HelpDialog onClose={() => setOverlay(null)} /></div>}
  </div>;
}
const LAST_GUEST = "linearisdead:lastGuest";
/** If this browser was used as a guest, move that guest's workspace (and display prefs) to the signed-in account once. */
function adoptGuestWorkspace(uid: string, me: string): WS | null {
  try {
    const g = localStorage.getItem(LAST_GUEST); if (!g || g === uid) return null;
    const raw = localStorage.getItem(`linearisdead:${g}:ws`); if (!raw) return null;
    const prefs = localStorage.getItem(`linearisdead:${g}:prefs`); if (prefs && !localStorage.getItem(`linearisdead:${uid}:prefs`)) localStorage.setItem(`linearisdead:${uid}:prefs`, prefs);
    localStorage.removeItem(`linearisdead:${g}:ws`); localStorage.removeItem(`linearisdead:${g}:prefs`); localStorage.removeItem(LAST_GUEST);
    const ws = JSON.parse(raw) as WS; return renameMember(ws, ws.me, me);
  } catch { return null; }
}
function HelpDialog({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null); useEffect(() => ref.current?.focus(), []);
  return <div ref={ref} tabIndex={-1} className="lin-modal lin-help" role="dialog" aria-label="Keyboard shortcuts" onKeyDown={e => e.key === "Escape" && onClose()}>
    <h2 className="ids-h2" style={{ fontSize: 20, margin: 0 }}>Keyboard shortcuts</h2>
    <dl>{SHORTCUTS.map(([k, d]) => <div key={k}><dt><Kbd>{k}</Kbd></dt><dd>{d}</dd></div>)}</dl>
    <p className="ids-muted" style={{ fontSize: 12 }}>Quick create syntax: <code>!urgent @me #bug +project ~3 /progress</code></p>
    <button className="ids-btn ids-btn--outline ids-btn--sm" onClick={onClose}>Close</button></div>;
}
