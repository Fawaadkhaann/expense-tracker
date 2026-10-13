
"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Pencil, Trash2 } from "lucide-react";

import { deleteExpense } from "@/actions/expenses";
import { CATEGORY_META } from "@/lib/categories";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Expense } from "@/types/expense";
import { ExpenseForm } from "@/components/expense-form";

export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const grouped = useMemo(() => {
    const map = new Map<string, Expense[]>();

    for (const expense of expenses) {
      const list = map.get(expense.expense_date) ?? [];
      list.push(expense);
      map.set(expense.expense_date, list);
    }

    return Array.from(map.entries());
  }, [expenses]);

  if (expenses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-dashed border-line bg-canvas/50 px-6 py-12 text-center"
      >
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent"
          aria-hidden="true"
        >
          <Pencil className="h-6 w-6" />
        </div>

        <h3 className="font-semibold text-ink">
          No expenses found
        </h3>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
          No expenses match your current filters. Try changing the date range
          or category, or add a new expense.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-7">
      {grouped.map(([date, rows]) => (
        <section key={date} className="space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
              {formatDate(date)}
            </h3>

            <div className="h-px flex-1 bg-line" />

            <span className="rounded-full border border-line bg-card px-2.5 py-1 text-xs font-medium text-muted">
              {rows.length} {rows.length === 1 ? "expense" : "expenses"}
            </span>
          </div>

          <ul className="space-y-2.5">
            {rows.map((expense, index) => {
              const meta = CATEGORY_META[expense.category];
              const isEditing = editingId === expense.id;
              const isDeleting = isPending && pendingId === expense.id;

              return (
                <motion.li
                  key={expense.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: Math.min(index * 0.04, 0.2),
                    ease: "easeOut",
                  }}
                  whileHover={isEditing ? undefined : { y: -2 }}
                  className="group rounded-2xl border border-line bg-card p-4 transition-[border-color,box-shadow] duration-200 hover:border-accent/30 hover:shadow-md sm:p-5 motion-reduce:transform-none motion-reduce:transition-none"
                >
                  {isEditing ? (
                    <ExpenseForm
                      expense={expense}
                      onDone={() => setEditingId(null)}
                    />
                  ) : (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/10 bg-accent-soft text-accent">
                          <span className="text-sm font-bold">
                            {meta.label.slice(0, 1).toUpperCase()}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="break-words font-semibold leading-5 text-ink">
                            {expense.description || meta.label}
                          </p>

                          <span className="mt-1.5 inline-flex max-w-full rounded-full border border-line bg-canvas px-2.5 py-1 text-xs font-medium text-muted">
                            {meta.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <p className="break-words text-base font-bold tabular-nums text-ink sm:text-right">
                          {formatCurrency(expense.amount)}
                        </p>

                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingId(expense.id)}
                            className="ledger-icon-button transition-all duration-200 hover:scale-105 hover:bg-accent-soft hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                            aria-label={`Edit expense: ${expense.description || meta.label}`}
                            title="Edit expense"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => {
                              if (
                                !confirm(
                                  "Delete this expense? This cannot be undone.",
                                )
                              ) {
                                return;
                              }

                              setPendingId(expense.id);

                              startTransition(async () => {
                                try {
                                  await deleteExpense(expense.id);
                                  router.refresh();
                                } finally {
                                  setPendingId(null);
                                }
                              });
                            }}
                            className="ledger-icon-button transition-all duration-200 hover:scale-105 hover:bg-danger-soft hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Delete expense: ${expense.description || meta.label}`}
                            title={isDeleting ? "Deleting..." : "Delete expense"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
