"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteRecurringExpense } from "@/actions/recurring-expenses";

type DeleteRecurringExpenseButtonProps = {
  id: string;
};

export function DeleteRecurringExpenseButton({
  id,
}: DeleteRecurringExpenseButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this recurring expense?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      await deleteRecurringExpense(id);

      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="rounded-xl border border-line px-3 py-2 text-sm font-medium text-muted transition hover:bg-canvas hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
    >
      {deleting ? "Deleting..." : "Delete"}
    </button>
  );
}