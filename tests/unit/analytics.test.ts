import { describe, it, expect } from "vitest";
import { EVENTS, EVENT_PREFIXES, APP, LEGACY_PROPS, superProps } from "@/lib/analytics/taxonomy";
const custom = Object.values(EVENTS).filter(e => !e.startsWith("$"));
describe("analytics taxonomy", () => {
  it("uses the shared prefixes and snake_case", () => { for (const e of custom) { expect(e, e).toMatch(/^[a-z]+(_[a-z]+)+$/); expect(EVENT_PREFIXES.some(p => e.startsWith(p)), e).toBe(true); } });
  it("never puts the product name in an event name", () => { for (const e of custom) expect(e.includes(APP.replace(/isdead$/, ""))).toBe(false); });
  it("sends the hub's super properties", () => { expect(APP).toBe("linearisdead"); expect(superProps("app")).toEqual({ product: APP, surface: "app", platform: "web" }); });
  it("clears the legacy super properties", () => { for (const k of ["app", "app_family", "base_path", "suite_id", "app_id", "schema_version", "source", "site_id", "environment"]) expect(LEGACY_PROPS).toContain(k); });
});
import { scrub } from "@/lib/analytics/posthog";
describe("analytics privacy", () => {
  it("strips query strings, hashes and titles", () => {
    const e = scrub({ event: "$pageview", properties: { $current_url: "https://yourappisdead.com/linearisdead/app?q=secret#frag", $referrer: "https://google.com/search?q=me", title: "My private issue" } });
    expect(e.properties.$current_url).toBe("https://yourappisdead.com/linearisdead/app"); expect(e.properties.$referrer).toBe("https://google.com/search"); expect("title" in e.properties).toBe(false);
  });
});
