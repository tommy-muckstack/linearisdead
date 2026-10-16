import { SitePage, Hero, Feature } from "@/components/LnSite";
export const metadata = { title: "Plan · LinearIsDead" };
export default function Page() {
  return <SitePage>
    <Hero eyebrow="Plan" title={<>Plan the work,<br />then watch it move</>} sub="Projects for the work you're shipping, cycles for the next two weeks, and initiatives that tie them to the goals behind them. Every planning feature is free." cta={{ label: "Open Projects", href: "/app/projects" }} />
    <Feature id="projects" k="Projects" title="Projects with real progress" text="Give a project a lead, a status and a target date. Progress rolls up from its issues, so the bar is never a guess." points={["Planned, started, paused and completed states", "Per-project issue lists with the same keyboard controls", "Target dates feed the roadmap"]} img="/home/list.png" alt="Issues grouped by status" link={{ label: "See projects", href: "/app/projects" }} />
    <Feature id="cycles" k="Cycles" title="Two-week cycles with a burn-up" text="Cycles are created for you. Each one shows scope, started and completed points, a burn-up chart, and a button that rolls unfinished work into the next cycle." img="/home/cycles.png" alt="A cycle with stats, burn-up chart and issues" link={{ label: "See cycles", href: "/app/cycles" }} />
    <Feature id="initiatives" k="Initiatives" title="Initiatives connect projects to goals" text="Group projects under an initiative, set its status and owner, and see how many of its projects are on track." link={{ label: "See initiatives", href: "/app/initiatives" }} />
    <Feature id="roadmap" k="Roadmap" title="A roadmap drawn from your projects" text="Every project with a start or target date appears on a month-by-month timeline. Change a date on the project and the roadmap follows." link={{ label: "Open the roadmap", href: "/app/roadmap" }} />
  </SitePage>;
}
