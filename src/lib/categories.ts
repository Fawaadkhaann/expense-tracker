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
  { label: string }
> = {
  food: { label: "Food" },
  transport: { label: "Transport" },
  shopping: { label: "Shopping" },
  bills: { label: "Bills" },
  entertainment: { label: "Entertainment" },
  health: { label: "Health" },
  education: { label: "Education" },
  other: { label: "Other" },
};

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}
