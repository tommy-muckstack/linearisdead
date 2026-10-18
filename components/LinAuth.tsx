"use client";
// LinearIsDead login / sign-up. Same step structure as the original (provider list → "What's your email address?" step
// with an inline error and "Back to login"), but auth is the shared IsDead Firebase: Google or email + password only.
import { useState } from "react";
import Link from "next/link";
import type { FirebaseClientConfig } from "@/lib/isdead-auth/config";
import { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword, authErrorMessage } from "@/lib/isdead-auth/client";
import { BP } from "@/lib/basepath";
import { Mark } from "@/components/Mark";
import { emailError } from "@/lib/authpage";

const GG = <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden><path fill="#fff" d="M23 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h6.2a5.3 5.3 0 01-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.4zM12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A11.5 11.5 0 0012 23.5zM5.6 14.2a6.9 6.9 0 010-4.4v-3H1.8a11.5 11.5 0 000 10.4zM12 5.4c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.5 11.5 0 001.8 6.8l3.8 3A6.9 6.9 0 0112 5.4z" /></svg>;
type Step = "choose" | "email" | "password" | "reset";
export function LinAuth({ config, demo, to, signup }: { config: FirebaseClientConfig | null; demo: boolean; to: string; signup: boolean }) {
  const [step, setStep] = useState<Step>("choose");
  const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [busy, setBusy] = useState(false), [err, setErr] = useState(""), [note, setNote] = useState("");
  const session = `${BP}/api/session`;
  const go = (s: Step) => { setStep(s); setErr(""); setNote(""); };
  const run = async (f: () => Promise<void>) => { setBusy(true); setErr(""); setNote(""); try { await f(); } catch (e) { setErr(authErrorMessage(e)); } finally { setBusy(false); } };
  const notConfigured = () => setErr("Sign-in isn't configured on this deployment yet. Use the demo account or open the app as a guest.");
  const google = () => { if (!config) return notConfigured(); run(async () => { await signInWithGoogle(config, session); window.location.assign(to); }); };
  const submitEmail = (e: React.FormEvent) => { e.preventDefault(); const m = emailError(email, signup); if (m) { setErr(m); return; } go("password"); };
  const submitPassword = (e: React.FormEvent) => { e.preventDefault();
    if (!config) return notConfigured();
    if (password.length < 6) { setErr(signup ? "Use at least 6 characters for your password." : "Please enter your password."); return; }
    run(async () => { if (signup) await signUpWithEmail(config, session, email.trim(), password); else await signInWithEmail(config, session, email.trim(), password); window.location.assign(to); }); };
  const submitReset = (e: React.FormEvent) => { e.preventDefault(); const m = emailError(email); if (m) { setErr(m); return; }
    if (!config) return notConfigured();
    run(async () => { await resetPassword(config, email.trim()); setStep("password"); setNote("If that email has an account, a reset link is on its way."); }); };
  const back = <p className="au-switch"><a href="#" onClick={e => { e.preventDefault(); go("choose"); }} data-testid="back-to-login">{signup ? "Back to sign up" : "Back to login"}</a></p>;
  const errEl = err && <p role="alert" className="au-err" data-testid="auth-error">{err}</p>;
  const noteEl = note && <p role="status" className="au-note">{note}</p>;
  const loginHref = to === `${BP}/app` ? "/login" : `/login?callbackUrl=${encodeURIComponent(to)}`;
  const signupHref = to === `${BP}/app` ? "/signup" : `/signup?callbackUrl=${encodeURIComponent(to)}`;

  let body: React.ReactNode;
  if (step === "choose") body = <>
    <h1>{signup ? "Create your workspace" : "Log in to LinearIsDead"}</h1>
    <button type="button" className="au-prov primary" disabled={busy} onClick={google}>{GG}<span>Continue with Google</span></button>
    <button type="button" className="au-prov" onClick={() => go("email")}>Continue with email</button>
    {errEl}
    {demo && <button type="button" className="au-demo" onClick={async () => { const r = await fetch(`${BP}/api/session/demo`, { method: "POST" }); if (r.ok) window.location.assign(to); }}>Use the demo account</button>}
    {signup ? <p className="au-switch">Already have an account? <Link href={loginHref}>Log in</Link></p>
      : <p className="au-switch">Don&apos;t have an account? <Link href={signupHref}>Sign up</Link> or <Link href="/">learn more</Link></p>}
    {signup && <p className="au-legal">Your workspace is free, with no plan limits. See the <a href="https://yourappisdead.com/privacy">privacy policy</a>.</p>}
  </>;
  else if (step === "email") body = <form onSubmit={submitEmail} noValidate>
    <h1>What&apos;s your email address?</h1>
    <input id="au-email" type="email" aria-label="Email address" placeholder="Enter your email address…" autoComplete="email" autoFocus value={email} onChange={e => { setEmail(e.target.value); setErr(""); }} />
    <button className="au-cta" disabled={busy}>Continue with email</button>
    {errEl}{back}
  </form>;
  else if (step === "password") body = <form onSubmit={submitPassword} noValidate>
    <h1>{signup ? "Choose a password" : "Enter your password"}</h1>
    <p className="au-sub">{email.trim()}</p>
    <input id="au-pass" type="password" aria-label="Password" placeholder={signup ? "At least 6 characters" : "Password"} autoFocus autoComplete={signup ? "new-password" : "current-password"} value={password} onChange={e => { setPassword(e.target.value); setErr(""); }} />
    <button className="au-cta" disabled={busy}>{signup ? "Create account" : "Log in"}</button>
    {errEl}{noteEl}
    {!signup && <p className="au-switch"><a href="#" onClick={e => { e.preventDefault(); go("reset"); }}>Forgot password?</a></p>}
    <p className="au-switch"><a href="#" onClick={e => { e.preventDefault(); go("email"); }}>Use a different email</a></p>
  </form>;
  else body = <form onSubmit={submitReset} noValidate>
    <h1>Reset your password</h1>
    <p className="au-sub">Enter your email and we&apos;ll send you a reset link.</p>
    <input type="email" aria-label="Email address" placeholder="Enter your email address…" autoComplete="email" autoFocus value={email} onChange={e => { setEmail(e.target.value); setErr(""); }} />
    <button className="au-cta" disabled={busy}>Email me a reset link</button>
    {errEl}{back}
  </form>;

  return <main className="au au--center au--lin" style={{ "--au-accent": "#5e6ad2", "--au-cta": "#5e6ad2", "--au-ctafg": "#fff", "--au-r": "6px", "--au-ink": "#1b1c1f", "--au-muted": "#6a6b70", "--au-bg": "#f8f8f9" } as React.CSSProperties}>
    <div className="au-body"><section className="au-main"><div className="au-form" data-testid={signup ? "signup" : "login"}>
      <div className="au-logoc"><Link href="/" aria-label="LinearIsDead home"><Mark size={32} /></Link></div>
      {!config && step === "choose" && <p role="status" className="au-note" style={{ textAlign: "center" }}>Email and Google sign-in turn on once Firebase is configured for this deployment.</p>}
      {body}
    </div></section></div>
  </main>;
}
