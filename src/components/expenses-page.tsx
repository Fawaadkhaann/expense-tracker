"use client";

import { useMemo, useState } from "react";
import { MotionConfig } from "motion/react";
import { Plus } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Dialog } from "@/components/dialog";
import type { Expense } from "@/types/expense";
import {
  ExpenseFilters,
  type Filters,
} from "@/components/expense-filters";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";

export function ExpensesPage({
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
    search: "",
  });

  const filtered = useMemo(() => {
    return expenses.filter((expense) => {
      // Category filter
      if (
        filters.category !== "all" &&
        expense.category !== filters.category
      ) {
        return false;
      }

      // From date filter
      if (
        filters.from &&
        expense.expense_date < filters.from
      ) {
        return false;
      }

      // To date filter
      if (
        filters.to &&
        expense.expense_date > filters.to
      ) {
        return false;
      }

      // Search filter
      if (
        filters.search &&
        !expense.description
          ?.toLowerCase()
          .includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [expenses, filters]);

  return (
    <MotionConfig reducedMotion="user">
      <AppShell
        activePath="/expenses"
        email={email}
        actions={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="ledger-button min-h-10 px-3 sm:px-4"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add expense</span>
            <span className="sm:hidden">Add</span>
          </button>
        }
      >
        <div className="-mx-4 -my-6 space-y-7 bg-finance-canvas px-4 py-6 sm:-mx-6 sm:-my-8 sm:space-y-8 sm:px-6 sm:py-8 xl:-mx-10 xl:px-10">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-finance-indigo">
              Transactions
            </p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-finance-ink sm:text-4xl">
              All expenses
            </h2>
            <p className="mt-2 text-sm text-finance-muted">
              View, filter, and manage your transactions.
            </p>
          </div>
          <span className="rounded-full border border-finance-line bg-finance-surface px-3 py-1.5 text-xs font-semibold text-finance-muted">
            {filtered.length} {filtered.length === 1 ? "expense" : "expenses"}
          </span>
        </section>

        <section className="ledger-card rounded-3xl border-finance-line bg-finance-surface p-5 shadow-md shadow-slate-900/5 sm:p-6">
          <div className="mb-5">
            <h3 className="text-base font-semibold tracking-tight text-finance-ink">
              Filter expenses
            </h3>
            <p className="mt-1 text-sm text-finance-muted">
              Narrow down your transactions by category, search, or date.
            </p>
          </div>
          <ExpenseFilters
            value={filters}
            onChange={setFilters}
            appearance="workspace"
          />
        </section>

        <section className="ledger-card overflow-hidden rounded-3xl border-finance-line bg-finance-surface p-5 shadow-md shadow-slate-900/5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold tracking-tight text-finance-ink">
                Transactions
              </h3>
              <p className="mt-1 text-sm text-finance-muted">
                {filtered.length}{" "}
                {filtered.length === 1 ? "expense" : "expenses"} found
              </p>
            </div>
          </div>
          <ExpenseList expenses={filtered} />
        </section>
        </div>

        {open && (
          <Dialog
            title="Add expense"
            description="Record a new transaction."
            onClose={() => setOpen(false)}
          >
            <ExpenseForm onDone={() => setOpen(false)} />
          </Dialog>
        )}
      </AppShell>
    </MotionConfig>
  );
}