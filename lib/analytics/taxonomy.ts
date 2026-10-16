// Event names for LinearIsDead, following the shared IsDead contract (yourappisdead/ANALYTICS.md):
// super properties product/surface/platform, `<area>_<object>_<action>` names, enums and counts only, never user text.
export const PRODUCT = "linearisdead";
export type Surface = "landing" | "app";
export const EVENTS = {
  pageview: "$pageview",
  landing_cta_clicked: "landing_cta_clicked",
  app_signed_in: "app_signed_in",
  app_signed_up: "app_signed_up",
  app_issue_created: "app_issue_created",
  app_issue_updated: "app_issue_updated",
  app_issues_deleted: "app_issues_deleted",
  app_comment_added: "app_comment_added",
  app_project_created: "app_project_created",
  app_cycle_rolled_over: "app_cycle_rolled_over",
  app_command_menu_opened: "app_command_menu_opened",
  app_layout_changed: "app_layout_changed",
} as const;
export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
export type Props = Record<string, string | number | boolean | null | undefined>;
