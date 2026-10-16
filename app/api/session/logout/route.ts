import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, DEMO_COOKIE, GUEST_COOKIE, cookieOptions, verifySessionCookie, revokeSessions } from "@/lib/isdead-auth/server";
import { BP } from "@/lib/basepath";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  const jar = await cookies();
  const id = await verifySessionCookie(jar.get(SESSION_COOKIE)?.value);
  if (id) await revokeSessions(id.uid);
  // Like Linear, signing out lands on the login page. Relative Location keeps the user on the public
  // domain (req.url is the *.vercel.app origin).
  const res = new NextResponse(null, { status: 303, headers: { Location: BP + "/login" } });
  res.cookies.set(SESSION_COOKIE, "", cookieOptions(0));
  res.cookies.set(DEMO_COOKIE, "", cookieOptions(0));
  res.cookies.set(GUEST_COOKIE, "", cookieOptions(0)); // the next visit to /app starts a fresh guest workspace
  return res;
}
