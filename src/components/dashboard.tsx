"use client";

import { MotionConfig, motion } from "motion/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CircleAlert,
  Plus,
  Receipt,
  Wallet,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import type { Expense } from "@/types/expense";
import {
  ExpenseFilters,
  type Filters,
} from "@/components/expense-filters";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { MonthlyChart } from "@/components/monthly-chart";
import { SpendingStats } from "@/components/spending-stats";
import { formatCurrency, formatMonth } from "@/lib/format";
import { Dialog } from "@/components/dialog";

export function Dashboard({
  expenses,
  email,
  month,
  monthlyBudget,
}: {
  expenses: Expense[];
  email: string;
  month: string;
  monthlyBudget: number | null;
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
          expense.description ?? "",
        ).toLowerCase();

        const category = String(
          expense.category ?? "",
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

  const currentMonth = month.slice(0, 7);

  const monthlySpending = expenses
    .filter((expense) =>
      expense.expense_date.startsWith(currentMonth),
    )
    .reduce(
      (total, expense) => total + Number(expense.amount),
      0,
    );

  const hasMonthlyBudget =
    monthlyBudget !== null &&
    Number.isFinite(monthlyBudget) &&
    monthlyBudget > 0;

  const budgetUsed = hasMonthlyBudget
    ? (monthlySpending / monthlyBudget) * 100
    : 0;

  const budgetRemaining = hasMonthlyBudget
    ? monthlyBudget - monthlySpending
    : null;

  const alertLevel = !hasMonthlyBudget
    ? "unset"
    : budgetUsed > 100
      ? "exceeded"
      : budgetUsed >= 90
        ? "critical"
        : budgetUsed >= 75
          ? "warning"
          : "on-track";

  const alertCopy = {
    unset: {
      title: "Set a monthly budget to enable spending alerts",
      message:
        "Your spending this month is tracked below. Add a budget to see how much remains and get alerts at 75%, 90%, and beyond your limit.",
    },
    exceeded: {
      title: "Monthly budget exceeded",
      message: `You are ${formatCurrency(
        Math.abs(budgetRemaining ?? 0),
      )} over your ${formatMonth(currentMonth)} budget. Review your recent spending to get back on track.`,
    },
    critical: {
      title: "You're approaching your monthly limit",
      message: `You've used ${budgetUsed.toFixed(
        1,
      )}% of your budget. Only ${formatCurrency(
        budgetRemaining ?? 0,
      )} remains for ${formatMonth(currentMonth)}.`,
    },
    warning: {
      title: "Spending alert: 75% of budget used",
      message: `You've used ${budgetUsed.toFixed(
        1,
      )}% of your budget, with ${formatCurrency(
        budgetRemaining ?? 0,
      )} remaining for ${formatMonth(currentMonth)}.`,
    },
    "on-track": {
      title: "You're on track this month",
      message: `${formatCurrency(
        budgetRemaining ?? 0,
      )} remains in your ${formatMonth(currentMonth)} budget.`,
    },
  }[alertLevel];

  const budgetCardClass =
    "rounded-2xl border border-line bg-canvas p-4 transition-[border-color,box-shadow] duration-200 hover:border-accent/30 hover:shadow-sm motion-reduce:transition-none";

  return (
    <MotionConfig reducedMotion="user">
      <AppShell
        activePath="/dashboard"
        email={email}
        actions={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="ledger-button min-h-10 shrink-0 px-3 sm:px-4"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add expense</span>
            <span className="sm:hidden">Add</span>
          </button>
        }
      >
      <div className="-mx-4 -my-6 space-y-8 bg-canvas px-4 py-6 sm:-mx-6 sm:-my-8 sm:space-y-10 sm:px-6 sm:py-8 xl:-mx-10 xl:px-10">
        {/* Animated welcome section */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative isolate overflow-hidden rounded-3xl border border-line bg-card p-6 text-ink shadow-sm sm:p-8 lg:p-9"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-16 -z-10 h-56 w-56 rounded-full border-[24px] border-accent/5"
          />

          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: 0.15,
                  ease: "easeOut",
                }}
                className="inline-flex items-center gap-2 rounded-full border border-accent/15 bg-accent-soft px-3 py-1.5"
              >
                <span className="h-2 w-2 rounded-full bg-accent" />
                <p className="text-xs font-semibold tracking-[0.1em] text-accent">
                  PERSONAL FINANCE
                </p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: 0.25,
                  ease: "easeOut",
                }}
                className="mt-5 text-sm font-medium text-muted"
              >
                {formatMonth(currentMonth)}
              </motion.p>

              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.3,
                  ease: "easeOut",
                }}
                className="mt-1 text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]"
              >
                Welcome back
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.4,
                  ease: "easeOut",
                }}
                className="mt-3 max-w-lg text-sm leading-6 text-muted sm:text-base"
              >
                Take control of your money. Review your spending,
                track your budget, and make smarter financial decisions.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.5,
                  ease: "easeOut",
                }}
                className="mt-6 flex flex-wrap items-center gap-3"
              >
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="ledger-button min-h-11 px-5"
                >
                  <Plus className="h-4 w-4" />
                  Add an expense
                </button>

                <Link
                  href="/analytics"
                  className="ledger-button-secondary min-h-11"
                >
                  View analytics
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.55,
                delay: 0.3,
                ease: "easeOut",
              }}
              aria-hidden="true"
              className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-line bg-canvas text-accent sm:flex lg:h-24 lg:w-24"
            >
              <Wallet className="h-10 w-10" strokeWidth={1.5} />
            </motion.div>
          </div>
        </motion.section>

        {/* Smart spending alert */}
        <section
          aria-labelledby="spending-alert-title"
          aria-live="polite"
          role={alertLevel === "exceeded" ? "alert" : "status"}
          className="ledger-card overflow-hidden"
        >
          <div
            className="border-l-4 p-5 sm:p-7"
            style={{
              borderLeftColor:
                alertLevel === "exceeded"
                  ? "var(--danger)"
                  : alertLevel === "critical" ||
                      alertLevel === "warning"
                    ? "var(--warm)"
                    : "var(--accent)",
            }}
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                    alertLevel === "exceeded"
                      ? "bg-danger-soft text-danger"
                      : alertLevel === "critical" || alertLevel === "warning"
                        ? "bg-warm-soft text-warm"
                        : "bg-accent-soft text-accent"
                  }`}
                  aria-hidden="true"
                >
                  {alertLevel === "warning" ||
                  alertLevel === "critical" ||
                  alertLevel === "exceeded" ? (
                    <CircleAlert className="h-5 w-5" />
                  ) : (
                    <Wallet className="h-5 w-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
                    Smart spending alert · {formatMonth(currentMonth)}
                  </p>

                  <h2
                    id="spending-alert-title"
                    className={`mt-1 text-lg font-semibold tracking-tight sm:text-xl ${
                      alertLevel === "exceeded"
                        ? "text-danger"
                        : alertLevel === "critical" ||
                            alertLevel === "warning"
                          ? "text-warm"
                          : "text-ink"
                    }`}
                  >
                    {alertCopy.title}
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                    {alertCopy.message}
                  </p>
                </div>
              </div>

              <Link href="/budget" className="ledger-button-secondary shrink-0">
                {hasMonthlyBudget ? "Manage budget" : "Set a budget"}
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className={budgetCardClass}>
                <p className="text-xs font-medium text-muted">
                  Monthly budget
                </p>
                <p className="mt-1.5 break-words text-lg font-semibold text-ink tabular-nums">
                  {hasMonthlyBudget
                    ? formatCurrency(monthlyBudget)
                    : "Not set"}
                </p>
              </div>

              <div className={budgetCardClass}>
                <p className="text-xs font-medium text-muted">
                  Amount spent
                </p>
                <p className="mt-1.5 break-words text-lg font-semibold text-ink tabular-nums">
                  {formatCurrency(monthlySpending)}
                </p>
              </div>

              <div className={budgetCardClass}>
                <p className="text-xs font-medium text-muted">
                  {budgetRemaining !== null && budgetRemaining < 0
                    ? "Amount over budget"
                    : "Remaining"}
                </p>

                <p
                  className="mt-1.5 break-words text-lg font-bold"
                  style={{
                    color:
                      budgetRemaining !== null && budgetRemaining < 0
                        ? "var(--danger)"
                        : "var(--ink)",
                  }}
                >
                  {budgetRemaining === null
                    ? "—"
                    : `${budgetRemaining < 0 ? "−" : ""}${formatCurrency(
                        Math.abs(budgetRemaining),
                      )}`}
                </p>
              </div>

              <div className={budgetCardClass}>
                <p className="text-xs font-medium text-muted">
                  Budget used
                </p>
                <p className="mt-1.5 break-words text-lg font-semibold text-ink tabular-nums">
                  {hasMonthlyBudget ? `${budgetUsed.toFixed(1)}%` : "—"}
                </p>
              </div>
            </div>

            {hasMonthlyBudget && (
              <div className="mt-5">
                <div
                  className="h-2.5 overflow-hidden rounded-full bg-line"
                  role="progressbar"
                  aria-label="Monthly budget used"
                  aria-valuenow={Math.min(Math.round(budgetUsed), 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none"
                    style={{
                      width: `${Math.min(budgetUsed, 100)}%`,
                      backgroundColor:
                        alertLevel === "exceeded"
                          ? "var(--danger)"
                          : alertLevel === "critical" ||
                              alertLevel === "warning"
                            ? "var(--warm)"
                            : "var(--accent)",
                    }}
                  />
                </div>

                <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted">
                  <span>Alerts at 75% and 90%</span>
                  <span>100% of budget</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Spending statistics */}
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
                At a glance
              </p>

              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Your finances
              </h2>

              <p className="mt-1.5 text-sm text-muted">
                A snapshot of your spending activity.
              </p>
            </div>

            <span className="rounded-full border border-accent/20 bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent">
              {filtered.length}{" "}
              {filtered.length === 1 ? "expense" : "expenses"} in view
            </span>
          </div>

          <SpendingStats expenses={filtered} />
        </section>

        {/* Monthly chart and expense filters */}
        <div className="grid items-start gap-5 lg:gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(20rem,0.85fr)]">
          <div>
            <MonthlyChart expenses={expenses} />
          </div>

          <section className="ledger-card p-5 sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Receipt className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
                  Your activity
                </p>

                <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">
                  Find a transaction
                </h2>

                <p className="mt-1 text-sm text-muted">
                  Search and filter your expenses.
                </p>
              </div>
            </div>

            <ExpenseFilters
              value={filters}
              onChange={setFilters}
              appearance="default"
            />
          </section>
        </div>

        {/* Recent transactions */}
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
                Transactions
              </p>

              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Recent activity
              </h2>

              <p className="mt-1.5 text-sm text-muted">
                Your matching transactions, grouped by date.
              </p>
            </div>

            <p className="rounded-full border border-line bg-card px-3.5 py-2 text-sm font-semibold text-ink shadow-sm">
              {filtered.length}{" "}
              {filtered.length === 1 ? "transaction" : "transactions"}
            </p>
          </div>

          <ExpenseList expenses={filtered} />
        </section>

        <footer className="border-t border-line pt-5 text-center text-xs text-muted">
          Ledger Personal Finance
          <span className="mx-2">·</span>
          Manage your money with clarity.
        </footer>
      </div>

      {/* Add expense modal */}
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