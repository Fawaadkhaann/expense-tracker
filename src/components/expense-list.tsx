"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
      <div className="rounded-3xl border border-dashed border-line bg-card px-6 py-16 text-center text-muted">
        No expenses match these filters. Add one, or widen the date range.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map(([date, rows]) => (
        <section key={date} className="space-y-3">
          <h3 className="text-sm font-medium uppercase tracking-wider text-muted">
            {formatDate(date)}
          </h3>
          <ul className="space-y-2">
            {rows.map((expense) => {
              const meta = CATEGORY_META[expense.category];
              const isEditing = editingId === expense.id;
              return (
                <li
                  key={expense.id}
                  className="rounded-3xl border border-line bg-card p-4"
                >
                  {isEditing ? (
                    <ExpenseForm
                      expense={expense}
                      onDone={() => setEditingId(null)}
                    />
                  ) : (
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className="rounded-full px-3 py-1 text-xs font-medium"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        {meta.label}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {expense.description || meta.label}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(expense.amount)}
                      </p>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingId(expense.id)}
                          className="rounded-full p-2 text-muted hover:bg-canvas hover:text-ink"
                          aria-label="Edit expense"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={isPending && pendingId === expense.id}
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
                              await deleteExpense(expense.id);
                              router.refresh();
                              setPendingId(null);
                            });
                          }}
                          className="rounded-full p-2 text-muted hover:bg-red-50 hover:text-red-800"
                          aria-label="Delete expense"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
