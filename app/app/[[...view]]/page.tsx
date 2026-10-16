import { currentUser } from "@/lib/session";
import { Workspace } from "@/components/linear/Workspace";
import { firebaseClientConfig, firebaseConfigured } from "@/lib/isdead-auth/config";
export default async function AppHome({ params }: { params: Promise<{ view?: string[] }> }) {
  const user = (await currentUser())!; const { view } = await params;
  return <Workspace uid={user.id} name={user.name} email={user.email} demo={user.demo} guest={user.guest} view={view ?? []} firebase={firebaseConfigured() ? firebaseClientConfig() : null} />;
}
