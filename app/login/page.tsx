import { demoEnabled } from "@/lib/session";
import { firebaseClientConfig, firebaseConfigured } from "@/lib/isdead-auth/config";
import { LinAuth } from "@/components/LinAuth";
import { afterAuth } from "@/lib/authpage";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export const metadata = { title: "Log in · LinearIsDead" };
export default async function Login({ searchParams }: { searchParams: Promise<{ callbackUrl?: string; mode?: string }> }) {
  const { callbackUrl, mode } = await searchParams;
  // old links used /login?mode=signup; sign-up has its own URL now
  if (mode === "signup") redirect(callbackUrl ? `/signup?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/signup");
  return <LinAuth config={firebaseConfigured() ? firebaseClientConfig() : null} demo={demoEnabled()} to={afterAuth(callbackUrl)} signup={false} />;
}
