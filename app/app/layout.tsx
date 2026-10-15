import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import "./linear.css";
export const dynamic = "force-dynamic";
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/login?callbackUrl=" + encodeURIComponent("/app"));
  return <div className="app-root">{children}</div>;
}
