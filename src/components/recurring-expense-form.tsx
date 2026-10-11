"use client";

import { useState } from "react";
import {
  createRecurringExpense,
  type RecurringFrequency,
} from "@/actions/recurring-expenses";
import { CATEGORIES, type Category } from "@/lib/categories";

export function RecurringExpenseForm() {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [frequency, setFrequency] =
    useState<RecurringFrequency>("monthly");
  const [nextDate, setNextDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!description.trim()) {
      setMessage("Please enter a description.");
      return;
    }

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      setMessage("Please enter a valid amount.");
      return;
    }

    if (!nextDate) {
      setMessage("Please select the next date.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      await createRecurringExpense({
        description,
        amount: numericAmount,
        category,
        frequency,
        next_date: nextDate,
      });

      setDescription("");
      setAmount("");
      setNextDate("");
      setMessage("Recurring expense added successfully.");
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
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-line bg-card p-6 shadow-sm"
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          Add recurring expense
        </h2>

        <p className="mt-1 text-sm text-muted">
          Add an expense that repeats regularly.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">

        {/* Description */}
        <div className="sm:col-span-2">
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium"
          >
            Description
          </label>

          <input
            id="description"
            type="text"
            placeholder="Netflix subscription"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 outline-none focus:border-ink"
          />
        </div>

        {/* Amount */}
        <div>
          <label
            htmlFor="amount"
            className="mb-2 block text-sm font-medium"
          >
            Amount
          </label>

          <div className="flex items-center rounded-2xl border border-line bg-canvas px-4">
            <span className="text-muted">Rs.</span>

            <input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="1500"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full bg-transparent px-3 py-3 outline-none"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-medium"
          >
            Category
          </label>

          <select
            id="category"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as Category)
            }
            className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 outline-none"
          >
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Frequency */}
        <div>
          <label
            htmlFor="frequency"
            className="mb-2 block text-sm font-medium"
          >
            Frequency
          </label>

          <select
            id="frequency"
            value={frequency}
            onChange={(event) =>
              setFrequency(
                event.target.value as RecurringFrequency
              )
            }
            className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 outline-none"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        {/* Next date */}
        <div>
          <label
            htmlFor="nextDate"
            className="mb-2 block text-sm font-medium"
          >
            Next date
          </label>

          <input
            id="nextDate"
            type="date"
            value={nextDate}
            onChange={(event) => setNextDate(event.target.value)}
            className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="mt-6 rounded-2xl bg-accent px-5 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Adding..." : "Add recurring expense"}
      </button>

      {message && (
        <p className="mt-4 text-sm text-muted">
          {message}
        </p>
      )}
    </form>
  );
}