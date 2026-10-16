
import { redirect } from "next/navigation";
import { Download, FileBarChart, Wallet } from "lucide-react";

import { getExpenses } from "@/actions/expenses";
import ExportExpensesButton from "@/components/export-expenses-button";
import { AppShell } from "@/components/app-shell";
import {
  AnimatedReportBar,
  AnimatedReportHeader,
  AnimatedReportSection,
} from "@/components/animated-report";
import { CATEGORY_META } from "@/lib/categories";
import { formatCurrency } from "@/lib/format";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  if (!hasSupabaseConfig()) {
    redirect("/");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const expenses = await getExpenses();

  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0,
  );

  const categoryTotals = expenses.reduce(
    (totals, expense) => {
      const category = expense.category;

      totals[category] =
        (totals[category] ?? 0) + Number(expense.amount);

      return totals;
    },
    {} as Record<string, number>,
  );

  const sortedCategories = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1],
  );

  const highestCategoryAmount = sortedCategories[0]?.[1] ?? 0;

  return (
    <AppShell activePath="/reports" email={user.email ?? ""}>
      <div className="space-y-7">
        <AnimatedReportHeader>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
            Financial overview
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Expense reports
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            Understand your spending patterns and export your transaction
            records in one place.
          </p>
        </AnimatedReportHeader>

        <AnimatedReportSection
          delay={0.05}
          hover
          className="relative overflow-hidden rounded-2xl border border-accent/20 bg-accent-soft p-6 transition-shadow duration-200 hover:shadow-lg sm:p-8"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/15 bg-card text-accent">
                <Wallet className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-medium text-muted">
                  Total expenses
                </p>
                <p className="text-xs text-muted">
                  All recorded transactions
                </p>
              </div>
            </div>

            <p className="mt-6 break-words text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {formatCurrency(total)}
            </p>

            <p className="mt-2 text-sm text-muted">
              Across {expenses.length}{" "}
              {expenses.length === 1 ? "transaction" : "transactions"}.
            </p>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full border-[24px] border-accent/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 right-20 h-32 w-32 rounded-full bg-accent/5"
          />
        </AnimatedReportSection>

        <AnimatedReportSection
          delay={0.1}
          className="ledger-card p-5 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <FileBarChart className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold tracking-tight text-ink">
                Spending by category
              </h2>

              <p className="mt-1 text-sm leading-6 text-muted">
                See how your expenses are distributed across categories.
              </p>
            </div>
          </div>

          {sortedCategories.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-line bg-canvas/50 px-5 py-10 text-center">
              <p className="font-semibold text-ink">
                No spending data yet
              </p>
              <p className="mt-2 text-sm text-muted">
                Add an expense to see your category breakdown here.
              </p>
            </div>
          ) : (
            <div className="mt-7 space-y-6">
              {sortedCategories.map(([category, amount], index) => {
                const percentage =
                  total > 0 ? (amount / total) * 100 : 0;

                const barWidth =
                  highestCategoryAmount > 0
                    ? (amount / highestCategoryAmount) * 100
                    : 0;

                const categoryLabel =
                  CATEGORY_META[
                    category as keyof typeof CATEGORY_META
                  ]?.label ?? category;

                return (
                  <div key={category}>
                    <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-canvas text-xs font-bold text-accent">
                          {categoryLabel.slice(0, 1).toUpperCase()}
                        </span>

                        <span className="break-words text-sm font-semibold text-ink">
                          {categoryLabel}
                        </span>
                      </div>

                      <div className="min-w-0 max-w-full text-right">
                        <p className="break-words text-sm font-bold tabular-nums text-ink">
                          {formatCurrency(amount)}
                        </p>

                        <p className="mt-0.5 text-xs text-muted">
                          {percentage.toFixed(1)}% of spending
                        </p>
                      </div>
                    </div>

                    <div
                      className="h-2.5 overflow-hidden rounded-full bg-line"
                      role="progressbar"
                      aria-label={`${categoryLabel} spending`}
                      aria-valuenow={Number(percentage.toFixed(1))}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <AnimatedReportBar
                        width={`${barWidth}%`}
                        delay={0.12 + index * 0.08}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </AnimatedReportSection>

        <AnimatedReportSection
          delay={0.15}
          hover
          className="ledger-card flex flex-col gap-5 p-5 transition-shadow duration-200 hover:shadow-md xl:flex-row xl:items-center xl:justify-between sm:p-6"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Download className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold tracking-tight text-ink">
                Export your reports
              </h2>

              <p className="mt-1 max-w-md text-sm leading-6 text-muted">
                Download your expense records for your personal financial
                tracking.
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <ExportExpensesButton expenses={expenses} />
          </div>
        </AnimatedReportSection>
      </div>
    </AppShell>
  );
}
