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
  appearance = "default",
}: {
  value: Filters;
  onChange: (next: Filters) => void;
  appearance?: "default" | "workspace";
}) {
  const workspace = appearance === "workspace";
  const labelClass = workspace
    ? "text-xs font-semibold uppercase tracking-wide text-finance-muted"
    : "text-sm text-muted";
  const labelSpacingClass = workspace ? "space-y-2" : "space-y-1.5";
  const fieldSurfaceClass = workspace
    ? "border-finance-line bg-finance-surface-raised text-finance-ink placeholder:text-finance-muted focus:border-finance-indigo focus:ring-finance-indigo/20"
    : "";

  return (
    <div className={workspace ? "space-y-5" : "space-y-4"}>
      {/* Search */}
      <label className={`block ${labelSpacingClass}`}>
        <span className={labelClass}>
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
            className={`ledger-field ${
              workspace ? "py-3" : "py-2.5"
            } pl-10 pr-3 ${fieldSurfaceClass}`}
          />
        </div>
      </label>

      {/* Filters */}
      <div className="grid gap-3 sm:grid-cols-3">
        {/* Category */}
        <label className={`block ${labelSpacingClass}`}>
          <span className={labelClass}>
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
            className={`ledger-field px-3 py-2.5 ${fieldSurfaceClass}`}
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
        <label className={`block ${labelSpacingClass}`}>
          <span className={labelClass}>
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
            className={`ledger-field px-3 py-2.5 ${fieldSurfaceClass}`}
          />
        </label>

        {/* To */}
        <label className={`block ${labelSpacingClass}`}>
          <span className={labelClass}>
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
            className={`ledger-field px-3 py-2.5 ${fieldSurfaceClass}`}
          />
        </label>
      </div>
    </div>
  );
}