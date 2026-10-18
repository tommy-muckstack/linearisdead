import { SitePage, Hero, Feature } from "@/components/LnSite";
export const metadata = { title: "Build · LinearIsDead" };
export default function Page() {
  return <SitePage>
    <Hero eyebrow="Build" title={<>Issues at the speed<br />of your keyboard</>} sub="A list that keeps up with you, a board you can drag, sub-issues, due dates and saved views. J and K to move, S, P, A and L to change things, ⌘K for everything else." cta={{ label: "Open the app", href: "/app" }} />
    <Feature id="issues" k="Issues" title="Everything an issue needs" text="Status, priority, assignee, labels, estimate, due date, project, cycle and a parent issue. The activity log records every change next to the comments." points={["Sub-issues with their own progress", "Undo any change with ⌘Z", "Select several with X and change them together"]} img="/home/issue.png" alt="An issue open in the side pane" />
    <Feature id="board" k="Board" title="Drag work across the board" text="Press V to flip between list and board. Drop a card in a column to change its status, or stay on the keyboard." img="/home/board.png" alt="The board with columns from Backlog to Done" />
    <Feature id="views" k="Views" title="Display options and saved views" text="Group and sub-group by status, priority, assignee, project, cycle or label. Order by priority, dates or status, and choose which properties show on each row. Save any filter and layout as a view and find it again in the sidebar." link={{ label: "Open Views", href: "/app/views" }} />
    <Feature id="command-menu" k="Command menu" title="Everything is one ⌘K away" text="Jump to any issue, change any property or switch views without the mouse. Press ? at any time for the full shortcut list." img="/home/palette.png" alt="The command menu" link={{ label: "All shortcuts", href: "/docs#shortcuts" }} />
  </SitePage>;
}
