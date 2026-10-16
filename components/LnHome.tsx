import Link from "next/link";
import { LnNav, LnCta, LnFoot, LnMark } from "./LnShared";

const Mock = ({ x, y, w, h, cls = "" }: { x: number; y: number; w: number; h: number; cls?: string }) => <div className={"mock " + cls} style={{ left: x, top: y, width: w, height: h }}><i /><i /><i /><i /><i /></div>;
const Sec = ({ y, t, p, feats, cols }: { y: number; t: string[]; p: string; feats?: [string[], string[]]; cols?: boolean }) => <>
  <h2 className="sh" style={{ top: y }}>{t[0]}<br />{t[1]}</h2>
  <p className="sp" style={{ top: y + 1 }}>{p}</p><a className="lm" style={{ top: y + 132 }}>Learn more →</a>
</>;
const Feats = ({ y, a, b }: { y: number; a: string[]; b: string[] }) => <div className="fts" style={{ top: y }}><span>Features</span><div style={{ left: 672 }}>{a.map((l) => <a key={l}>{l} →</a>)}</div><div style={{ left: 1008 }}>{b.map((l) => <a key={l}>{l} →</a>)}</div></div>;
const Rule = ({ y }: { y: number }) => <hr className="rl" style={{ top: y }} />;

export function LnHome() {
  return <div className="ln-page" style={{ height: 9960 }}>
    <LnNav />
    <h1 className="h1">The product development<br />system for teams and agents</h1>
    <p className="hs">Purpose-built for planning and building products. Designed for the AI era.</p>
    <span className="nw"><b>New</b><a>Loops →</a></span>
    <div className="frame" style={{ top: 527 }}><div className="app">
      <div className="sb"><div className="ws"><LnMark s={14} /> LinearIsDead <u>⌄</u></div>
        <a>Pulse</a><a>Inbox</a><a>My issues</a><a>Reviews</a><h6>Workspace ▾</h6><a>Initiatives</a><a>Projects</a><a>More</a><h6>Favorites ▾</h6><a className="on">Faster app launch</a><a>Agent tasks</a><a>Agent insights</a><a>UI refresh</a></div>
      <div className="mn"><div className="hdr"><span>◔ DRV-8852 &nbsp;Faster app launch ★</span><em>1 / 64</em></div>
        <h3>Faster app launch</h3><p>Render UI before <code>vehicle_state</code> sync when minimal required state is present, instead of blocking on full refresh during startup.</p>
        <h4>Activity</h4>
        <div className="ev">◆ Linear created the issue via Slack on behalf of Karri · 2min ago</div><div className="ev">◇ Triage Intelligence added the labels Performance and iOS · 2min ago</div>
        <div className="cm"><b>karri</b> 4 min ago<br />Right now we show a spinner forever, which makes it look like the app disappeared.<br /><br /><b>jon</b> just now<br />@Linear can you take a stab at this?</div>
        <div className="ev">◆ Linear connected with Jon · 3min ago</div><div className="ev">▣ Changed 2 files Draft PR awaiting your review · 2min ago</div><div className="ev">◔ Linear moved from Todo to In Progress · just now</div></div>
      <div className="rv"><b>Reviews</b><span>↻ Revert</span></div>
      <div className="ag"><div className="ah">◆ Linear <small>Opus 5</small></div>
        <div className="bub">Fix the dimmed ride rows that never reset and open a PR</div><div className="ctx">◔ DRV-364 added to context</div>
        <p className="wk">Worked for 10 sec ⌄</p><p className="pu">Pushed and opened a draft PR. Removed dimmedIds — isItemDimmed now checks waitingStatusById directly.</p>
        <div className="chg"><b>Changed 2 files +22 −10</b><span>Draft: Reset dimmed ride rows</span><small>master · rides/dev-fix-dimmed-rows</small></div>
        <div className="rp">Reply...<br /><br /><small>Skills ⌄</small></div></div>
    </div></div>
    <div className="lgs">{["OpenAI", "Vercel", "Salesforce", "Figma", "Cursor", "Coinbase", "ramp"].map((l) => <span key={l}>{l}</span>)}</div>
    <p className="pw">POWERING THE COMPANIES BUILDING THE FUTURE</p>
    <p className="big"><b>A new species of product tool.</b> Purpose-built for modern teams with AI workflows at its core, this sets a new standard for planning and building products.</p>
    <div className="figs">{[["FIG 0.1", "Purpose-built", "Designed for the practices and principles of world-class product teams."], ["FIG 0.2", "Powered by agents", "Designed for workflows shared by humans and agents. From drafting PRDs to pushing PRs."], ["FIG 0.3", "Designed for speed", "Reduces noise and restores momentum to help teams ship with high velocity and focus."]].map(([f, t, d], i) => <div key={f} className="fg" style={{ left: 80 + i * 426 }}><span>{f}</span><u /><b>{t}</b><p>{d}</p></div>)}</div>
    <Rule y={2400} />
    <Sec y={2674} t={["Intake", "and integrations"]} p="Turn conversations and customer feedback into actionable issues that are routed, labeled, and prioritized for the right team." />
    <Mock x={60} y={2900} w={1320} h={580} cls="m1" />
    <Feats y={3552} a={["Agent", "Triage"]} b={["Customer Requests", "Asks"]} />
    <Rule y={3770} />
    <Sec y={3910} t={["Planning", "and monitoring"]} p="Plan and navigate from idea to launch. Align your team with product initiatives, strategic roadmaps, and clear, up-to-date PRDs." />
    <Mock x={60} y={4125} w={1320} h={620} cls="m2" />
    <Feats y={4807} a={["Projects", "Pulse", "Visual planning"]} b={["Documents", "Initiatives", "Insights"]} />
    <Rule y={5005} />
    <Sec y={5149} t={["AI and", "automations"]} p="Build and deploy agents that work alongside you as teammates. Work on complex tasks together or delegate entire issues end-to-end." />
    <Mock x={60} y={5475} w={1320} h={540} cls="m3" />
    <Feats y={6075} a={["Agent", "Triage"]} b={["Coding sessions", "MCP"]} />
    <Rule y={6255} />
    <Sec y={6391} t={["Build, review", "and ship"]} p="Streamline code reviews with clear diffs, better context, and fewer back-and-forth comments. Keep PRs moving without sacrificing quality." />
    <Mock x={60} y={6637} w={1320} h={640} cls="m4" />
    <Feats y={7282} a={["Issues", "Guided reviews", "Diffs"]} b={["Automations", "Cycles", "Releases"]} />
    <Rule y={7482} />
    <h2 className="cl">Changelog</h2>
    <div className="clg">{[["Stacked pull requests", "Stacked pull requests are now displayed in Diffs. Move through changes faster.", "OCT 8, 2026"], ["New coding controls", "Coding sessions are the shortest path from issue to diff. Assign a task to an agent.", "SEP 24, 2026"], ["Loops for planning", "Loops are recurring agent workflows for product management.", "SEP 10, 2026"], ["Priority inbox", "An active workspace can create a significant amount of notifications each day.", "SEP 3, 2026"]].map(([t, d, dt], i) => <div key={t} style={{ left: 80 + i * 336 }}><i /><b>{t}</b><p>{d}</p><small>{dt}</small></div>)}<hr /></div>
    <a className="va">View all →</a>
    <div className="qt a" style={{ top: 8237 }}><p>“You’ll probably build a better product, just because of the craft that using Linear infuses on your brain.”</p><div className="au"><i /><b>Gabriel Peal<small>OpenAI</small></b></div></div>
    <div className="qt b" style={{ top: 8237 }}><p>“Our speed is intense and we help each other be action biased.”</p><div className="au"><i /><b>Nik Koblov<small>Head of Engineering</small></b></div></div>
    <p className="pc">Trusted by over <b>40,000</b> product teams. From ambitious startups to major enterprises.</p><a className="cs">Customer stories →</a>
    <LnCta top={9014} />
    <LnFoot top={9465} />
  </div>;
}
