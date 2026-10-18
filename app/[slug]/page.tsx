import { notFound, redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
export const dynamic = "force-dynamic";
// Like the original, a single unknown path segment is read as a workspace URL (yourappisdead.com/linearisdead/<workspace>):
// signed-in visitors and guests go to their workspace, everyone else to the login page. Anything else is a branded 404.
export default async function WorkspaceSlug({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9][a-z0-9-]{1,47}$/i.test(slug)) notFound();
  if (await currentUser()) redirect("/app");
  redirect("/login?callbackUrl=%2Fapp");
}
