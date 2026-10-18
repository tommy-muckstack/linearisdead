import { describe, expect, it } from "vitest";
import { afterAuth, emailError } from "@/lib/authpage";
describe("login email step", () => {
  it("shows the original's empty-email message", () => { expect(emailError("")).toBe("Please enter an email address for login."); expect(emailError("  ", true)).toBe("Please enter an email address to sign up."); });
  it("rejects malformed addresses", () => { for (const e of ["a", "a@b", "a b@c.d", "@c.de"]) expect(emailError(e)).toBe("Please enter a valid email address."); });
  it("accepts normal addresses", () => { expect(emailError(" someone@example.com ")).toBe(""); });
});
describe("afterAuth", () => {
  it("keeps same-app paths and drops everything else", () => {
    expect(afterAuth()).toBe("/linearisdead/app");
    expect(afterAuth("/app/my")).toBe("/linearisdead/app/my");
    expect(afterAuth("/linearisdead/app/settings")).toBe("/linearisdead/app/settings");
    expect(afterAuth("//evil.com")).toBe("/linearisdead/app");
    expect(afterAuth("https://evil.com")).toBe("/linearisdead/app");
  });
});
