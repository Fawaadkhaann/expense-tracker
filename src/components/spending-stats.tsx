
"use client";

import { motion } from "motion/react";
import { Tags, Wallet } from "lucide-react";

import { CATEGORY_META, type Category } from "@/lib/categories";
import { formatCurrency } from "@/lib/format";
import type { Expense } from "@/types/expense";

export function SpendingStats({ expenses }: { expenses: Expense[] }) {
  const total = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );

  const byCategory = new Map<Category, number>();

  for (const expense of expenses) {
    byCategory.set(
      expense.category,
      (byCategory.get(expense.category) ?? 0) + expense.amount,
    );
  }

  const top = [...byCategory.entries()].sort(
    (a, b) => b[1] - a[1],
  )[0];

  const cardClass =
    "ledger-card h-full border-line bg-card p-5 shadow-sm sm:p-6";

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <motion.article
        whileHover={{ y: -3 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className={cardClass}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted">
              Total spending
            </p>

            <p className="mt-3 break-words text-3xl font-semibold tracking-tight text-ink tabular-nums sm:text-4xl">
              {formatCurrency(total)}
            </p>
          </div>

          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-accent/15 bg-accent-soft text-accent"
            aria-hidden="true"
          >
            <Wallet className="h-5 w-5" strokeWidth={1.8} />
          </div>
        </div>

        <div className="mt-5 border-t border-line pt-3">
          <p className="text-sm text-muted">
            {expenses.length}{" "}
            {expenses.length === 1 ? "expense" : "expenses"} in view
          </p>
        </div>
      </motion.article>

      <motion.article
        whileHover={{ y: -3 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className={cardClass}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted">
              Top category
            </p>

            <p className="mt-3 break-words text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {top ? CATEGORY_META[top[0]].label : "—"}
            </p>
          </div>

          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-accent/15 bg-accent-soft text-accent"
            aria-hidden="true"
          >
            <Tags className="h-5 w-5" strokeWidth={1.8} />
          </div>
        </div>

        <div className="mt-5 border-t border-line pt-3">
          <p className="text-sm text-muted">
            {top
              ? `${formatCurrency(top[1])} spent in this category`
              : "Add expenses to see a breakdown"}
          </p>
        </div>
      </motion.article>
    </div>
  );
}
