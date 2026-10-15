import Link from "next/link";
import "./lnhome.css";

export const LnMark = ({ s = 20 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="11" fill="#e6e8ec" /><path d="M3.2 14.2L9.8 20.8M2.6 11.4l10 10M3.8 8.2l12 12M6 5.8l12.2 12.2M9.4 3.4L20.6 14.6" stroke="#0b0c0e" strokeWidth="1.5" strokeLinecap="round" /></svg>;
export function LnNav({ active }: { active?: string }) {
  const L = ["Product", "Resources", "Customers", "Pricing", "Now", "Contact"];
  return <header className="ln-nav"><Link href="/" className="lg"><LnMark s={20} /><b>Linear</b></Link>
    <nav>{L.map((l) => l === "Pricing" ? <Link key={l} href="/pricing" className={active === l ? "on" : ""}>{l}</Link> : <a key={l} className={active === l ? "on" : ""}>{l}</a>)}</nav>
    <Link href="/login" className="li">Log in</Link><Link href="/login" className="su">Sign up</Link></header>;
}
const FC: [string, string[]][] = [["Product", ["Intake", "Plan", "AI", "Build", "Pricing", "Security"]], ["Features", ["Asks", "Agents", "Coding Sessions", "Customer Requests", "Insights", "Mobile", "Integrations", "Changelog"]], ["Company", ["About", "Customers", "Careers", "Now", "Method", "Quality", "Brand"]], ["Resources", ["Switch", "Download", "Documentation", "Developers", "Status", "Enterprise", "Startups"]], ["Connect", ["Contact us", "Community", "X (Twitter)", "GitHub", "YouTube"]]];
export function LnCta({ top }: { top: number }) {
  return <>
    <h2 className="cta" style={{ top }}>Built for the future.<br />Available today.</h2>
    <div className="ctb" style={{ top: top + 187 }}><Link href="/login" className="a">Get started</Link><a>Contact sales</a></div>
  </>;
}
export function LnFoot({ top }: { top: number }) {
  return <footer className="ln-foot" style={{ top }}>
    <span className="lm"><LnMark s={18} /></span>
    {FC.map(([h, ls], i) => <div key={h} className="fc" style={{ left: 304 + i * 224 }}><b>{h}</b>{ls.map((l) => <a key={l}>{l}</a>)}</div>)}
    <div className="lg2"><a>Privacy</a><a>Terms</a><a>DPA</a><a>AUP</a></div>
  </footer>;
}
