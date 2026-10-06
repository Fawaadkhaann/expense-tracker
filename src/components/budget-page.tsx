"use client";

import { useState } from "react";
import { saveMonthlyBudget } from "@/actions/budget";

type Budget = {
  id: string;
  month: string;
  amount: number;
} | null;

export function BudgetPage({
  budget,
  email,
  month,
}: {
  budget: Budget;
  email: string;
  month: string;
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
    <main className="min-h-screen bg-canvas p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <p className="text-sm text-muted">{email}</p>

          <h1 className="mt-1 text-3xl font-semibold">
            Monthly Budget
          </h1>

          <p className="mt-2 text-muted">
            Set your spending limit for {monthLabel}.
          </p>
        </div>

        {/* Budget Card */}
        <section className="rounded-3xl border border-line bg-card p-6 shadow-sm">
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
                className="mb-2 block text-sm font-medium"
              >
                Budget amount
              </label>

              <div className="flex items-center rounded-2xl border border-line bg-canvas px-4">
                <span className="text-muted">Rs.</span>

                <input
                  id="budget"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="50000"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="w-full bg-transparent px-3 py-3 outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-2xl bg-accent px-5 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Budget"}
            </button>

            {message && (
              <p className="text-sm text-muted">
                {message}
              </p>
            )}
          </div>
        </section>

        {/* Current Budget */}
        {budget && (
          <section className="rounded-3xl border border-line bg-card p-6">
            <p className="text-sm text-muted">
              Current monthly budget
            </p>

            <p className="mt-2 text-3xl font-semibold">
              Rs. {Number(budget.amount).toLocaleString()}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}