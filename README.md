# LinearIsDead

Free, open-source Linear alternative. Part of the [IsDead series](https://yourappisdead.com). Served at `https://yourappisdead.com/linearisdead`.

**Status: open source, not deployed yet**. Surfaces follow `templates/marketing-site.md` in `@isdead/design`: one marketing page (`/`, price comparison at `#pricing`), `/login`, and the app at `/app`.

## What works
- **Marketing site:** home and pricing at the original's layout, plus /intake, /plan, /build, /customers, /changelog, /now, /contact, /docs, /security and /terms. Product and Resources mega-menus, a routed footer, a 390px menu sheet. `/<workspace-url>` opens your workspace, and other unknown paths get a branded 404.
- **Auth:** shared IsDead sign-in (Google, or email + password). Login has the original's email step with inline errors; /signup has its own URL. Guests can use the app without an account and keep their work when they sign in.
- **Onboarding:** workspace name and URL, first team and identifier, teammates, then a sample or empty workspace.
- **Issues:** create (C, with quick-create syntax `!urgent @me #bug +project ~3 /progress`), with labels, estimate, due date and parent issue. Sub-issues with progress, and an activity log of every change next to the comments. Edit in a side pane, undo with ⌘Z.
- **Keyboard-first:** J/K move, Enter opens, X multi-selects, S/P/A/L/R/U/E plus ⇧D (due) and ⇧P (parent) set properties, V toggles list/board, / filters, G-then-key navigation, ⌘K command menu, ? shortcut sheet.
- **Navigation:** Inbox (teammates' activity on your issues), My issues (Assigned / Created / Subscribed / Activity), Triage (1 accept, 2 decline, 3 duplicate), Initiatives, Projects, Roadmap (timeline by project dates), Views, Teams, Active / Backlog / All issues, Cycles.
- **Display options:** list or board, grouping and sub-grouping, ordering, show sub-issues, show empty groups, visible properties. Saved views keep their own filter and display, and can be starred into the sidebar.
- **Settings:** preferences, profile, inbox notifications, security (reset email, sign out everywhere), workspace name/URL/delete, members, labels, JSON/CSV export and JSON import, and team settings (identifier, triage, cycle length, estimate scale).
- Core logic is pure functions in `lib/linear/model.ts`, with unit tests in `tests/unit`. Browser checks are in `scripts/e2e-*.mjs` (Playwright, real mouse and keyboard). `npm run shots` is the production smoke test.

## Known gaps
- Data lives in the browser (localStorage, per account or guest). Cross-device sync and shared multi-user workspaces need a server-side store. Use Settings › Import / export to move a workspace.
- No integrations (GitHub, Slack…), code reviews, AI agent, insights or SLAs.
- Linear's brand font (Inter Display) is approximated with Inter Tight. Berkeley Mono is not shipped.

## Verify
```
NODE_OPTIONS=--unhandled-rejections=warn npx next dev -p 3041
BASE=http://localhost:3041/linearisdead node scripts/e2e-hygiene.mjs   # also e2e-auth, -pages, -marketing, -issues, -app-nav, -settings, -display
TAG=after node scripts/qa-shots.mjs                                    # screenshots + 390px horizontal-scroll check
```

## Auth
Shared Firebase project `yourappisdead` (email/password + Google), helpers in `lib/isdead-auth` (vendored from `isdead-design/auth`). The session cookie `isdead_session` has path `/`, so one sign-in covers every IsDead app. Env: `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_SERVICE_ACCOUNT_JSON`. Without them, `/login` shows "Sign-in not configured". The single demo account ("Use the demo account") is available outside production or with `DEMO_MODE=1`.

## Develop
```
npm install
npm run dev        # http://localhost:3000/linearisdead
npm test           # unit tests
npm run typecheck
npm run build && npm run shots   # product screenshots + end-to-end smoke test (Playwright)
```
Theme and font: `vendor/isdead-design` (OFL fonts, see `fonts/*/OFL-*.txt`). Not affiliated with Linear; all trademarks belong to their owners. Apache-2.0.
