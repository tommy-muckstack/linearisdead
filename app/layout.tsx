import "@/vendor/isdead-design/css/linear.css";
import "@/vendor/isdead-design/css/components.css";
import "./globals.css";
import "./auth-screen.css";
import { site } from "@/site.config";
import { Analytics } from "@/lib/analytics";
export const metadata = { title: `${site.name}: free, open-source issue tracking`, description: site.hero.subtitle };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" data-ids-theme="linear"><body className="ids-root">{children}<Analytics /></body></html>;
}
