import Link from "next/link";
import { SitePage, Hero } from "@/components/LnSite";
import { REPO } from "@/lib/sitemap";
export const metadata = { title: "Now · LinearIsDead" };
export default function Page() {
  return <SitePage active="Now">
    <Hero eyebrow="Now" title="Notes from the build" sub="Short essays on how LinearIsDead is made and why it costs nothing." />
    <section className="lns-in lns-prose">
      <h2 id="free">Why it's free</h2>
      <p>An issue tracker is a list, a few views and a lot of keyboard shortcuts. None of that needs a per-seat price. LinearIsDead runs on a free hosting tier, keeps its data small, and never calls a paid API, so there is nothing to pass on to you.</p>
      <h2 id="data">Where your issues live</h2>
      <p>Your workspace is saved in this browser and tied to your account. Export it as JSON or CSV from Settings at any time, and import it on another machine. The whole app is a few thousand lines you can read in an afternoon.</p>
      <h2 id="keyboard">Keyboard first, on purpose</h2>
      <p>Every action has a key. The mouse works everywhere, but you shouldn&apos;t need it. Press <span className="lns-kbd">?</span> in the app for the full map, or read the <Link href="/docs#shortcuts">shortcut list</Link>.</p>
      <h2 id="next">What's next</h2>
      <p>The roadmap is the issue list in the <a href={REPO}>repository</a>. Shared multi-user workspaces are the largest open item.</p>
    </section>
  </SitePage>;
}
