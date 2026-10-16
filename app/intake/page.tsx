import { SitePage, Hero, Feature } from "@/components/LnSite";
export const metadata = { title: "Intake · LinearIsDead" };
export default function Page() {
  return <SitePage>
    <Hero eyebrow="Intake" title={<>Every request,<br />routed and triaged</>} sub="Capture work the moment it shows up, then sort it in one pass. Requests land in Triage, get accepted, declined or merged, and only then reach the team's backlog." cta={{ label: "Open Triage", href: "/app/triage" }} />
    <Feature id="triage" k="Triage" title="One inbox for new work" text="Issues filed into Triage wait for a decision. Accept moves an issue into the team's Todo, Decline cancels it with a note, and Duplicate links it to the issue it repeats." points={["Accept, decline or mark duplicate from the keyboard", "Triage count in the sidebar so nothing sits unseen", "Turn Triage on or off per team in settings"]} img="/home/list.png" alt="The issue list grouped by status" link={{ label: "How triage works", href: "/docs#triage" }} />
    <Feature id="quick-create" k="Quick create" title="File an issue in one line" text="Press C anywhere and type. Tokens in the title set the rest: !high for priority, @me to assign, #bug for a label, +billing for a project, ~3 for an estimate." img="/home/palette.png" alt="The command menu over the issue list" link={{ label: "Quick-create syntax", href: "/docs#quick-create" }} />
    <Feature id="inbox" k="Inbox" title="Know what changed" text="Your Inbox collects activity on issues you are assigned to, created or follow: status moves, new comments and reassignments. Mark items read, or clear them all at once." link={{ label: "Open your Inbox", href: "/app/inbox" }} />
  </SitePage>;
}
