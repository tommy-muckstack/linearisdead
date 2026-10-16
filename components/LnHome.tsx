import Link from "next/link";
import { LnCta, LnMark } from "./LnShared";
import { SiteNav, SiteFoot } from "./LnSite";
import { CHANGELOG } from "@/lib/changelog";

const Mock = ({ x, y, w, h, cls = "" }: { x: number; y: number; w: number; h: number; cls?: string }) => <div className={"mock " + cls} style={{ left: x, top: y, width: w, height: h }} aria-hidden><i /><i /><i /><i /><i /></div>;
const Sec = ({ y, t, p, href }: { y: number; t: string[]; p: string; href: string }) => <>
  <h2 className="sh" style={{ top: y }}>{t[0]}<br />{t[1]}</h2>
  <p className="sp" style={{ top: y + 1 }}>{p}</p><Link className="lm" href={href} style={{ top: y + 132 }}>Learn more →</Link>
</>;
type L = [string, string];
const Feats = ({ y, a, b }: { y: number; a: L[]; b: L[] }) => <div className="fts" style={{ top: y }}><span>Features</span><div style={{ left: 672 }}>{a.map(([l, h]) => <Link key={l} href={h}>{l} →</Link>)}</div><div style={{ left: 1008 }}>{b.map(([l, h]) => <Link key={l} href={h}>{l} →</Link>)}</div></div>;
const Rule = ({ y }: { y: number }) => <hr className="rl" style={{ top: y }} />;
const fmt = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).toUpperCase();
// Toolbar glyphs for the hero mock (decorative, original art).
const Ic = ({ d }: { d: string }) => <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden><path d={d} stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>;

export function LnHome() {
  return <div className="ln-wrap"><div className="ln-page" style={{ height: 9465 }}>
    <SiteNav />
    <h1 className="h1">The product development<br />system for every team</h1>
    <p className="hs">Purpose-built for planning and building products. Free and open source.</p>
    <span className="nw"><b>New</b><Link href="/changelog">Saved views →</Link></span>
    <div className="frame" style={{ top: 527 }} aria-label="The LinearIsDead app: an issue with its activity and properties" role="img"><div className="app">
      <div className="sb"><div className="ws"><LnMark s={14} /> LinearIsDead <u>⌄</u></div>
        <span>Inbox</span><span>My issues</span><span>Triage</span><h6>Workspace ▾</h6><span>Initiatives</span><span>Projects</span><span>Views</span><span>Roadmap</span><h6>Favorites ▾</h6><span className="on">Faster app launch</span><span>UI refresh</span><span>Bugs this cycle</span></div>
      <div className="mn"><div className="hdr"><span>◔ DRV-8852 &nbsp;Faster app launch ★</span><span className="tools"><em>1 / 84</em>
        <Ic d="M5 10l3-3 3 3" /><Ic d="M5 6l3 3 3-3" /><Ic d="M6.5 9.5l3-3M5.5 7.5l-1 1a2 2 0 002.8 2.8l1-1M10.5 8.5l1-1a2 2 0 00-2.8-2.8l-1 1" /><Ic d="M8 2.5l1.7 3.5 3.8.5-2.8 2.6.7 3.8L8 11.1l-3.4 1.8.7-3.8-2.8-2.6 3.8-.5z" /><Ic d="M3.5 8h.01M8 8h.01M12.5 8h.01" /></span></div>
        <h3>Faster app launch</h3><p>Render UI before <code>vehicle_state</code> sync when minimal required state is present, instead of blocking on full refresh during startup.</p>
        <h4>Activity</h4>
        <div className="ev">◆ Product lead created the issue from Triage · 2min ago</div><div className="ev">◇ Product lead added the labels Performance and iOS · 2min ago</div>
        <div className="cm"><b>Product lead</b> 4 min ago<br />Right now we show a spinner forever, which makes it look like the app disappeared.<br /><br /><b>iOS engineer</b> just now<br />Taking this one. Splitting it into two sub-issues.</div>
        <div className="ev">◇ iOS engineer set the estimate to 3 points · 1min ago</div><div className="ev">◔ iOS engineer moved from Todo to In Progress · just now</div></div>
      <div className="ag"><div className="ah">Properties</div>
        <dl className="props">{[["Status", "◔ In Progress"], ["Priority", "▮▮▮ High"], ["Assignee", "iOS engineer"], ["Labels", "Performance · iOS"], ["Project", "Mobile 3.0"], ["Cycle", "Cycle 12"], ["Estimate", "3 points"], ["Due date", "Oct 24"]].map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        <div className="subs"><b>Sub-issues 1/2</b><span>◉ Cache minimal vehicle state</span><span>○ Render shell before full sync</span></div>
        <div className="rp">Leave a comment…</div></div>
    </div></div>
    <div className="lgs">{["Issues", "Projects", "Cycles", "Triage", "Views", "Initiatives", "Roadmap"].map((l) => <span key={l}>{l}</span>)}</div>
    <p className="pw">EVERYTHING INCLUDED, FREE FOR EVERY TEAM</p>
    <p className="big"><b>A new species of product tool.</b> Purpose-built for modern teams, with every feature included and no plan gates. Planning and building, without the per-seat bill.</p>
    <div className="figs">{[["FIG 0.1", "Purpose-built", "Designed for the practices and principles of world-class product teams."], ["FIG 0.2", "Keyboard first", "Every action has a shortcut. ⌘K reaches the rest, and the mouse is optional."], ["FIG 0.3", "Designed for speed", "Reduces noise and restores momentum to help teams ship with high velocity and focus."]].map(([f, t, d], i) => <div key={f} className="fg" style={{ left: 80 + i * 426 }}><span>{f}</span><u /><b>{t}</b><p>{d}</p></div>)}</div>
    <Rule y={2400} />
    <Sec y={2674} t={["Intake", "and triage"]} p="Turn requests and bug reports into actionable issues that are routed, labeled, and prioritized for the right team." href="/intake" />
    <Mock x={60} y={2900} w={1320} h={580} cls="m1" />
    <Feats y={3552} a={[["Triage", "/intake#triage"], ["Quick create", "/intake#quick-create"]]} b={[["Inbox", "/intake#inbox"], ["Labels", "/build#issues"]]} />
    <Rule y={3770} />
    <Sec y={3910} t={["Planning", "and monitoring"]} p="Plan and navigate from idea to launch. Align your team with initiatives, a roadmap built from your projects, and cycles with real burn-up charts." href="/plan" />
    <Mock x={60} y={4125} w={1320} h={620} cls="m2" />
    <Feats y={4807} a={[["Projects", "/plan#projects"], ["Cycles", "/plan#cycles"], ["Roadmap", "/plan#roadmap"]]} b={[["Initiatives", "/plan#initiatives"], ["Progress", "/plan#projects"], ["Burn-up", "/plan#cycles"]]} />
    <Rule y={5005} />
    <Sec y={5149} t={["Views and", "display options"]} p="Group, sub-group and order any list, pick the properties each row shows, and save the result as a view your whole workspace can open." href="/build#views" />
    <Mock x={60} y={5475} w={1320} h={540} cls="m3" />
    <Feats y={6075} a={[["Display options", "/build#views"], ["Saved views", "/build#views"]]} b={[["Board", "/build#board"], ["Command menu", "/build#command-menu"]]} />
    <Rule y={6255} />
    <Sec y={6391} t={["Build, track", "and ship"]} p="Sub-issues, due dates, estimates and an activity log that records every change. Keep work moving without leaving the keyboard." href="/build" />
    <Mock x={60} y={6637} w={1320} h={640} cls="m4" />
    <Feats y={7282} a={[["Issues", "/build#issues"], ["Sub-issues", "/build#issues"], ["Shortcuts", "/docs#shortcuts"]]} b={[["Filters", "/docs#filters"], ["Cycles", "/plan#cycles"], ["Changelog", "/changelog"]]} />
    <Rule y={7482} />
    <h2 className="cl">Changelog</h2>
    <div className="clg">{CHANGELOG.slice(0, 4).map((e, i) => <Link key={e.title} href="/changelog" style={{ left: 80 + i * 336 }}><i /><b>{e.title}</b><p>{e.body}</p><small>{fmt(e.date)}</small></Link>)}<hr /></div>
    <Link className="va" href="/changelog">View all →</Link>
    <div className="qt a" style={{ top: 8237 }}><p>“Free means free: no seats, no trial, no plan that turns features off.”</p><div className="au"><i /><b>The LinearIsDead principle<small>Pricing</small></b></div></div>
    <div className="qt b" style={{ top: 8237 }}><p>“Read the code, fork it, ship your own.”</p><div className="au"><i /><b>Apache-2.0<small>License</small></b></div></div>
    <p className="pc">Free for <b>every</b> team, from side projects to whole companies.</p><Link className="cs" href="/customers">How teams set it up →</Link>
    <LnCta top={9014} />
  </div><SiteFoot /></div>;
}
