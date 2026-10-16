
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChartNoAxesCombined,
  Wallet,
  CalendarDays,
  PiggyBank,
  TrendingUp,
  Lightbulb,
} from "lucide-react";

import { getExpenses } from "@/actions/expenses";
import { getMonthlyBudget } from "@/actions/budget";
import { formatCurrency } from "@/lib/format";
import { AppShell } from "@/components/app-shell";
import {
  AnimatedAnalyticsCard,
  AnimatedAnalyticsHeader,
  AnimatedAnalyticsSection,
  AnimatedAnalyticsBar,
} from "@/components/animated-analytics";
import { CATEGORY_META } from "@/lib/categories";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  if (!hasSupabaseConfig()) redirect("/");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const expenses = await getExpenses();

  const now = new Date();
  const currentMonthDate = now.toISOString().slice(0, 7) + "-01";
  const currentMonth = currentMonthDate.slice(0, 7);

  const budget = await getMonthlyBudget(currentMonthDate);
  const budgetAmount = Number(budget?.amount ?? 0);

  const previousDate = new Date(
    Date.UTC(
      Number(currentMonth.slice(0, 4)),
      Number(currentMonth.slice(5, 7)) - 2,
      1,
    ),
  );

  const previousMonth = `${previousDate.getUTCFullYear()}-${String(
    previousDate.getUTCMonth() + 1,
  ).padStart(2, "0")}`;

  const totalSpending = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0,
  );

  const currentMonthSpending = expenses
    .filter((expense) => expense.expense_date.startsWith(currentMonth))
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  const previousMonthSpending = expenses
    .filter((expense) => expense.expense_date.startsWith(previousMonth))
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  const difference = currentMonthSpending - previousMonthSpending;

  const percentageChange =
    previousMonthSpending > 0
      ? (difference / previousMonthSpending) * 100
      : null;

  const budgetRemaining = budgetAmount - currentMonthSpending;
  const budgetPercentage =
    budgetAmount > 0 ? (currentMonthSpending / budgetAmount) * 100 : 0;

  const budgetProgressWidth = Math.min(budgetPercentage, 100);

  const budgetStatus =
    budgetAmount <= 0
      ? "none"
      : currentMonthSpending > budgetAmount
        ? "over"
        : budgetPercentage >= 80
          ? "warning"
          : "good";

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
  const topCategory = sortedCategories[0];

  const insights: {
    title: string;
    message: string;
    type: "success" | "warning" | "info";
  }[] = [];

  if (budgetAmount <= 0) {
    insights.push({
      title: "Set a monthly budget",
      message:
        "Set a spending limit to track your budget progress and receive useful alerts.",
      type: "info",
    });
  } else if (budgetStatus === "over") {
    insights.push({
      title: "Budget exceeded",
      message: `You've spent ${formatCurrency(
        currentMonthSpending - budgetAmount,
      )} over your monthly budget.`,
      type: "warning",
    });
  } else if (budgetStatus === "warning") {
    insights.push({
      title: "Budget running low",
      message: `You've used ${budgetPercentage.toFixed(
        1,
      )}% of your budget. ${formatCurrency(
        budgetRemaining,
      )} remains for this month.`,
      type: "warning",
    });
  } else {
    insights.push({
      title: "Budget on track",
      message: `You've used ${budgetPercentage.toFixed(
        1,
      )}% of your budget, with ${formatCurrency(
        budgetRemaining,
      )} remaining.`,
      type: "success",
    });
  }

  if (previousMonthSpending > 0) {
    if (difference > 0) {
      insights.push({
        title: "Spending increased",
        message: `Your spending is ${percentageChange!.toFixed(
          1,
        )}% higher than last month.`,
        type: "warning",
      });
    } else if (difference < 0) {
      insights.push({
        title: "Spending decreased",
        message: `Your spending is ${Math.abs(
          percentageChange!,
        ).toFixed(1)}% lower than last month.`,
        type: "success",
      });
    } else {
      insights.push({
        title: "Spending is steady",
        message: "Your spending matches last month's total.",
        type: "info",
      });
    }
  } else if (currentMonthSpending > 0) {
    insights.push({
      title: "Build your spending history",
      message:
        "You have expenses this month, but no spending from last month to compare.",
      type: "info",
    });
  }

  if (topCategory) {
    const label =
      CATEGORY_META[topCategory[0] as keyof typeof CATEGORY_META]?.label ??
      topCategory[0];

    insights.push({
      title: "Highest spending category",
      message: `${label} is your highest-spending category at ${formatCurrency(
        topCategory[1],
      )}.`,
      type: "info",
    });
  }

  const monthlySpending = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(
      Date.UTC(
        Number(currentMonth.slice(0, 4)),
        Number(currentMonth.slice(5, 7)) - 1 - 11 + index,
        1,
      ),
    );

    const key = `${date.getUTCFullYear()}-${String(
      date.getUTCMonth() + 1,
    ).padStart(2, "0")}`;

    const amount = expenses
      .filter((expense) => expense.expense_date.startsWith(key))
      .reduce((sum, expense) => sum + Number(expense.amount), 0);

    return {
      key,
      label: date.toLocaleDateString("en-US", {
        month: "short",
        timeZone: "UTC",
      }),
      year: date.getUTCFullYear(),
      amount,
    };
  });

  const highestMonthlyAmount = Math.max(
    ...monthlySpending.map((month) => month.amount),
    0,
  );

  const summaryCards = [
    {
      title: "All-Time Spending",
      amount: formatCurrency(totalSpending),
      description: "Across all recorded expenses",
      icon: Wallet,
      tone: "bg-accent-soft text-accent",
    },
    {
      title: "This Month",
      amount: formatCurrency(currentMonthSpending),
      description: "Spending in the current month",
      icon: CalendarDays,
      tone: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Last Month",
      amount: formatCurrency(previousMonthSpending),
      description: "Spending in the previous month",
      icon: ChartNoAxesCombined,
      tone: "bg-violet-500/10 text-violet-500",
    },
    {
      title: "Monthly Difference",
      amount: `${difference > 0 ? "+" : difference < 0 ? "−" : ""}${formatCurrency(
        Math.abs(difference),
      )}`,
      description:
        percentageChange === null
          ? "No previous-month spending to compare"
          : `${Math.abs(percentageChange).toFixed(1)}% ${
              difference > 0
                ? "more spent"
                : difference < 0
                  ? "less spent"
                  : "change in spending"
            } than last month`,
      icon: difference > 0 ? ArrowUpRight : ArrowDownRight,
      tone:
        difference > 0
          ? "bg-rose-500/10 text-rose-500"
          : "bg-emerald-500/10 text-emerald-500",
    },
  ];

  return (
    <AppShell activePath="/analytics" email={user.email ?? ""}>
      <div className="space-y-7">
        <AnimatedAnalyticsHeader>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
            Financial overview
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Analytics
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            Understand your spending patterns and financial progress.
          </p>
        </AnimatedAnalyticsHeader>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <AnimatedAnalyticsCard
                key={card.title}
                delay={0.05 + index * 0.07}
                className="ledger-card min-w-0 p-5 transition-shadow duration-200 hover:shadow-lg sm:p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-muted">
                    {card.title}
                  </p>
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.tone}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <h2 className="mt-5 break-words text-2xl font-bold tracking-tight text-ink">
                  {card.amount}
                </h2>
                <p className="mt-2 text-xs leading-5 text-muted">
                  {card.description}
                </p>
              </AnimatedAnalyticsCard>
            );
          })}
        </section>

        <AnimatedAnalyticsSection
          delay={0.1}
          className="ledger-card p-5 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <PiggyBank className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-ink">
                  Monthly Budget Progress
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Your budget for{" "}
                  {now.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                  .
                </p>
              </div>
            </div>
            <Link href="/budget" className="ledger-button-secondary min-h-10">
              Manage Budget
            </Link>
          </div>

          {budgetAmount <= 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-line bg-canvas/50 p-6">
              <p className="font-semibold text-ink">No monthly budget set</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Set your spending limit to track your remaining balance and
                receive budget alerts.
              </p>
              <Link href="/budget" className="ledger-button mt-4">
                Set Monthly Budget
              </Link>
            </div>
          ) : (
            <div className="mt-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  {
                    label: "Monthly Budget",
                    value: formatCurrency(budgetAmount),
                  },
                  {
                    label: "Total Spent",
                    value: formatCurrency(currentMonthSpending),
                  },
                  {
                    label:
                      budgetRemaining < 0
                        ? "Amount Over Budget"
                        : "Remaining",
                    value: formatCurrency(Math.abs(budgetRemaining)),
                  },
                ].map((item, index) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-line bg-canvas/40 p-4"
                  >
                    <p className="text-sm text-muted">{item.label}</p>
                    <p
                      className={`mt-2 break-words text-xl font-bold ${
                        index === 2 && budgetRemaining < 0
                          ? "text-danger"
                          : "text-ink"
                      }`}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-ink">
                    Budget used
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    {budgetPercentage.toFixed(1)}%
                  </span>
                </div>
                <div
                  className="h-3 overflow-hidden rounded-full bg-line"
                  role="progressbar"
                  aria-label="Monthly budget used"
                  aria-valuenow={Math.min(Math.round(budgetPercentage), 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <AnimatedAnalyticsBar
                    width={`${budgetProgressWidth}%`}
                    colorClass={
                      budgetStatus === "over"
                        ? "bg-danger"
                        : budgetStatus === "warning"
                          ? "bg-warm"
                          : "bg-accent"
                    }
                  />
                </div>

                <div className="mt-4 rounded-2xl border border-line bg-canvas/40 p-4">
                  <p
                    className={`font-semibold ${
                      budgetStatus === "over"
                        ? "text-danger"
                        : budgetStatus === "warning"
                          ? "text-warm"
                          : "text-success"
                    }`}
                  >
                    {budgetStatus === "over"
                      ? "You've exceeded your budget"
                      : budgetStatus === "warning"
                        ? "Budget warning"
                        : "Budget on track"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    {budgetStatus === "over"
                      ? `You are ${formatCurrency(
                          Math.abs(budgetRemaining),
                        )} over your monthly limit.`
                      : budgetStatus === "warning"
                        ? "You've used at least 80% of your budget. Keep an eye on your remaining spending."
                        : `You have ${formatCurrency(
                            budgetRemaining,
                          )} left in your monthly budget.`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </AnimatedAnalyticsSection>

        <AnimatedAnalyticsSection
          delay={0.15}
          className="ledger-card p-5 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-ink">
                Smart Financial Insights
              </h2>
              <p className="mt-1 text-sm text-muted">
                Helpful observations based on your actual spending and budget.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {insights.map((insight, index) => (
              <AnimatedAnalyticsCard
                key={`${insight.title}-${index}`}
                delay={0.2 + index * 0.05}
                className="rounded-2xl border border-line bg-canvas/40 p-4 transition-colors hover:bg-canvas"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                      insight.type === "success"
                        ? "bg-success"
                        : insight.type === "warning"
                          ? "bg-warm"
                          : "bg-accent"
                    }`}
                  />
                  <div>
                    <h3 className="font-semibold text-ink">
                      {insight.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-muted">
                      {insight.message}
                    </p>
                  </div>
                </div>
              </AnimatedAnalyticsCard>
            ))}
          </div>
        </AnimatedAnalyticsSection>

        <AnimatedAnalyticsSection
          delay={0.2}
          className="ledger-card p-5 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-ink">
                  Spending Trend
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Your monthly expenses over the last 12 months.
                </p>
              </div>
            </div>
            <span className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted">
              Last 12 months
            </span>
          </div>

          {totalSpending === 0 ? (
            <p className="py-12 text-center text-sm text-muted">
              Add some expenses to see your spending trend.
            </p>
          ) : (
            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="text-sm text-muted">Monthly spending</span>
                <span className="text-sm font-semibold text-ink">
                  Peak: {formatCurrency(highestMonthlyAmount)}
                </span>
              </div>

              <div className="grid h-56 grid-cols-12 items-end gap-1 border-b border-line sm:gap-3">
                {monthlySpending.map((month, index) => {
                  const barHeight =
                    highestMonthlyAmount > 0
                      ? (month.amount / highestMonthlyAmount) * 100
                      : 0;

                  const isCurrentMonth = month.key === currentMonth;

                  return (
                    <div
                      key={month.key}
                      className="group flex h-full min-w-0 flex-col items-center justify-end"
                    >
                      <div className="relative flex h-full w-full items-end justify-center">
                        <div
                          title={`${month.label} ${month.year}: ${formatCurrency(
                            month.amount,
                          )}`}
                          className={`w-full max-w-10 rounded-t-md transition-opacity group-hover:opacity-80 ${
                            isCurrentMonth ? "bg-accent" : "bg-accent/50"
                          }`}
                          style={{
                            height: `${
                              month.amount > 0 ? Math.max(barHeight, 3) : 0
                            }%`,
                            minHeight: month.amount > 0 ? "3px" : "0",
                          }}
                        />
                      </div>
                      <span
                        className={`mt-3 pb-2 text-[10px] sm:text-xs ${
                          isCurrentMonth
                            ? "font-bold text-accent"
                            : "text-muted"
                        }`}
                      >
                        {month.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-muted">
                Hover over a bar to see the exact spending amount for that
                month.
              </p>
            </div>
          )}
        </AnimatedAnalyticsSection>

        <AnimatedAnalyticsSection
          delay={0.25}
          className="ledger-card p-5 sm:p-6"
        >
          <h2 className="text-lg font-bold tracking-tight text-ink">
            Category Breakdown
          </h2>
          <p className="mt-1 text-sm text-muted">
            All-time spending grouped by expense category.
          </p>

          {sortedCategories.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">
              No expenses yet. Add expenses to see your analytics.
            </p>
          ) : (
            <div className="mt-6 space-y-5">
              {sortedCategories.map(([category, amount], index) => {
                const percentage =
                  totalSpending > 0 ? (amount / totalSpending) * 100 : 0;

                const barWidth =
                  highestCategoryAmount > 0
                    ? (amount / highestCategoryAmount) * 100
                    : 0;

                const categoryLabel =
                  CATEGORY_META[category as keyof typeof CATEGORY_META]
                    ?.label ?? category;

                return (
                  <div key={category}>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-canvas text-xs font-bold text-accent">
                          {categoryLabel.slice(0, 1).toUpperCase()}
                        </span>
                        <span className="font-medium text-ink">
                          {categoryLabel}
                        </span>
                      </div>
                      <div className="min-w-0 max-w-full text-right">
                        <span className="break-words font-semibold text-ink">
                          {formatCurrency(amount)}
                        </span>
                        <span className="ml-2 text-sm text-muted">
                          ({percentage.toFixed(1)}%)
                        </span>
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
                      <AnimatedAnalyticsBar
                        width={`${barWidth}%`}
                        delay={0.15 + index * 0.06}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </AnimatedAnalyticsSection>
      </div>
    </AppShell>
  );
}
