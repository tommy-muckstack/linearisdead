import Link from "next/link";
import { SiteNav, SiteFoot } from "@/components/LnSite";
export const metadata = { title: "Page not found · LinearIsDead" };
export default function NotFound() {
  return <div className="lns"><SiteNav /><main className="lns-in lns-404" data-testid="not-found">
    <span className="lns-eyebrow">Error 404</span><h1>This page doesn&apos;t exist</h1>
    <p>The link may be old, or the address has a typo. Workspace addresses go straight to the app, so you may have been looking for that.</p>
    <div><Link href="/app" className="lns-btn">Open the app</Link><Link href="/" className="lns-btn ghost">Go to the homepage</Link></div>
  </main><SiteFoot /></div>;
}
