
"use client";

import { Download } from "lucide-react";

type Expense = {
  id: string;
  title?: string;
  description?: string | null;
  category: string;
  amount: number;
  expense_date: string;
};

export default function ExportExpensesButton({
  expenses,
}: {
  expenses: Expense[];
}) {
  function handleExport() {
    if (expenses.length === 0) {
      alert("There are no expenses to export.");
      return;
    }

    const headers = [
      "Date",
      "Description",
      "Category",
      "Amount (PKR)",
    ];

    const rows = expenses.map((expense) => [
      expense.expense_date,
      expense.description ?? expense.title ?? "",
      expense.category,
      expense.amount,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value ?? "").replace(/"/g, '""')}"`,
          )
          .join(","),
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "ledger-expenses.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
    >
      <Download size={16} />
      Export CSV
    </button>
  );
}
