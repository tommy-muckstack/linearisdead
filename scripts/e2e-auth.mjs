// Login / sign-up / sign-out flow (findings 4, 8, 9, 10, 11).
import { run, ok, BASE, settle, shot } from "./e2e-lib.mjs";
await run("auth", async ({ newPage }) => {
  const p = await newPage();
  await p.goto(BASE + "/login");
  ok(await p.getByRole("heading", { name: "Log in to LinearIsDead" }).isVisible(), "login title");
  ok(await p.getByRole("button", { name: "Continue with Google" }).isVisible(), "Google button");
  ok(await p.getByRole("button", { name: "Continue with email" }).isVisible(), "email button");
  ok(!(await p.getByText(/SAML|passkey/i).count()), "no SAML / passkey buttons (IsDead auth rule)");
  const su = p.getByRole("link", { name: "Sign up" }), lm = p.getByRole("link", { name: "learn more" });
  ok((await su.getAttribute("href"))?.endsWith("/signup"), "'Sign up' is its own link to /signup");
  ok((await lm.getAttribute("href")) === "/linearisdead" || (await lm.getAttribute("href"))?.endsWith("/linearisdead/"), "'learn more' links to the homepage: " + await lm.getAttribute("href"));
  await shot(p, "06-login");
  await p.getByRole("button", { name: "Continue with email" }).click();
  ok(await p.getByRole("heading", { name: "What's your email address?" }).isVisible(), "email step heading");
  await p.getByRole("button", { name: "Continue with email" }).click();
  ok((await p.getByTestId("auth-error").innerText()) === "Please enter an email address for login.", "empty email → inline error");
  await shot(p, "07-login-email");
  await p.getByLabel("Email address").fill("not-an-email"); await p.keyboard.press("Enter");
  ok((await p.getByTestId("auth-error").innerText()) === "Please enter a valid email address.", "invalid email → inline error");
  await p.getByTestId("back-to-login").click();
  ok(await p.getByRole("heading", { name: "Log in to LinearIsDead" }).isVisible(), "Back to login returns to the provider list");
  await p.getByRole("button", { name: "Continue with email" }).click();
  await p.getByLabel("Email address").fill("someone@example.com"); await p.getByRole("button", { name: "Continue with email" }).click();
  ok(await p.getByRole("heading", { name: "Enter your password" }).isVisible(), "valid email → password step");
  await p.getByRole("link", { name: "Forgot password?" }).click();
  ok(await p.getByRole("heading", { name: "Reset your password" }).isVisible(), "forgot password → reset step");
  // sign-up has its own URL
  await p.getByTestId("back-to-login").click(); await p.getByRole("link", { name: "Sign up" }).click(); await p.waitForURL(/\/signup$/);
  ok(await p.getByRole("heading", { name: "Create your workspace" }).isVisible(), "/signup shows the sign-up screen");
  await p.getByRole("button", { name: "Continue with email" }).click(); await p.getByRole("button", { name: "Continue with email" }).click();
  ok((await p.getByTestId("auth-error").innerText()) === "Please enter an email address to sign up.", "sign-up empty email error");
  await shot(p, "08-signup");
  await p.goto(BASE + "/login?mode=signup"); ok(p.url().endsWith("/signup"), "old ?mode=signup links redirect to /signup");
  // marketing nav Sign up
  await p.goto(BASE + "/"); ok((await p.locator(".ln-nav .su").getAttribute("href"))?.endsWith("/signup"), "nav Sign up → /signup");
  // sign out → login, then /app is a fresh guest workspace
  await p.goto(BASE + "/login"); await p.getByRole("button", { name: "Use the demo account" }).click(); await p.waitForURL(/\/app/); await p.waitForSelector("[data-testid=linear-app]");
  await p.getByRole("button", { name: "Sign out" }).click(); await p.waitForURL(/\/login$/);
  ok(/\/login$/.test(p.url()), "sign out lands on the login page");
  await p.goto(BASE + "/app"); await p.waitForSelector("[data-testid=linear-app], [data-testid=onboarding]"); await settle(p);
  ok(await p.getByTestId("guest-signin").isVisible() || await p.getByTestId("onboarding").isVisible(), "/app after sign-out opens a guest workspace (documented exception)");
  if (await p.getByTestId("guest-signin").count()) { ok((await p.getByTestId("guest-signin").innerText()).includes("Sign in to keep your work"), "guest sidebar shows the sign-in prompt"); await shot(p, "15-signout-guest"); }
});
