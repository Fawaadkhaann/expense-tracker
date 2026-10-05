import { CATEGORY_META, type Category } from "@/lib/categories";
import { formatCurrency } from "@/lib/format";
import type { Expense } from "@/types/expense";

export function SpendingStats({ expenses }: { expenses: Expense[] }) {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const byCategory = new Map<Category, number>();
  for (const expense of expenses) {
    byCategory.set(
      expense.category,
      (byCategory.get(expense.category) ?? 0) + expense.amount,
    );
  }
  const top = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <article className="rounded-3xl border border-line bg-card p-5">
        <p className="text-sm text-muted">Total spending</p>
        <p className="display mt-3 text-4xl">{formatCurrency(total)}</p>
        <p className="mt-2 text-sm text-muted">
          {expenses.length} {expenses.length === 1 ? "expense" : "expenses"} in
          view
        </p>
      </article>
      <article className="rounded-3xl border border-line bg-card p-5">
        <p className="text-sm text-muted">Top category</p>
        <p className="display mt-3 text-4xl">
          {top ? CATEGORY_META[top[0]].label : "—"}
        </p>
        <p className="mt-2 text-sm text-muted">
          {top ? formatCurrency(top[1]) : "Add expenses to see a breakdown"}
        </p>
      </article>
    </div>
  );
}
