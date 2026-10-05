"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  createExpense,
  updateExpense,
  type ExpenseState,
} from "@/actions/expenses";
import { CATEGORIES, CATEGORY_META } from "@/lib/categories";
import { todayISO } from "@/lib/format";
import type { Expense } from "@/types/expense";

export function ExpenseForm({
  expense,
  onDone,
}: {
  expense?: Expense;
  onDone?: () => void;
}) {
  const action = expense ? updateExpense : createExpense;
  const [state, formAction, pending] = useActionState<ExpenseState, FormData>(
    action,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      router.refresh();
      onDone?.();
    }
  }, [state, onDone, router]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-4">
      {expense ? <input type="hidden" name="id" value={expense.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm text-muted">Amount</span>
          <input
            required
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue={expense?.amount}
            placeholder="0.00"
            className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 outline-none ring-accent focus:ring-2"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm text-muted">Date</span>
          <input
            required
            name="expense_date"
            type="date"
            defaultValue={expense?.expense_date ?? todayISO()}
            className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 outline-none ring-accent focus:ring-2"
          />
        </label>
      </div>
      <label className="space-y-1.5">
        <span className="text-sm text-muted">Category</span>
        <select
          required
          name="category"
          defaultValue={expense?.category ?? "food"}
          className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 outline-none ring-accent focus:ring-2"
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_META[category].label}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1.5">
        <span className="text-sm text-muted">Description</span>
        <input
          name="description"
          defaultValue={expense?.description ?? ""}
          placeholder="Lunch, train ticket, new shoes…"
          className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 outline-none ring-accent focus:ring-2"
        />
      </label>
      {state?.error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-ink disabled:opacity-60"
      >
        {pending
          ? "Saving…"
          : expense
            ? "Save changes"
            : "Add expense"}
      </button>
    </form>
  );
}
