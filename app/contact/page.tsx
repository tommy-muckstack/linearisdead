import { SitePage, Hero } from "@/components/LnSite";
import { HUB, REPO } from "@/lib/sitemap";
export const metadata = { title: "Contact · LinearIsDead" };
export default function Page() {
  return <SitePage active="Contact">
    <Hero eyebrow="Contact" title="Talk to us" sub="LinearIsDead has no sales team and nothing to sell. The fastest way to reach the people who build it is GitHub." />
    <section className="lns-in lns-cards">
      <div className="lns-card"><h3>Report a bug</h3><p>Something broken or confusing? Open an issue with the steps to reproduce it.</p><a className="lns-more" href={REPO + "/issues/new"}>Open an issue →</a></div>
      <div className="lns-card"><h3>Ask or suggest</h3><p>Questions, feature ideas and setups you want to share all go in the issue tracker.</p><a className="lns-more" href={REPO + "/issues"}>Browse issues →</a></div>
      <div className="lns-card"><h3>Security</h3><p>Found a vulnerability? Report it privately through GitHub security advisories, not a public issue.</p><a className="lns-more" href={REPO + "/security/advisories/new"}>Report privately →</a></div>
    </section>
    <section className="lns-in lns-prose"><p>For anything about the IsDead family of apps as a whole, use the <a href={HUB + "/contact"}>IsDead contact page</a>.</p></section>
  </SitePage>;
}
