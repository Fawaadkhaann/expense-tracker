"use client";

import { useMemo, useState } from "react";
import { Plus, Wallet, X } from "lucide-react";
import { signOut } from "@/actions/auth";
import type { Expense } from "@/types/expense";
import { ExpenseFilters, type Filters } from "@/components/expense-filters";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { MonthlyChart } from "@/components/monthly-chart";
import { SpendingStats } from "@/components/spending-stats";

export function Dashboard({
  expenses,
  email,
}: {
  expenses: Expense[];
  email: string;
}) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    category: "all",
    from: "",
    to: "",
  });

  const filtered = useMemo(() => {
    return expenses.filter((expense) => {
      if (filters.category !== "all" && expense.category !== filters.category) {
        return false;
      }
      if (filters.from && expense.expense_date < filters.from) return false;
      if (filters.to && expense.expense_date > filters.to) return false;
      return true;
    });
  }, [expenses, filters]);

  return (
    <div className="min-h-full">
      <header className="border-b border-line bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-2 text-accent">
            <Wallet className="h-5 w-5" />
            <span className="font-semibold text-ink">Ledger</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden truncate text-muted sm:inline">{email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full px-3 py-1.5 text-muted hover:text-ink"
              >
                Log out
              </button>
            </form>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-card hover:bg-accent"
            >
              <Plus className="h-4 w-4" />
              Add expense
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8">
        <SpendingStats expenses={filtered} />
        <MonthlyChart expenses={expenses} />
        <ExpenseFilters value={filters} onChange={setFilters} />
        <ExpenseList expenses={filtered} />
      </main>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-[2rem] border border-line bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="display text-2xl">New expense</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-muted hover:bg-canvas"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ExpenseForm onDone={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
