// Every marketing link in one place: the nav mega-menus, the footer and the 390px layouts all read from here,
// so a link is either a real page in this app (or the repo / IsDead hub) or it does not exist.
export const REPO = "https://github.com/tommy-muckstack/linearisdead";
export const HUB = "https://yourappisdead.com";
export type SiteLink = { label: string; href: string; desc?: string };

export const PRODUCT_MENU: SiteLink[] = [
  { label: "Intake", href: "/intake", desc: "Requests become triaged issues" },
  { label: "Plan", href: "/plan", desc: "Projects, cycles, initiatives, roadmap" },
  { label: "Build", href: "/build", desc: "Issues, board and views at keyboard speed" },
  { label: "Pricing", href: "/pricing", desc: "Every feature, free" },
  { label: "Security", href: "/security", desc: "Where your data lives" },
];
export const RESOURCES_MENU: SiteLink[] = [
  { label: "Documentation", href: "/docs", desc: "Shortcuts, filters, quick create" },
  { label: "Changelog", href: "/changelog", desc: "What shipped, by date" },
  { label: "Customers", href: "/customers", desc: "How teams set it up" },
  { label: "Open source", href: REPO, desc: "Read, fork or contribute on GitHub" },
  { label: "More IsDead apps", href: HUB, desc: "Free replacements for paid tools" },
];
export const TOP_LINKS: SiteLink[] = [
  { label: "Customers", href: "/customers" }, { label: "Pricing", href: "/pricing" }, { label: "Now", href: "/now" }, { label: "Contact", href: "/contact" },
];
export const FOOTER: [string, SiteLink[]][] = [
  ["Product", [{ label: "Intake", href: "/intake" }, { label: "Plan", href: "/plan" }, { label: "Build", href: "/build" }, { label: "Pricing", href: "/pricing" }, { label: "Security", href: "/security" }]],
  ["Features", [{ label: "Triage", href: "/intake#triage" }, { label: "Projects", href: "/plan#projects" }, { label: "Cycles", href: "/plan#cycles" }, { label: "Initiatives", href: "/plan#initiatives" }, { label: "Views", href: "/build#views" }, { label: "Changelog", href: "/changelog" }]],
  ["Company", [{ label: "Customers", href: "/customers" }, { label: "Now", href: "/now" }, { label: "Contact", href: "/contact" }, { label: "IsDead apps", href: HUB }]],
  ["Resources", [{ label: "Documentation", href: "/docs" }, { label: "Shortcuts", href: "/docs#shortcuts" }, { label: "Open the app", href: "/app" }, { label: "Source code", href: REPO }]],
  ["Connect", [{ label: "Contact us", href: "/contact" }, { label: "GitHub", href: REPO }, { label: "Report a bug", href: REPO + "/issues" }]],
];
export const LEGAL: SiteLink[] = [{ label: "Privacy", href: HUB + "/privacy" }, { label: "Terms", href: "/terms" }, { label: "License", href: REPO + "/blob/main/LICENSE" }];
export const isExternal = (href: string) => /^https?:/.test(href);

/** Destination for a text link in the measured 390px layouts (they carry the original's link text, not hrefs). */
export function hrefForText(t: string): string {
  const s = t.trim().toLowerCase();
  const all = [...PRODUCT_MENU, ...RESOURCES_MENU, ...TOP_LINKS, ...FOOTER.flatMap(([, l]) => l), ...LEGAL];
  const hit = all.find(l => l.label.toLowerCase() === s); if (hit) return hit.href;
  if (/contact/.test(s)) return "/contact";
  if (/docs|documentation/.test(s)) return "/docs";
  if (/customer/.test(s)) return "/customers";
  if (/log ?in/.test(s)) return "/login";
  if (/sign ?up/.test(s)) return "/signup";
  if (/get started|start|try|open app/.test(s)) return "/app";
  return "/";
}
