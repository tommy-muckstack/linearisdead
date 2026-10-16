"use client";
// Marketing chrome shared by every page: nav with Product / Resources mega-menus (hover, click and keyboard),
// a mobile menu sheet, and the footer. Links come from lib/sitemap.ts. Original art and copy.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Mark } from "./Mark";
import { BP } from "@/lib/basepath";
import "./lnsite.css";
import { FOOTER, LEGAL, PRODUCT_MENU, RESOURCES_MENU, TOP_LINKS, isExternal, type SiteLink } from "@/lib/sitemap";

const A = ({ l, className, onClick }: { l: SiteLink; className?: string; onClick?: () => void }) => isExternal(l.href)
  ? <a href={l.href} className={className} onClick={onClick}>{l.label}{l.desc && <small>{l.desc}</small>}</a>
  : <Link href={l.href} className={className} onClick={onClick}>{l.label}{l.desc && <small>{l.desc}</small>}</Link>;

function Mega({ label, items, open, setOpen }: { label: string; items: SiteLink[]; open: string | null; setOpen: (v: string | null) => void }) {
  const on = open === label; const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  const enter = () => { clearTimeout(t.current); setOpen(label); }, leave = () => { t.current = setTimeout(() => setOpen(null), 120); };
  return <div className={"lns-mega" + (on ? " on" : "")} onMouseEnter={enter} onMouseLeave={leave}>
    <button type="button" aria-expanded={on} aria-haspopup="true" onClick={() => setOpen(on ? null : label)} onFocus={enter}>{label}<svg width="9" height="9" viewBox="0 0 10 10" aria-hidden><path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" /></svg></button>
    {on && <div className="lns-panel" role="menu" aria-label={label}>{items.map(l => <A key={l.label} l={l} className="lns-item" onClick={() => setOpen(null)} />)}</div>}
  </div>;
}

export function SiteNav({ active }: { active?: string }) {
  const [open, setOpen] = useState<string | null>(null); const [sheet, setSheet] = useState(false);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(null); setSheet(false); } }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, []);
  return <header className="lns-nav" data-testid="site-nav"><div className="lns-in">
    <Link href="/" className="lns-logo" aria-label="LinearIsDead home"><Mark size={20} /><b>LinearIsDead</b></Link>
    <nav aria-label="Main" className="lns-links">
      <Mega label="Product" items={PRODUCT_MENU} open={open} setOpen={setOpen} />
      <Mega label="Resources" items={RESOURCES_MENU} open={open} setOpen={setOpen} />
      {TOP_LINKS.map(l => <Link key={l.label} href={l.href} className={active === l.label ? "on" : ""}>{l.label}</Link>)}
    </nav>
    <div className="lns-acts"><Link href="/login" className="lns-li">Log in</Link><Link href="/signup" className="lns-su">Sign up</Link>
      <button type="button" className="lns-burger" aria-label="Menu" aria-expanded={sheet} onClick={() => setSheet(s => !s)}><i /><i /></button></div>
  </div>
    {sheet && <div className="lns-sheet" role="dialog" aria-label="Menu">
      <b>Product</b>{PRODUCT_MENU.map(l => <A key={l.label} l={{ ...l, desc: undefined }} onClick={() => setSheet(false)} />)}
      <b>Resources</b>{RESOURCES_MENU.map(l => <A key={l.label} l={{ ...l, desc: undefined }} onClick={() => setSheet(false)} />)}
      <b>Company</b>{TOP_LINKS.map(l => <A key={l.label} l={l} onClick={() => setSheet(false)} />)}
      <div className="lns-sheet__cta"><Link href="/login">Log in</Link><Link href="/signup" className="lns-su">Sign up</Link></div>
    </div>}
  </header>;
}

export function SiteFoot() {
  return <footer className="lns-foot" data-testid="site-foot"><div className="lns-in">
    <Link href="/" className="lns-foot__mark" aria-label="LinearIsDead home"><Mark size={18} /></Link>
    <div className="lns-cols">{FOOTER.map(([h, ls]) => <div key={h}><b>{h}</b>{ls.map(l => <A key={l.label} l={l} />)}</div>)}</div>
  </div>
    <div className="lns-in lns-legal">{LEGAL.map(l => <A key={l.label} l={l} />)}
      <p>LinearIsDead is an independent open-source project. It is not affiliated with, endorsed by or sponsored by Linear Orbit, Inc. Linear is a trademark of its owner.</p></div>
  </footer>;
}

export function SiteCta() {
  return <section className="lns-cta"><div className="lns-in"><h2>Built for the future.<br />Free today.</h2>
    <div><Link href="/app" className="lns-btn">Open the app</Link><Link href="/contact" className="lns-btn ghost">Contact us</Link></div></div></section>;
}

/** Shell for the flow-layout pages (/plan, /build, /changelog, …). */
export function SitePage({ active, children }: { active?: string; children: React.ReactNode }) {
  return <div className="lns"><SiteNav active={active} /><main className="lns-main">{children}</main><SiteCta /><SiteFoot /></div>;
}
export function Hero({ eyebrow, title, sub, cta }: { eyebrow?: string; title: React.ReactNode; sub: string; cta?: { label: string; href: string } }) {
  return <section className="lns-hero lns-in">{eyebrow && <span className="lns-eyebrow">{eyebrow}</span>}<h1>{title}</h1><p>{sub}</p>
    {cta && <Link href={cta.href} className="lns-btn">{cta.label}</Link>}</section>;
}
export function Feature({ id, k, title, text, img, alt, points, link }: { id?: string; k: string; title: string; text: string; img?: string; alt?: string; points?: string[]; link?: { label: string; href: string } }) {
  return <section id={id} className="lns-feat lns-in"><div className="lns-feat__txt"><span className="lns-eyebrow">{k}</span><h2>{title}</h2><p>{text}</p>
    {points && <ul>{points.map(p => <li key={p}>{p}</li>)}</ul>}{link && <Link href={link.href} className="lns-more">{link.label} →</Link>}</div>
    {img && <figure className="lns-shot">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={BP + img} alt={alt ?? ""} loading="lazy" width={1440} height={900} /></figure>}</section>;
}
