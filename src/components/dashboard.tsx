
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  LogOut,
  Moon,
  Plus,
  Receipt,
  Repeat,
  Settings,
  Sun,
  Wallet,
  X,
  Sparkles,
} from "lucide-react";

import { signOut } from "@/actions/auth";
import type { Expense } from "@/types/expense";
import {
  ExpenseFilters,
  type Filters,
} from "@/components/expense-filters";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { MonthlyChart } from "@/components/monthly-chart";
import { SpendingStats } from "@/components/spending-stats";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Expenses", href: "/expenses", icon: Receipt },
  { label: "Budget", href: "/budget", icon: Wallet },
  { label: "Recurring", href: "/recurring", icon: Repeat },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Reports", href: "/reports", icon: FileText },
];

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
    search: "",
  });

  const filtered = useMemo(() => {
    return expenses.filter((expense) => {
      if (
        filters.category !== "all" &&
        expense.category !== filters.category
      ) {
        return false;
      }

      if (filters.from && expense.expense_date < filters.from) {
        return false;
      }

      if (filters.to && expense.expense_date > filters.to) {
        return false;
      }

      const searchText = filters.search.trim().toLowerCase();

      if (searchText) {
        const description = String(
          expense.description ?? ""
        ).toLowerCase();

        const category = String(
          expense.category ?? ""
        ).toLowerCase();

        if (
          !description.includes(searchText) &&
          !category.includes(searchText)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [expenses, filters]);

  function toggleTheme() {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    try {
      localStorage.setItem("ledger-theme", nextTheme);
    } catch {
      // Keep the current page theme if browser storage is unavailable.
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-950 text-white lg:flex lg:flex-col">
          {/* Brand */}
          <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20">
              <Wallet className="h-6 w-6" />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight">
                Ledger<span className="text-emerald-400">.</span>
              </p>
              <p className="text-xs text-slate-400">
                Personal finance
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-4 py-7">
            <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Workspace
            </p>

            {navigation.map((item) => {
              const Icon = item.icon;
              const active = item.label === "Dashboard";

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all duration-200 ${
                    active
                      ? "bg-emerald-400 font-semibold text-slate-950 shadow-md shadow-emerald-950/20"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>

                  {active && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-slate-950" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="border-t border-white/10 p-4">
            <div className="mb-4 rounded-2xl bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-emerald-400">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-semibold">
                  Your finances, simplified
                </span>
              </div>
              <p className="text-xs leading-5 text-slate-400">
                Keep track of your spending and build better money habits.
              </p>
            </div>

            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>

            <form action={signOut} className="mt-1">
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut className="h-5 w-5" />
                Log out
              </button>
            </form>
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Top bar */}
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
            <div className="flex min-h-20 items-center justify-between gap-4 px-5 py-3 sm:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Personal finance
                </p>
                <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  Dashboard
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  aria-label="Toggle dark mode"
                  title="Toggle dark mode"
                >
                  <Sun className="theme-icon-sun h-5 w-5" />
                  <Moon className="theme-icon-moon h-5 w-5" />
                </button>

                <div className="hidden max-w-56 text-right md:block">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {email}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Your account
                  </p>
                </div>

                <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800 md:flex">
                  {email ? email.charAt(0).toUpperCase() : "U"}
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add expense</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>
          </header>

          {/* Dashboard content */}
          <main className="mx-auto w-full max-w-7xl space-y-7 p-5 sm:p-8">
            {/* Welcome banner */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-xl shadow-slate-900/10 sm:p-8">
              <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-teal-400/10 blur-3xl" />

              <div className="relative z-10 max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-emerald-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  Your financial overview
                </div>

                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Welcome back!
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                  Keep your expenses organized, understand your spending,
                  and stay on top of your financial goals.
                </p>

                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
                >
                  <Plus className="h-4 w-4" />
                  Record an expense
                </button>
              </div>
            </section>

            {/* Statistics */}
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Your finances
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  A snapshot of your spending activity.
                </p>
              </div>

              <div className="rounded-2xl [&>div]:gap-4">
                <SpendingStats expenses={filtered} />
              </div>
            </section>

            {/* Monthly chart */}
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-7">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Spending overview
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Track how your expenses change over time.
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <BarChart3 className="h-5 w-5" />
                </div>
              </div>

              <MonthlyChart expenses={expenses} />
            </section>

            {/* Filters */}
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Transactions
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Search and filter your expenses.
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Receipt className="h-5 w-5" />
                </div>
              </div>

              <ExpenseFilters
                value={filters}
                onChange={setFilters}
              />
            </section>

            {/* Expense list */}
            <section className="overflow-hidden rounded-2xl">
              <ExpenseList expenses={filtered} />
            </section>

            <footer className="border-t border-slate-200 pt-5 text-center text-xs text-slate-500">
              Ledger Personal Finance
              <span className="mx-2">·</span>
              Manage your money with clarity.
            </footer>
          </main>
        </div>
      </div>

      {/* Add expense modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Add expense
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Record a new transaction.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close add expense form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <ExpenseForm onDone={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
