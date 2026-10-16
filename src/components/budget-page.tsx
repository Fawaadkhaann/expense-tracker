"use client";

import { useState } from "react";
import { saveMonthlyBudget } from "@/actions/budget";
import { formatCurrency } from "@/lib/format";

type Budget = {
  id: string;
  month: string;
  amount: number;
} | null;

export function BudgetPage({
  budget,
  month,
  totalSpent,
}: {
  budget: Budget;
  month: string;
  totalSpent: number;
}) {
  const [amount, setAmount] = useState(
    budget?.amount ? String(budget.amount) : ""
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const monthLabel = new Date(`${month}T00:00:00`).toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );

  const budgetAmount = Number(budget?.amount ?? 0);
  const remaining = budgetAmount - totalSpent;

  const progress =
    budgetAmount > 0
      ? Math.min((totalSpent / budgetAmount) * 100, 100)
      : 0;

  async function handleSave() {
    const value = Number(amount);

    if (!amount || value < 0) {
      setMessage("Please enter a valid budget amount.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      await saveMonthlyBudget(month, value);

      setMessage("Monthly budget saved successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Monthly Budget
          </h2>

          <p className="mt-2 text-muted">
            Set your spending limit for {monthLabel}.
          </p>
        </div>

        {/* Budget Summary */}
        <section className="grid gap-4 sm:grid-cols-3">

          {/* Budget */}
          <div className="ledger-card min-w-0 p-5">
            <p className="text-sm font-medium text-muted">
              Monthly Budget
            </p>

            <p className="mt-2 break-words text-2xl font-semibold tabular-nums">
              {formatCurrency(budgetAmount)}
            </p>
          </div>

          {/* Spent */}
          <div className="ledger-card min-w-0 p-5">
            <p className="text-sm font-medium text-muted">
              Total Spent
            </p>

            <p className="mt-2 break-words text-2xl font-semibold tabular-nums">
              {formatCurrency(totalSpent)}
            </p>
          </div>

          {/* Remaining */}
          <div className="ledger-card min-w-0 p-5">
            <p className="text-sm font-medium text-muted">
              Remaining
            </p>

            <p
              className={`mt-2 break-words text-2xl font-semibold tabular-nums ${
                remaining < 0 ? "text-danger" : ""
              }`}
            >
              {formatCurrency(remaining)}
            </p>
          </div>

        </section>

        {/* Progress */}
        {budgetAmount > 0 && (
          <section className="ledger-card p-6">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="font-semibold">
                  Budget Progress
                </h2>

                <p className="mt-1 text-sm text-muted">
                  {Math.round(progress)}% of your budget used
                </p>
              </div>

              <span className="break-words text-sm font-medium tabular-nums sm:text-right">
                {formatCurrency(totalSpent)} / {formatCurrency(budgetAmount)}
              </span>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-line">
              <div
                className={`h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none ${
                  progress >= 100
                    ? "bg-danger"
                    : progress >= 75
                      ? "bg-warm"
                      : "bg-accent"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {remaining < 0 && (
              <p className="mt-3 text-sm font-medium text-danger">
                You have exceeded your monthly budget.
              </p>
            )}

          </section>
        )}

        {/* Set Budget */}
        <section className="ledger-card p-6">

          <div className="space-y-5">

            <div>
              <h2 className="text-xl font-semibold">
                {monthLabel} Budget
              </h2>

              <p className="mt-1 text-sm text-muted">
                Choose the maximum amount you want to spend this month.
              </p>
            </div>

            <div>
              <label
                htmlFor="budget"
                className="mb-2 block text-sm font-medium text-ink"
              >
                Budget amount
              </label>

              <div className="flex items-center rounded-xl border border-line bg-canvas px-4 transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 motion-reduce:transition-none">
                <span className="text-muted">
                  Rs.
                </span>

                <input
                  id="budget"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="50000"
                  value={amount}
                  onChange={(event) =>
                    setAmount(event.target.value)
                  }
                  className="min-w-0 w-full bg-transparent px-3 py-3 text-ink outline-none placeholder:text-muted"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="ledger-button"
            >
              {saving ? "Saving..." : "Save Budget"}
            </button>

            {message && (
              <p
                className={`text-sm ${
                  message.includes("successfully")
                    ? "text-success"
                    : "text-danger"
                }`}
                role="status"
              >
                {message}
              </p>
            )}

          </div>

        </section>

    </div>
  );
}