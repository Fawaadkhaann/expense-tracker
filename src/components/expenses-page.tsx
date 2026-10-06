"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  LogOut,
  Plus,
  Receipt,
  Settings,
  Wallet,
  X,
} from "lucide-react";

import { signOut } from "@/actions/auth";
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
    <div className="min-h-screen bg-canvas text-ink">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-line bg-card lg:flex lg:flex-col">
          <div className="flex h-20 items-center gap-3 border-b border-line px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-card">
              <Wallet className="h-5 w-5" />
            </div>

            <div>
              <p className="font-semibold tracking-tight">
                Ledger
              </p>

              <p className="text-xs text-muted">
                Personal finance
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted">
              Workspace
            </p>

            <Link
              href="/dashboard"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition hover:bg-canvas hover:text-ink"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>

            <Link
              href="/expenses"
              className="flex w-full items-center gap-3 rounded-xl bg-ink px-3 py-2.5 text-sm font-medium text-card"
            >
              <Receipt className="h-4 w-4" />
              Expenses
            </Link>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition hover:bg-canvas hover:text-ink"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition hover:bg-canvas hover:text-ink"
            >
              <FileText className="h-4 w-4" />
              Reports
            </button>
          </nav>

          <div className="border-t border-line p-4">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition hover:bg-canvas hover:text-ink"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>

            <form
              action={signOut}
              className="mt-1"
            >
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition hover:bg-canvas hover:text-ink"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </form>
          </div>
        </aside>

        {/* Main area */}
        <div className="min-w-0 flex-1">

          {/* Header */}
          <header className="sticky top-0 z-30 border-b border-line bg-card/90 backdrop-blur">
            <div className="flex h-20 items-center justify-between px-5 sm:px-8">

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted">
                  Transactions
                </p>

                <h1 className="mt-1 text-xl font-semibold tracking-tight">
                  Expenses
                </h1>
              </div>

              <div className="flex items-center gap-3">

                <div className="hidden text-right sm:block">
                  <p className="max-w-[220px] truncate text-sm font-medium">
                    {email}
                  </p>

                  <p className="text-xs text-muted">
                    Account
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-card shadow-sm transition hover:bg-accent"
                >
                  <Plus className="h-4 w-4" />

                  <span className="hidden sm:inline">
                    Add expense
                  </span>

                  <span className="sm:hidden">
                    Add
                  </span>
                </button>

              </div>
            </div>
          </header>

          {/* Content */}
          <main className="mx-auto w-full max-w-7xl space-y-6 p-5 sm:p-8">

            {/* Page introduction */}
            <section>
              <h2 className="text-2xl font-semibold tracking-tight">
                All expenses
              </h2>

              <p className="mt-1 text-sm text-muted">
                View, filter, and manage your transactions.
              </p>
            </section>

            {/* Filters */}
            <section className="rounded-2xl border border-line bg-card p-5 shadow-sm sm:p-6">

              <div className="mb-5">
                <h3 className="text-base font-semibold">
                  Filter expenses
                </h3>

                <p className="mt-1 text-sm text-muted">
                  Narrow down your transactions by category, search, or date.
                </p>
              </div>

              <ExpenseFilters
                value={filters}
                onChange={setFilters}
              />

            </section>

            {/* Results */}
            <section className="rounded-2xl border border-line bg-card p-5 shadow-sm sm:p-6">

              <div className="mb-5 flex items-center justify-between gap-4">

                <div>
                  <h3 className="text-base font-semibold">
                    Transactions
                  </h3>

                  <p className="mt-1 text-sm text-muted">
                    {filtered.length}{" "}
                    {filtered.length === 1
                      ? "expense"
                      : "expenses"}{" "}
                    found
                  </p>
                </div>

              </div>

              <ExpenseList expenses={filtered} />

            </section>

          </main>
        </div>
      </div>

      {/* Add expense modal */}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 backdrop-blur-sm sm:items-center">

          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-line bg-card shadow-2xl">

            <div className="flex items-center justify-between border-b border-line px-6 py-5">

              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Add expense
                </h2>

                <p className="mt-1 text-sm text-muted">
                  Record a new transaction.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl p-2 text-muted transition hover:bg-canvas hover:text-ink"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <div className="p-6">
              <ExpenseForm
                onDone={() => setOpen(false)}
              />
            </div>

          </div>
        </div>
      ) : null}
    </div>
  );
}