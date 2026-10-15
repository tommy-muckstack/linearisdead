# LinearIsDead

Free, open-source Linear alternative. Part of the [IsDead series](https://yourappisdead.com). Served at `https://yourappisdead.com/linearisdead`.

**Status: open source, not deployed yet**. Surfaces follow `templates/marketing-site.md` in `@isdead/design`: one marketing page (`/`, price comparison at `#pricing`), `/login`, and the app at `/app`.

## What works
- **Issues:** create (C, with quick-create syntax `!urgent @me #bug +project ~3 /progress`), edit in a side pane, comment, delete, undo (⌘Z).
- **Keyboard-first:** J/K move, Enter opens, X multi-selects, S/P/A/L/R/U/E set status, priority, assignee, labels, project, cycle and estimate, V toggles list/board, / filters, G-then-key navigation, ⌘K command menu, ? shortcut sheet.
- **Views:** list grouped by status/priority/assignee/project, drag-and-drop board, My issues, Active, Backlog, All.
- **Filter language:** `status:todo priority:high assignee:me label:bug project:x cycle:current is:open` plus free text.
- **Cycles:** two-week cycles created automatically, scope/started/completed stats, burn-up chart, roll unfinished issues into the next cycle.
- **Projects:** create, set status, per-project progress.
- Core logic is pure functions in `lib/linear/model.ts` with 25 unit tests; `npm run shots` runs a Playwright keyboard smoke test.

## Known gaps
- Data lives in the browser (localStorage, per user). Cross-device sync and team sharing need a Firestore-backed store.
- No integrations, notifications, roadmap view, sub-issues, import/export or insights.
- Linear's brand font (Inter Display) is approximated with Inter Tight; Berkeley Mono is not shipped.

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
