import { demoEnabled } from "@/lib/session";
import { firebaseClientConfig, firebaseConfigured } from "@/lib/isdead-auth/config";
import { LinAuth } from "@/components/LinAuth";
import { afterAuth } from "@/lib/authpage";
export const dynamic = "force-dynamic";
export const metadata = { title: "Sign up · LinearIsDead" };
export default async function Signup({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams;
  return <LinAuth config={firebaseConfigured() ? firebaseClientConfig() : null} demo={demoEnabled()} to={afterAuth(callbackUrl)} signup />;
}
