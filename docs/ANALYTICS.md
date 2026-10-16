# Analytics (PostHog)

One PostHog project (US cloud, project **666931**) collects the hub and every IsDead sub-app. The contract is the hub's
`yourappisdead/ANALYTICS.md`; this file is how LinearIsDead follows it.

## Setup
- `NEXT_PUBLIC_POSTHOG_KEY` = the project's publishable token (safe in the browser); `NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com`. No key → analytics is a no-op.
- Reverse proxy through the app's own origin: `/linearisdead/ingest/*` → `us.i.posthog.com` (rewrites in `next.config.mjs`, with `skipTrailingSlashRedirect: true` so `/ingest/e/` passes through unchanged).
- `<Analytics />` is mounted once in `app/layout.tsx`. It boots the client, sends `$pageview` per route change and `landing_cta_clicked` for any click on an element with `data-cta`.
- Off: autocapture, session replay, heatmaps, web-vitals capture. Nothing is sent from localhost or under Do Not Track.
- Privacy: `scrub` (`before_send`) keeps only origin + path on URL properties (`$current_url`, `$referrer`, `$pathname`, initial/prev variants) and drops the page `title`. Path ids (`/app/issue/<id>`, `/app/project/<id>`, `/app/view/<id>`) are random local ids, so nothing is masked (`PRIVATE_PATHS` is empty).
- Dev only: `localStorage.isdead_ph_debug = "1"` sends from localhost and from automated browsers, with verbose logs, and exposes `window.__posthog` (used by the kit's `ph-check.mjs`, which drops every event before it leaves the browser).

## Super properties (registered on every event)
| property | value | meaning |
| --- | --- | --- |
| `product` | `linearisdead` | the one property to filter by (the hub sends `yourappisdead`) |
| `surface` | `landing` \| `app` | `landing` = marketing pages, `/login`, `/signup`; `app` = everything under `/app` |
| `platform` | `web` | |
| `env` | `production` \| `development` | |
| `account_type` | `firebase` \| `guest` \| `demo` | registered once the workspace knows who is signed in |

At boot the client unregisters the legacy super properties other IsDead taxonomies left in the shared yourappisdead.com
cookie (`app`, `app_family`, `base_path`, `suite_id`, `app_id`, `schema_version`, `source`, `site_id`, `environment`) and then
registers its own. Never use those names as event properties.

## Identity
Signed-in accounts are identified by Firebase uid (`identify(uid)`, `account_type: "firebase"`). Guests and the demo account
are never identified. Sign-out (sidebar and Settings › Security) sends `app_signed_out`, calls `reset()` and re-registers
the super properties (because `reset()` clears them) before the logout form posts.

## Events
| event | properties | where |
| --- | --- | --- |
| `$pageview` | `$current_url` | `lib/analytics/posthog.tsx` |
| `landing_cta_clicked` | `target`: `nav_login` \| `nav_signup` \| `menu_login` \| `menu_signup` \| `footer_open_app` \| `footer_get_started` \| `pricing_get_started` | `data-cta` on `components/LnSite.tsx`, `LnShared.tsx`, `LnPricing.tsx` |
| `app_signed_up` / `app_signed_in` | `method`: `password` \| `google` (Google on `/signup` counts as sign-up) | `components/LinAuth.tsx` (sent with `trackNow` before the redirect) |
| `app_signed_out` | | `signOutSubmit` in the sign-out forms |
| `app_issue_created` | `priority`, `has_project`, `has_assignee` | `components/linear/Workspace.tsx` |
| `app_issue_updated` | `field`, `count` | pickers, board drag, bulk bar, issue pane |
| `app_issues_deleted` | `count` | |
| `app_comment_added` | | |
| `app_project_created` / `app_initiative_created` | | |
| `app_cycle_rolled_over` | `count` | |
| `app_triage_accepted` / `app_triage_declined` | | |
| `app_view_saved` | `from`: `views_page` \| `filter_bar`, `has_filter` | |
| `app_layout_changed` | `layout`: `list` \| `board` | display options / `V` |
| `app_settings_changed` | `section` (settings page slug, e.g. `preferences`, `workspace`, `team`) | |
| `app_command_menu_opened` | | ⌘K |

Rules:
- Names are `app_<object>_<action>` / `landing_<object>_<action>`, snake_case, past tense, and never contain the product name.
  `lib/analytics/taxonomy.ts` is the only place they are defined; `tests/unit/analytics.test.ts` enforces the format and the scrub.
- Properties are enums, counts, ids and booleans only. Never send issue titles, comments, names, emails or URLs.

## Checks
- `scripts/e2e-analytics.mjs` (dev server with the key set): drives the landing CTA, guest app, issue creation and ⌘K, and
  requires the `/ingest/e/` POSTs to succeed. It sends real `env=development` events through the proxy.
