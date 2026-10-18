// Release notes shown on /changelog and the homepage. Real dates from the repository history.
export const CHANGELOG: { date: string; title: string; body: string; items?: string[] }[] = [
  { date: "2026-10-16", title: "Parity sprint: triage, settings, sub-issues, views", body: "A hands-on comparison against the paid original turned up 18 gaps. This release closes them.", items: ["Inbox, My issues tabs, Triage, Initiatives, Roadmap and Views pages", "Workspace onboarding: name, URL, team and teammates", "Settings for your account, the workspace, members, labels, teams, import and export", "Labels, estimate, due date and parent issue in the create modal; sub-issues; a full activity log", "Display options: grouping, sub-grouping, ordering and visible properties", "Product, Plan, Build, Customers, Now, Contact and Docs pages, plus a branded 404"] },
  { date: "2026-10-16", title: "Sign in with Google or email", body: "Sign-in uses the shared IsDead account, so one login covers every IsDead app. There are no verification emails, and password resets work." },
  { date: "2026-10-15", title: "No sign-up needed", body: "Open the app and start working as a guest. Sign in later and your work comes with you." },
  { date: "2026-10-15", title: "First release", body: "Issues, cycles, projects, the board, the command menu and quick-create syntax, keyboard-first from day one." },
];
