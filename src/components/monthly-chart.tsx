"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, formatMonth, monthKey } from "@/lib/format";
import type { Expense } from "@/types/expense";

function lastSixMonths() {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    keys.push(`${date.getFullYear()}-${month}`);
  }
  return keys;
}

export function MonthlyChart({ expenses }: { expenses: Expense[] }) {
  const data = lastSixMonths().map((key) => {
    const total = expenses
      .filter((expense) => monthKey(expense.expense_date) === key)
      .reduce((sum, expense) => sum + expense.amount, 0);
    return { month: formatMonth(key), total: Number(total.toFixed(2)) };
  });

  const hasData = data.some((row) => row.total > 0);

  return (
    <section className="rounded-3xl border border-line bg-card p-5">
      <div className="mb-4">
        <h2 className="display text-2xl">Monthly spending</h2>
        <p className="text-sm text-muted">Last six months</p>
      </div>
      {hasData ? (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#e4d9c8" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "#6f655c", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6f655c", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value: number) =>
                  `$${Math.round(value).toString()}`
                }
              />
              <Tooltip
                cursor={{ fill: "#f3eee4" }}
                formatter={(value) => [
                  formatCurrency(Number(value ?? 0)),
                  "Spent",
                ]}
                contentStyle={{
                  borderRadius: 16,
                  border: "1px solid #e4d9c8",
                  background: "#fffaf3",
                }}
              />
              <Bar dataKey="total" fill="#1d6b58" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="py-12 text-center text-sm text-muted">
          Add a few expenses and this chart will fill in.
        </p>
      )}
    </section>
  );
}
