"use client";

import { CATEGORIES, CATEGORY_META, type Category } from "@/lib/categories";

export type Filters = {
  category: Category | "all";
  from: string;
  to: string;
};

export function ExpenseFilters({
  value,
  onChange,
}: {
  value: Filters;
  onChange: (next: Filters) => void;
}) {
  return (
    <div className="grid gap-3 rounded-3xl border border-line bg-card p-4 sm:grid-cols-3">
      <label className="space-y-1.5">
        <span className="text-sm text-muted">Category</span>
        <select
          value={value.category}
          onChange={(event) =>
            onChange({
              ...value,
              category: event.target.value as Filters["category"],
            })
          }
          className="w-full rounded-2xl border border-line bg-canvas px-3 py-2.5 outline-none ring-accent focus:ring-2"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_META[category].label}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1.5">
        <span className="text-sm text-muted">From</span>
        <input
          type="date"
          value={value.from}
          onChange={(event) => onChange({ ...value, from: event.target.value })}
          className="w-full rounded-2xl border border-line bg-canvas px-3 py-2.5 outline-none ring-accent focus:ring-2"
        />
      </label>
      <label className="space-y-1.5">
        <span className="text-sm text-muted">To</span>
        <input
          type="date"
          value={value.to}
          onChange={(event) => onChange({ ...value, to: event.target.value })}
          className="w-full rounded-2xl border border-line bg-canvas px-3 py-2.5 outline-none ring-accent focus:ring-2"
        />
      </label>
    </div>
  );
}
