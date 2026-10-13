
"use client";

import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  formatCurrency,
  formatMonth,
  monthKey,
} from "@/lib/format";
import type { Expense } from "@/types/expense";

function lastSixMonths() {
  const keys: string[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - i,
      1,
    );

    const month = String(date.getMonth() + 1).padStart(2, "0");

    keys.push(`${date.getFullYear()}-${month}`);
  }

  return keys;
}

export function MonthlyChart({
  expenses,
}: {
  expenses: Expense[];
}) {
  const data = lastSixMonths().map((key) => {
    const total = expenses
      .filter(
        (expense) => monthKey(expense.expense_date) === key,
      )
      .reduce((sum, expense) => sum + expense.amount, 0);

    return {
      month: formatMonth(key),
      total: Number(total.toFixed(2)),
    };
  });

  const hasData = data.some((row) => row.total > 0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="ledger-card min-w-0 p-5 transition-shadow duration-200 hover:shadow-lg sm:p-6"
    >
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
            Spending overview
          </p>

          <h2 className="mt-1.5 text-xl font-bold tracking-tight text-ink">
            Monthly spending
          </h2>

          <p className="mt-1 text-sm text-muted">
            Your spending over the last six months.
          </p>
        </div>

        <div
          className="shrink-0 rounded-xl border border-accent/15 bg-accent-soft px-3 py-2 text-xs font-semibold text-accent"
          aria-label="Six-month period"
        >
          6 months
        </div>
      </div>

      {hasData ? (
        <div className="h-64 w-full min-w-0 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 12,
                right: 8,
                left: 4,
                bottom: 0,
              }}
              barCategoryGap="25%"
            >
              <CartesianGrid
                stroke="var(--line)"
                strokeDasharray="4 6"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                tick={{
                  fill: "var(--muted)",
                  fontSize: 12,
                }}
                axisLine={false}
                tickLine={false}
                tickMargin={12}
                minTickGap={8}
              />

              <YAxis
                width={96}
                tick={{
                  fill: "var(--muted)",
                  fontSize: 11,
                }}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                tickFormatter={(value: number) =>
                  formatCurrency(value)
                }
              />

              <Tooltip
                cursor={{
                  fill: "var(--canvas)",
                  opacity: 0.7,
                }}
                formatter={(value) => [
                  formatCurrency(Number(value ?? 0)),
                  "Total spent",
                ]}
                labelStyle={{
                  color: "var(--ink)",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                  background: "var(--card)",
                  color: "var(--ink)",
                  padding: "10px 14px",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                }}
              />

              <Bar
                dataKey="total"
                name="Total spent"
                fill="var(--accent)"
                radius={[7, 7, 2, 2]}
                maxBarSize={42}
                animationDuration={700}
                animationEasing="ease-out"
                activeBar={{
                  fill: "var(--accent)",
                  stroke: "var(--ink)",
                  strokeWidth: 1,
                  strokeOpacity: 0.15,
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-line bg-canvas/50 px-5 text-center">
          <div
            className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent"
            aria-hidden="true"
          >
            <span className="text-xl font-semibold">↗</span>
          </div>

          <p className="font-semibold text-ink">
            No spending data yet
          </p>

          <p className="mt-1 max-w-xs text-sm leading-6 text-muted">
            Add a few expenses from the last six months to see your spending trends here.
          </p>
        </div>
      )}
    </motion.section>
  );
}
