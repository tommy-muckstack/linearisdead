import { SitePage, Hero } from "@/components/LnSite";
import { HUB, REPO } from "@/lib/sitemap";
export const metadata = { title: "Security · LinearIsDead" };
export default function Page() {
  return <SitePage>
    <Hero eyebrow="Security" title="Where your data lives" sub="A short, plain description of how sign-in and storage work, so you can decide what to put in it." />
    <section className="lns-in lns-prose">
      <h2>Sign-in</h2><p>Accounts use the shared IsDead sign-in (Firebase Authentication): Google, or email and password. The session is an httpOnly cookie. Passwords are never seen by this app. Guests get a signed, random guest id instead of an account.</p>
      <h2>Storage</h2><p>Your workspace (issues, projects, cycles, views, settings) is stored in this browser&apos;s local storage under your account or guest id. It doesn&apos;t leave the device unless you export it. Clearing site data deletes it, so export a backup from Settings › Import / export.</p>
      <h2>Analytics</h2><p>Usage events are counts and categories, never your issue text. See the <a href={HUB + "/privacy"}>privacy policy</a>.</p>
      <h2>Reporting a vulnerability</h2><p>Please report privately through <a href={REPO + "/security/advisories/new"}>GitHub security advisories</a>.</p>
    </section>
  </SitePage>;
}
