import { MeasuredPage } from "./m/MeasuredPage";
import pm from "./m/pricing390.json";
import Link from "next/link";
import { LnCta } from "./LnShared";
import { LnMobileCompare } from "./LnMobileCompare";
import { SiteFoot, SiteNav } from "./LnSite";
import { hrefForText } from "@/lib/sitemap";

type C = 0 | 1 | string;
const PLANS = [
  { n: "Free", p: "$0", b: "Free for everyone", f: ["Unlimited members", "2 teams", "250 issues", "Agent platform", "Agent"] },
  { n: "Basic", p: "$10 per user/month", b: "Billed yearly", f: ["All Free features +", "5 teams", "Unlimited issues", "Unlimited file uploads", "Admin roles"] },
  { n: "Business", p: "$16 per user/month", b: "Billed yearly", f: ["All Basic features +", "Unlimited teams", "Private teams and guests", "Triage Intelligence", "Loops", "Code Intelligence", "Insights", "Asks", "Zendesk and Intercom integrations"] },
  { n: "Enterprise", p: "Custom", b: "Annual billing only", f: ["All Business features +", "Invoice/PO billing", "SAML and SCIM", "Granular admin controls", "Enterprise-grade security", "Advanced org modeling", "Migration & onboarding support", "Priority support", "Account management"] },
];
const G: [string, [string, C, C, C, C][]][] = [
  ["", [["Members", "Unlimited", "Unlimited", "Unlimited", "Unlimited"], ["File upload", "10MB", "Unlimited", "Unlimited", "Unlimited"], ["Issues", "250 issues", "Unlimited", "Unlimited", "Unlimited"], ["Teams", "2 teams", "5 teams", "Unlimited", "Unlimited"]]],
  ["Core", [["Issues, projects, cycles, initiatives", 1, 1, 1, 1], ["Customer requests", 1, 1, 1, 1], ["API and webhook access", 1, 1, 1, 1], ["Import and export", 1, 1, 1, 1], ["Triage", 1, 1, 1, 1], ["Pulse", 1, 1, 1, 1], ["Issue sync", 1, 1, 1, 1], ["Diffs", 1, 1, 1, 1], ["Guided reviews", 0, 1, 1, 1], ["Issue SLAs", 0, 0, 1, 1], ["Triage responsibility", 0, 0, 1, 1], ["Triage rules", 0, 0, 1, 1], ["Releases", 0, 0, "15 pipelines", "Unlimited"], ["Sub-initiatives", 0, 0, 0, 1]]],
  ["AI and agent workflows", [["Agent platform", 1, 1, 1, 1], ["MCP access", 1, 1, 1, 1], ["Agent", 1, 1, 1, 1], ["Coding sessions", 0, 1, 1, 1], ["Loops", 0, 1, 1, 1], ["Code Intelligence", 0, 0, 1, 1], ["Triage Intelligence", 0, 0, 1, 1]]],
  ["Integrations", [["Integrations", 1, 1, 1, 1], ["Microsoft Teams integration", 1, 1, 1, "Multiple tenants"], ["Support integrations", 0, 0, 1, 1], ["Salesforce integration", 0, 0, 0, 1]]],
  ["Team management", [["Sub-teams", 0, 0, "1 level", "5 levels"], ["Private teams", 0, 0, 1, 1], ["Guest accounts", 0, 0, 1, 1]]],
  ["Analytics & Reporting", [["Progress reports", 1, 1, 1, 1], ["Insights", 0, 0, 1, 1], ["Dashboards", 0, 0, 0, 1]]],
  ["Asks", [["Slack intake", 0, 0, 1, 1], ["Email intake", 0, 0, 1, 1], ["Web forms", 0, 0, 0, 1], ["Multiple Slack workspaces", 0, 0, 0, 1], ["Private Slack channels", 0, 0, 0, 1], ["Per-channel configurations", 0, 0, 0, 1]]],
  ["Security", [["SSO", "Google", "Google", "Google", "Google + SAML"], ["Admin roles", 0, 1, 1, 1], ["Third-party app management", 0, 1, 1, 1], ["Team owners", 0, 0, 1, 1], ["Advanced authentication", 0, 0, 1, 1], ["SCIM provisioning", 0, 0, 0, 1], ["IP restrictions", 0, 0, 0, 1], ["Domain claiming", 0, 0, 0, 1], ["Audit log", 0, 0, 0, 1], ["HIPAA compliance", 0, 0, 0, 1]]],
  ["Support", [["Priority support", 0, 0, 0, 1], ["Account manager", 0, 0, 0, 1], ["Custom terms", 0, 0, 0, 1], ["Uptime SLA", 0, 0, 0, 1]]],
];
const Ck = () => <svg className="ck" width="13" height="13" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="#e6e8ec" /><path d="M4 7.2l2 2 4-4.2" stroke="#0b0c0e" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>;
const Xx = () => <svg className="xx" width="10" height="10" viewBox="0 0 10 10"><path d="M2 2l6 6M8 2l-6 6" stroke="#62666d" strokeWidth="1.3" strokeLinecap="round" /></svg>;
const cell = (c: C) => c === 1 ? <Ck /> : c === 0 ? <Xx /> : <span className="tv"><Ck />{c}</span>;

export function LnPricing() {
  const els: React.ReactNode[] = [];
  let H = 1357;
  G.forEach(([g, rows], gi) => {
    if (gi === 0) els.push(<div key="hd" className="th" style={{ top: H - 28 }}><span>Features</span>{PLANS.map((p, i) => <span key={p.n} style={{ left: 448 + i * 224 }}>{p.n}</span>)}</div>);
    else els.push(<div key={g} className="gh" style={{ top: H - 16 }}>{g}</div>);
    const first = H + (gi === 0 ? 103 : 84);
    rows.forEach((r, i) => els.push(<div key={g + r[0]} className="tr" style={{ top: first + i * 44 - 22 }}><span>{r[0]}</span>{[1, 2, 3, 4].map((k) => <div key={k} style={{ left: 448 + (k - 1) * 224 }}>{cell(r[k] as C)}</div>)}</div>));
    const last = first + (rows.length - 1) * 44;
    els.push(<i key={g + "v"} className="vl" style={{ top: first - 22, height: rows.length * 44 }} />);
    H = last + 80;
  });
  return <><div className="ln-pm-nav"><SiteNav active="Pricing" /></div><MeasuredPage data={pm as never} className="ln-pm" hrefFor={hrefForText} skip={i => i.y < 64 && i.y > 1 && i.h < 64} /><div className="ln-pm-foot"><SiteFoot /></div>
  <div className="ln-wrap mp-desk"><div className="ln-page" style={{ height: 5695 }}>
    <SiteNav active="Pricing" />
    <h1 className="ph">Pricing</h1>
    {PLANS.map((p, i) => <div key={p.n} className="pl" style={{ left: 80 + i * 336 }}>
      <h2>{p.n}</h2><div className="pr">{p.p}</div><hr /><div className="bl">{i === 3 ? "" : <u><i /></u>}{p.b}</div><hr />
      <ul>{p.f.map((f) => <li key={f}><Ck />{f}</li>)}</ul>
      <div className="bt">{i === 3 ? <Link href="/contact" className="g">Contact us</Link> : <><Link href="/app" className={"g" + (i === 2 ? " h" : "")}>Get started</Link>{i === 2 && <Link href="/contact" className="g s">Contact us</Link>}</>}</div></div>)}
    <p className="tb" data-testid="free-note"><b>LinearIsDead has no paid plans.</b> These are the tiers paid issue trackers sell; everything LinearIsDead ships is free for everyone.</p>
    <Link href="/customers" className="cs2">How teams set it up →</Link>
    <LnMobileCompare plans={PLANS.map((p) => p.n)} groups={G} />
    {els}
    <div className="fb" style={{ top: 4830 }}>{[0, 1, 2, 3].map((i) => <div key={i} style={{ left: 448 + i * 224 }}>{i === 3 ? <Link href="/contact">Contact us</Link> : <><Link href="/app" className={i === 2 ? "h" : ""}>Get started</Link>{i === 2 && <small>or <Link href="/contact"><u>contact us</u></Link></small>}</>}</div>)}</div>
    <p className="ft2">Features LinearIsDead ships are listed in the <Link href="/docs">docs</Link>.</p>
    <LnCta top={5245} />
  </div><SiteFoot /></div></>;
}
