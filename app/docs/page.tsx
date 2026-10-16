import Link from "next/link";
import { SitePage, Hero } from "@/components/LnSite";
import { FILTERS, QUICK_CREATE, SHORTCUTS } from "@/lib/linear/shortcuts";
export const metadata = { title: "Documentation · LinearIsDead" };
const T = ({ rows }: { rows: [string, string][] }) => <table className="lns-table"><tbody>{rows.map(([k, v]) => <tr key={k}><td><code>{k}</code></td><td>{v}</td></tr>)}</tbody></table>;
export default function Page() {
  return <SitePage>
    <Hero eyebrow="Documentation" title="How LinearIsDead works" sub="Everything you need to run a team on it: the workspace, triage, planning, views and every shortcut." />
    <section className="lns-in lns-prose">
      <p>On this page: <a href="#start">Getting started</a> · <a href="#triage">Triage</a> · <a href="#planning">Planning</a> · <a href="#views">Views</a> · <a href="#quick-create">Quick create</a> · <a href="#filters">Filters</a> · <a href="#shortcuts">Shortcuts</a> · <a href="#data">Your data</a></p>
      <h2 id="start">Getting started</h2>
      <p>Open <Link href="/app">the app</Link>. You can start as a guest without signing up, and you get a short setup: name the workspace, pick its URL, name your first team and add teammates. Sign in with Google or email whenever you want to keep your work on your account.</p>
      <h2 id="triage">Triage</h2>
      <p>New issues filed into Triage wait for a decision. <b>Accept</b> (1) moves an issue to Todo, <b>Decline</b> (2) cancels it, and <b>Duplicate</b> (3) cancels it and links it to the original. Turn Triage on or off in Settings › Teams.</p>
      <h2 id="planning">Projects, cycles, initiatives and the roadmap</h2>
      <p>Projects group issues toward a result and carry a lead, status, start and target date. Cycles are back-to-back windows (two weeks by default, set per team) with a burn-up chart. Initiatives group projects. The roadmap places every dated project on a timeline.</p>
      <h2 id="views">Display options and views</h2>
      <p>Open <b>Display</b> on any issue list to choose list or board, grouping and sub-grouping, ordering, and which properties show on each row. Type a filter and press <b>Save view</b> to keep the filter and the display settings. Saved views live under Views in the sidebar.</p>
      <h2 id="quick-create">Quick-create syntax</h2>
      <p>Press <span className="lns-kbd">C</span> and type a title. These tokens are taken out of the title and set the property instead:</p><T rows={QUICK_CREATE} />
      <h2 id="filters">Filter language</h2>
      <p>Press <span className="lns-kbd">/</span> on any list and combine:</p><T rows={FILTERS} />
      <h2 id="shortcuts">Keyboard shortcuts</h2><T rows={SHORTCUTS} />
      <h2 id="data">Your data</h2>
      <p>The workspace is stored in your browser for your account or guest id. Export JSON or CSV, or import a JSON backup, from Settings › Import / export.</p>
    </section>
  </SitePage>;
}
