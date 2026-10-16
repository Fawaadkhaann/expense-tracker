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
    <form ref={formRef} action={formAction} className="grid gap-5">
      {expense ? <input type="hidden" name="id" value={expense.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-ink">Amount</span>
          <input
            required
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue={expense?.amount}
            placeholder="0.00"
            className="ledger-field border-finance-line bg-finance-surface-raised text-finance-ink placeholder:text-finance-muted focus:border-finance-indigo focus:ring-finance-indigo/20"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-ink">Date</span>
          <input
            required
            name="expense_date"
            type="date"
            defaultValue={expense?.expense_date ?? todayISO()}
            className="ledger-field border-finance-line bg-finance-surface-raised text-finance-ink focus:border-finance-indigo focus:ring-finance-indigo/20"
          />
        </label>
      </div>
      <label className="space-y-1.5">
        <span className="text-sm font-medium text-ink">Category</span>
        <select
          required
          name="category"
          defaultValue={expense?.category ?? "food"}
          className="ledger-field border-finance-line bg-finance-surface-raised text-finance-ink focus:border-finance-indigo focus:ring-finance-indigo/20"
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_META[category].label}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1.5">
        <span className="text-sm font-medium text-ink">Description</span>
        <input
          name="description"
          defaultValue={expense?.description ?? ""}
          placeholder="Lunch, train ticket, new shoes…"
          className="ledger-field border-finance-line bg-finance-surface-raised text-finance-ink placeholder:text-finance-muted focus:border-finance-indigo focus:ring-finance-indigo/20"
        />
      </label>
      {state?.error ? (
        <p className="ledger-error" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="ledger-button w-full sm:w-auto"
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
