"use client";

import { useMemo, useState } from "react";
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

      <section>
        <h2 className="text-2xl font-semibold tracking-tight">
          All expenses
        </h2>
        <p className="mt-1 text-sm text-muted">
          View, filter, and manage your transactions.
        </p>
      </section>

      <section className="ledger-card p-5 sm:p-6">
        <div className="mb-5">
          <h3 className="text-base font-semibold">Filter expenses</h3>
          <p className="mt-1 text-sm text-muted">
            Narrow down your transactions by category, search, or date.
          </p>
        </div>
        <ExpenseFilters value={filters} onChange={setFilters} />
      </section>

      <section className="ledger-card p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">Transactions</h3>
            <p className="mt-1 text-sm text-muted">
              {filtered.length} {filtered.length === 1 ? "expense" : "expenses"}{" "}
              found
            </p>
          </div>
        </div>
        <ExpenseList expenses={filtered} />
      </section>

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
  );
}