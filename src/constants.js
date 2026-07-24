export const REGIONS = [
  "Australia",
  "New Zealand",
  "Singapore",
  "Thailand",
  "Indonesia",
  "Japan",
  "China",
  "India",
];

export const BRAND = {
  name: "Battlegrounds HQ",
  shortName: "BGHQ",
  region: "APAC South",
  tagline: "Compete. Conquer. Rise.",
  game: "Apex Legends",
  logo: "/logo.png",
  mark: "/favicon-mark.png",
};

export const STATUS_COLORS = {
  open: "#34C759",
  live: "#FF3B30",
  registration_closed: "#FFC107",
  completed: "#94A3B8",
  draft: "#64748B",
  archived: "#475569",
  pending: "#FFC107",
  approved: "#34C759",
  rejected: "#FF3B30",
  active: "#34C759",
};

export const formatCategory = (c) =>
  String(c || "")
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export const formatPrize = (amount, currency = "USD") => {
  const n = Number(amount || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
};

export const formatDate = (value) => {
  if (!value) return "TBA";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
