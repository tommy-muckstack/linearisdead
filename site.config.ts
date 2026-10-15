import type { Site } from "@/lib/site-types";
const GH = "https://github.com/tommy-muckstack/linearisdead";
export const site: Site = {
  slug: "linearisdead", name: "LinearIsDead", replaces: "Linear", theme: "linear",
  glyph: "M5 7 H19 M5 12 H15 M5 17 H11",
  nav: [{ label: "Product", id: "product" }, { label: "Plan", id: "solutions" }, { label: "Shortcuts", id: "resources" }, { label: "Pricing", id: "pricing" }],
  cta: "Start building free",
  hero: { variant: "center", eyebrow: "Free · Open source · Keyboard-first", title: ["Plan the work.", "Ship the thing."], subtitle: "Issues, cycles and projects for small product teams, built so your hands never leave the keyboard. Every feature is free, with no seat limits and no plan gates.",
    primary: { label: "Open the demo", href: "/login" }, secondary: { label: "See pricing", href: "/#pricing" }, shot: "list.png", shotAlt: "The LinearIsDead issue list on a dark canvas, grouped by status with priority icons, labels and assignees" },
  audience: "Built for product teams of two to twenty who want a tracker that is faster than the standup it replaces",
  stepsTitle: "From idea to shipped in four moves",
  steps: [{ t: "Capture", d: "Press C and type. Quick-create syntax sets priority, assignee, label and project in one line." }, { t: "Triage", d: "Move with J and K, then S, P, A and L to set status, priority, assignee and labels without touching the mouse." }, { t: "Cycle", d: "Pull work into a two-week cycle, watch the burn-up, and roll unfinished issues forward in one click." }, { t: "Ship", d: "Close issues as they land. Projects roll their issues up into a single progress bar." }],
  rows: [
    { id: "product", k: "Issues", h: "A list that keeps up with you", p: "Group by status, priority, assignee or project. Filter with plain words like status:todo priority:high assignee:me. Select several issues with X and change them all at once.", img: "list.png", alt: "The issue list grouped by status with a focused row", cta: "Open the list" },
    { id: "board", k: "Board", h: "Drag work across the board", p: "Flip to the board with V. Drop a card in a column to change its status, or stay on the keyboard and press S.", img: "board.png", alt: "The kanban board with columns from Backlog to Done", cta: "Try the board" },
    { id: "solutions", k: "Cycles", h: "Two-week cycles with a real burn-up", p: "Scope, started and completed points at a glance, a burn-up chart for the current cycle, and one button to roll unfinished work into the next one.", img: "cycles.png", alt: "A cycle page with scope stats, a burn-up chart and its issues", cta: "See cycles" },
    { id: "resources", k: "Command menu", h: "Everything is one ⌘K away", p: "Jump to any issue, change any property or switch views from the command menu. Press ? at any time to see every shortcut.", img: "palette.png", alt: "The command menu open over the issue list", cta: "Open the command menu" },
  ],
  statsTitle: "Real numbers, no fine print",
  stats: [{ b: "$0", s: "per person, per month, forever" }, { b: "0 limits", s: "issues, members, cycles and projects are unlimited" }, { b: "20+", s: "keyboard shortcuts, all listed under ?" }, { b: "Apache-2.0", s: "fork it, change it, ship it" }],
  integrations: { title: "Your data stays yours", text: "Everything is stored in your browser until you sign in with a shared backend. Export and import are on the roadmap, and the whole app is a few thousand lines you can read in an afternoon." },
  pricing: { title: "What you'd pay to track issues elsewhere", vendor: "Linear", asOf: "October 2026", plans: [{ name: "Standard", perSeatMonth: 10, note: "billed monthly, per person" }, { name: "Plus", perSeatMonth: 16, note: "billed monthly, per person" }], seats: 8,
    footnote: "Linear's free plan caps issues and teams; paid plans lift those caps and add things like insights and integrations. We don't ship integrations or insights yet, so compare features, not just price.", featuresTitle: "Every feature, no plan gates",
    features: [{ name: "Unlimited issues", plan: "Standard" }, { name: "Cycles with burn-up and roll-over", plan: "Standard" }, { name: "Projects with progress", plan: "Standard" }, { name: "Command menu and full shortcut map", plan: "Free" }, { name: "Board and list layouts", plan: "Free" }, { name: "Unlimited members", plan: "Standard" }] },
  finalCta: { title: "Close your tickets. Cancel your seat.", sub: "Open the demo and press C." },
  footer: [
    { title: "Product", links: [{ label: "Issues", href: "/#product" }, { label: "Board", href: "/#board" }, { label: "Cycles", href: "/#solutions" }, { label: "Pricing", href: "/#pricing" }] },
    { title: "Get started", links: [{ label: "Log in", href: "/login" }, { label: "Try the demo account", href: "/login" }, { label: "Price comparison", href: "/#pricing" }] },
    { title: "Open source", links: [{ label: "GitHub", href: GH }, { label: "Apache-2.0 license", href: GH + "/blob/main/LICENSE" }] },
    { title: "More IsDead apps", links: [{ label: "NotionIsDead", href: "/notionisdead" }, { label: "AirtableIsDead", href: "/airtableisdead" }, { label: "OtterIsDead", href: "/otterisdead" }, { label: "CalendlyIsDead", href: "/calendlyisdead" }] },
  ],
  trademark: "LinearIsDead is an independent open-source project. It is not affiliated with, endorsed by or sponsored by Linear Orbit, Inc. Linear is a trademark of its owner.",
  repo: GH,
};
