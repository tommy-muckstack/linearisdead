import { SitePage, Hero } from "@/components/LnSite";
import { HUB, REPO } from "@/lib/sitemap";
export const metadata = { title: "Terms · LinearIsDead" };
export default function Page() {
  return <SitePage>
    <Hero eyebrow="Legal" title="Terms" sub="The short version: it's free, it's open source, and it comes with no warranty." />
    <section className="lns-in lns-prose">
      <h2>The software</h2><p>LinearIsDead is open source under the <a href={REPO + "/blob/main/LICENSE"}>Apache License 2.0</a>. You may use, change and redistribute it under that license.</p>
      <h2>The hosted app</h2><p>The copy at yourappisdead.com is provided as is, free of charge, without any warranty or uptime commitment. Keep your own backups with Settings › Import / export.</p>
      <h2>Acceptable use</h2><p>Don&apos;t use the hosted app to break the law, attack the service or store other people&apos;s personal data without their permission.</p>
      <h2>Privacy</h2><p>See the <a href={HUB + "/privacy"}>IsDead privacy policy</a>.</p>
      <h2>Trademarks</h2><p>LinearIsDead is an independent project. It is not affiliated with, endorsed by or sponsored by Linear Orbit, Inc. Linear is a trademark of its owner.</p>
    </section>
  </SitePage>;
}
