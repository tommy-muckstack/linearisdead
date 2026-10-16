import Link from "next/link";
import { SitePage, Hero } from "@/components/LnSite";
import { REPO } from "@/lib/sitemap";
export const metadata = { title: "Customers · LinearIsDead" };
const SETUPS: [string, string, string[]][] = [
  ["Two-person startup", "One team, weekly releases. Triage catches bug reports, the cycle holds what ships this week, and everything else waits in the backlog.", ["One team, Triage on", "One-week cycles", "Views: My bugs, This release"]],
  ["Agency with client work", "A project per client with a lead and a target date, grouped under an initiative per quarter. The roadmap is what clients see in the Monday call.", ["Projects per client", "Initiatives per quarter", "Roadmap for status calls"]],
  ["Open-source maintainers", "Issues are labelled by area, triaged on Fridays, and sub-issues break big releases into reviewable pieces.", ["Labels per area", "Sub-issues for releases", "Display: group by label"]],
];
export default function Page() {
  return <SitePage active="Customers">
    <Hero eyebrow="Customers" title={<>No logos.<br />Just teams shipping.</>} sub="LinearIsDead is free and open source, so there are no sales and no case studies yet. Here is how three kinds of team set it up." />
    <section className="lns-in lns-cards">{SETUPS.map(([t, d, pts]) => <div key={t} className="lns-card"><h3>{t}</h3><p>{d}</p><ul>{pts.map(p => <li key={p}>{p}</li>)}</ul></div>)}</section>
    <section className="lns-in lns-prose"><h2>Using LinearIsDead?</h2><p>Tell us how your team works and we&apos;ll add your setup here. Open a discussion on <a href={REPO + "/issues"}>GitHub</a>, or <Link href="/contact">get in touch</Link>.</p></section>
  </SitePage>;
}
