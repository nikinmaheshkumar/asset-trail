type AnyRecord = Record<string, string>;

function enumLabel(value: unknown) {
  if (typeof value !== "string" || value.trim().length === 0) return "Unknown";

  return value
    .trim()
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

export const ITEM_STATUS_LABELS: AnyRecord = {
  WORKING: "Working",
  NEEDS_TESTING: "Needs Testing",
  FAULTY: "Faulty",
  SCRAP: "Scrap",
};

export const ITEM_STATUS_COLORS: AnyRecord = {
  WORKING: "green",
  NEEDS_TESTING: "yellow",
  FAULTY: "red",
  SCRAP: "ink",
};

export function itemStatusLabel(status: unknown) {
  if (typeof status === "string" && ITEM_STATUS_LABELS[status]) return ITEM_STATUS_LABELS[status];
  return enumLabel(status);
}

export function itemStatusColor(status: unknown) {
  if (typeof status === "string" && ITEM_STATUS_COLORS[status]) return ITEM_STATUS_COLORS[status];
  return "ink";
}

export const LOAN_STATUS_LABELS: AnyRecord = {
  REQUESTED: "Requested",
  APPROVED: "Approved",
  CLOSED: "Closed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

export const LOAN_STATUS_COLORS: AnyRecord = {
  REQUESTED: "yellow",
  APPROVED: "steel",
  CLOSED: "green",
  REJECTED: "red",
  CANCELLED: "ink",
};

export function loanStatusLabel(status: unknown) {
  if (typeof status === "string" && LOAN_STATUS_LABELS[status]) return LOAN_STATUS_LABELS[status];
  return enumLabel(status);
}

export function loanStatusColor(status: unknown) {
  if (typeof status === "string" && LOAN_STATUS_COLORS[status]) return LOAN_STATUS_COLORS[status];
  return "ink";
}
