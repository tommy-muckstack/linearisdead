import { SitePage, Hero } from "@/components/LnSite";
import { CHANGELOG } from "@/lib/changelog";
export const metadata = { title: "Changelog · LinearIsDead" };
export default function Page() {
  return <SitePage>
    <Hero eyebrow="Changelog" title="What's new" sub="New features and fixes, newest first. Every change is in the public repository too." />
    <section className="lns-in lns-log">{CHANGELOG.map(e => <article key={e.title} className="lns-entry"><time dateTime={e.date}>{new Date(e.date + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}</time>
      <div><h2>{e.title}</h2><p>{e.body}</p>{e.items && <ul>{e.items.map(i => <li key={i}>{i}</li>)}</ul>}</div></article>)}</section>
  </SitePage>;
}
