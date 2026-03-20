type AnyRecord = Record<string, string>;

// Mantine theme color names used across the app.
export const PRIMARY_CTA_COLOR = "brand";
export const SECONDARY_ACTION_COLOR = "steel";
export const APPROVE_ACTION_COLOR = "green";
export const REJECT_ACTION_COLOR = "red";

export const ROLE_LABELS: AnyRecord = {
  MASTER_ADMIN: "Master Admin",
  BOARD: "Board",
  SENIOR_CORE: "Senior Core",
  JUNIOR_CORE: "Junior Core",
};

// Keep role colors consistent across every page.
// Minimized palette: brand/steel/yellow/red.
export const ROLE_COLORS: AnyRecord = {
  MASTER_ADMIN: "red",
  BOARD: "brand",
  SENIOR_CORE: "steel",
  JUNIOR_CORE: "yellow",
};

function enumLabel(value: unknown) {
  if (typeof value !== "string" || value.trim().length === 0) return "Unknown";

  return value
    .trim()
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

export function roleLabel(role: unknown) {
  if (typeof role === "string" && ROLE_LABELS[role]) return ROLE_LABELS[role];
  return enumLabel(role);
}

export function roleColor(role: unknown) {
  if (typeof role === "string" && ROLE_COLORS[role]) return ROLE_COLORS[role];
  return "ink";
}

// Activity badges: collapse to the same semantic set.
export const ACTIVITY_ACTION_COLORS: AnyRecord = {
  loan_requested: "yellow",
  loan_approved: "green",
  loan_rejected: "red",
  loan_closed: "steel",
  member_created: "steel",
  role_changed: "steel",
  item_updated: "steel",
};

export function activityActionColor(action: unknown) {
  if (typeof action === "string" && ACTIVITY_ACTION_COLORS[action]) return ACTIVITY_ACTION_COLORS[action];
  return "steel";
}
