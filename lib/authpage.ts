import { BP } from "@/lib/basepath";
/** Where to go after signing in: a same-app path from ?callbackUrl (with or without the base path), else /app. */
export function afterAuth(callbackUrl?: string) {
  const rel = callbackUrl?.startsWith(BP + "/") ? callbackUrl.slice(BP.length) : callbackUrl;
  return BP + (rel && /^\/(?!\/)/.test(rel) ? rel : "/app");
}
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** The inline message the email step shows (same wording as the original), or "" when the address is usable. */
export function emailError(email: string, signup = false): string {
  const e = email.trim();
  if (!e) return signup ? "Please enter an email address to sign up." : "Please enter an email address for login.";
  if (!EMAIL_RE.test(e)) return "Please enter a valid email address.";
  return "";
}
