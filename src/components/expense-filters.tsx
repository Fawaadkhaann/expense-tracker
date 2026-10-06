"use client";

import { Search } from "lucide-react";
import {
  CATEGORIES,
  CATEGORY_META,
  type Category,
} from "@/lib/categories";

export type Filters = {
  category: Category | "all";
  from: string;
  to: string;
  search: string;
};

export function ExpenseFilters({
  value,
  onChange,
}: {
  value: Filters;
  onChange: (next: Filters) => void;
}) {
  return (
    <div className="space-y-4 rounded-3xl border border-line bg-card p-4">
      {/* Search */}
      <label className="space-y-1.5">
        <span className="text-sm text-muted">
          Search expenses
        </span>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

          <input
            type="text"
            placeholder="Search by description..."
            value={value.search}
            onChange={(event) =>
              onChange({
                ...value,
                search: event.target.value,
              })
            }
            className="w-full rounded-2xl border border-line bg-canvas py-2.5 pl-10 pr-3 outline-none ring-accent focus:ring-2"
          />
        </div>
      </label>

      {/* Filters */}
      <div className="grid gap-3 sm:grid-cols-3">
        {/* Category */}
        <label className="space-y-1.5">
          <span className="text-sm text-muted">
            Category
          </span>

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

        {/* From */}
        <label className="space-y-1.5">
          <span className="text-sm text-muted">
            From
          </span>

          <input
            type="date"
            value={value.from}
            onChange={(event) =>
              onChange({
                ...value,
                from: event.target.value,
              })
            }
            className="w-full rounded-2xl border border-line bg-canvas px-3 py-2.5 outline-none ring-accent focus:ring-2"
          />
        </label>

        {/* To */}
        <label className="space-y-1.5">
          <span className="text-sm text-muted">
            To
          </span>

          <input
            type="date"
            value={value.to}
            onChange={(event) =>
              onChange({
                ...value,
                to: event.target.value,
              })
            }
            className="w-full rounded-2xl border border-line bg-canvas px-3 py-2.5 outline-none ring-accent focus:ring-2"
          />
        </label>
      </div>
    </div>
  );
}