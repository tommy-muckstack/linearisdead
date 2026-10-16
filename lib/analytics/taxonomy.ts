// Analytics taxonomy for LinearIsDead on the shared IsDead PostHog project 666931 (contract: yourappisdead/ANALYTICS.md,
// see docs/ANALYTICS.md). Super properties: product ("linearisdead"), surface ("landing" = logged-out marketing pages and
// login/signup, "app" = the working product under /app), platform ("web"). Page views are PostHog's built-in $pageview.
// Events are `app_<object>_<action>` (or `landing_<object>_<action>` for marketing CTAs); the product name lives in
// `product`, never in an event name. Properties are enums, counts, ids and booleans only, never user text.
export const PRODUCT = "linearisdead" as const;
export const APP = PRODUCT;
export type Surface = "landing" | "app";
export const EVENTS = {
  pageview: "$pageview",
  landing_cta_clicked: "landing_cta_clicked",     // target (data-cta value: nav_login | nav_signup | menu_login | menu_signup | footer_get_started | footer_open_app | pricing_get_started)
  app_signed_up: "app_signed_up",                 // method ("password" | "google")
  app_signed_in: "app_signed_in",                 // method ("password" | "google")
  app_signed_out: "app_signed_out",
  app_issue_created: "app_issue_created",         // priority, has_project, has_assignee
  app_issue_updated: "app_issue_updated",         // field (status | priority | assignee | labels | ...), count
  app_issues_deleted: "app_issues_deleted",       // count
  app_comment_added: "app_comment_added",
  app_project_created: "app_project_created",
  app_initiative_created: "app_initiative_created",
  app_cycle_rolled_over: "app_cycle_rolled_over", // count
  app_triage_accepted: "app_triage_accepted",
  app_triage_declined: "app_triage_declined",
  app_view_saved: "app_view_saved",               // from ("views_page" | "filter_bar"), has_filter
  app_layout_changed: "app_layout_changed",       // layout ("list" | "board")
  app_settings_changed: "app_settings_changed",   // section (preferences | notifications | workspace | members | labels | team | ...)
  app_command_menu_opened: "app_command_menu_opened",
} as const;
export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
export type Props = Record<string, string | number | boolean | null | undefined>;
export const EVENT_PREFIXES = ["app_", "landing_"] as const;
/** Super properties every event carries (yourappisdead/ANALYTICS.md §1). */
export const superProps = (surface: Surface) => ({ product: PRODUCT, surface, platform: "web" as const });
/** Super properties older IsDead taxonomies persisted in the shared yourappisdead.com cookie. Unregistered at boot. */
export const LEGACY_PROPS = ["app", "app_family", "base_path", "suite_id", "app_id", "schema_version", "source", "site_id", "environment"] as const;
