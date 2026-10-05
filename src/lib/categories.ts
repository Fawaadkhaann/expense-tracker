export const CATEGORIES = [
  "food",
  "transport",
  "shopping",
  "bills",
  "entertainment",
  "health",
  "education",
  "other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_META: Record<
  Category,
  { label: string; color: string; bg: string }
> = {
  food: { label: "Food", color: "#c45c26", bg: "#f8e4d6" },
  transport: { label: "Transport", color: "#2f5d8c", bg: "#dce8f5" },
  shopping: { label: "Shopping", color: "#7a3ea8", bg: "#eadcf4" },
  bills: { label: "Bills", color: "#1d6b58", bg: "#d7efe6" },
  entertainment: { label: "Entertainment", color: "#9a6b12", bg: "#f6e7c4" },
  health: { label: "Health", color: "#b03a4a", bg: "#f6dce0" },
  education: { label: "Education", color: "#355f8a", bg: "#d9e6f4" },
  other: { label: "Other", color: "#5f574e", bg: "#e8e2d8" },
};

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}
