"use client";

import { useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import { ExpenseFilters, type Filters } from "@/components/expense-filters";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Expense } from "@/types/expense";

function csvSafe(value: string | number) {
  const text = String(value);
  return /^[\u0000-\u0020]*[=+\-@]/.test(text) ? `'${text}` : text;
}

function csvCell(value: string | number) {
  return `"${csvSafe(value).replace(/"/g, '""')}"`;
}

function reportRangeLabel(filters: Filters) {
  if (!filters.from && !filters.to) {
    return "All dates";
  }

  const from = filters.from ? formatDate(filters.from) : "Any date";
  const to = filters.to ? formatDate(filters.to) : "Any date";
  return `${from} – ${to}`;
}

function asciiText(value: string, maxLength = 100) {
  return value
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .slice(0, maxLength);
}

function pdfText(value: string) {
  return asciiText(value).replace(/([\\()])/g, "\\$1");
}

function pdfPageContent(
  expenses: Expense[],
  pageIndex: number,
  pageCount: number,
  total: number,
  rangeLabel: string,
) {
  const commands: string[] = [];
  const text = (
    x: number,
    y: number,
    size: number,
    value: string,
    color = "0.11 0.18 0.16",
  ) => {
    commands.push(
      `BT /F1 ${size} Tf ${color} rg 1 0 0 1 ${x} ${y} Tm (${pdfText(value)}) Tj ET`,
    );
  };

  text(42, 798, 19, "Ledger | Expense Report", "0.08 0.36 0.28");
  text(42, 779, 9, `Date range: ${rangeLabel}`, "0.38 0.42 0.4");
  text(42, 762, 9, `Total spending: ${formatCurrency(total)}`, "0.15 0.2 0.18");
  text(42, 747, 9, `Transactions: ${expenses.length}`, "0.38 0.42 0.4");
  text(500, 798, 8, `Page ${pageIndex + 1} of ${pageCount}`, "0.38 0.42 0.4");

  commands.push("0.82 0.87 0.84 RG 0.8 w 42 733 m 553 733 l S");
  text(42, 714, 8, "DATE", "0.25 0.32 0.29");
  text(105, 714, 8, "CATEGORY", "0.25 0.32 0.29");
  text(205, 714, 8, "DESCRIPTION", "0.25 0.32 0.29");
  text(490, 714, 8, "AMOUNT (PKR)", "0.25 0.32 0.29");
  commands.push("0.82 0.87 0.84 RG 0.6 w 42 706 m 553 706 l S");

  if (expenses.length === 0) {
    text(42, 680, 10, "No expense records match the selected filters.", "0.38 0.42 0.4");
  } else {
    expenses.forEach((expense, index) => {
      const y = 686 - index * 16;
      text(42, y, 8, expense.expense_date);
      text(105, y, 8, expense.category, "0.2 0.28 0.24");
      text(205, y, 8, expense.description || expense.category);
      text(490, y, 8, formatCurrency(expense.amount));
      if (index < expenses.length - 1) {
        commands.push(`0.91 0.93 0.92 RG 0.35 w 42 ${y - 6} m 553 ${y - 6} l S`);
      }
    });
  }

  return commands.join("\n");
}

function createPdf(expenses: Expense[], total: number, rangeLabel: string) {
  const rowsPerPage = 37;
  const pageCount = Math.max(1, Math.ceil(expenses.length / rowsPerPage));
  const pages = Array.from({ length: pageCount }, (_, index) =>
    pdfPageContent(
      expenses.slice(index * rowsPerPage, (index + 1) * rowsPerPage),
      index,
      pageCount,
      total,
      rangeLabel,
    ),
  );

  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pages
      .map((_, index) => `${4 + index * 2} 0 R`)
      .join(" ")}] /Count ${pageCount} >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  pages.forEach((content, index) => {
    const pageObject = 4 + index * 2;
    const streamObject = pageObject + 1;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${streamObject} 0 R >>`,
    );
    objects.push(
      `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    );
  });

  let document = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(document.length);
    document += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = document.length;
  document += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    document += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  document += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([document], { type: "application/pdf" });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function ExportExpensesButton({
  expenses,
}: {
  expenses: Expense[];
}) {
  const [filters, setFilters] = useState<Filters>({
    category: "all",
    from: "",
    to: "",
    search: "",
  });

  const filteredExpenses = useMemo(
    () =>
      expenses.filter((expense) => {
        if (
          filters.category !== "all" &&
          expense.category !== filters.category
        ) {
          return false;
        }
        if (filters.from && expense.expense_date < filters.from) {
          return false;
        }
        if (filters.to && expense.expense_date > filters.to) {
          return false;
        }
        const search = filters.search.trim().toLowerCase();
        return (
          !search ||
          (expense.description ?? "").toLowerCase().includes(search) ||
          expense.category.toLowerCase().includes(search)
        );
      }),
    [expenses, filters],
  );
  const total = filteredExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0,
  );
  const rangeLabel = reportRangeLabel(filters);

  function exportCsv() {
    const rows: (string | number)[][] = [
      ["Ledger Expense Report"],
      ["Date range", rangeLabel],
      ["Transactions", filteredExpenses.length],
      ["Total spending (PKR)", formatCurrency(total)],
      [],
      ["Date", "Category", "Description", "Amount (PKR)"],
      ...filteredExpenses.map((expense) => [
        expense.expense_date,
        expense.category,
        expense.description ?? "",
        formatCurrency(expense.amount),
      ]),
    ];

    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
    downloadBlob(
      new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" }),
      `ledger-expense-report-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  }

  function exportPdf() {
    downloadBlob(
      createPdf(filteredExpenses, total, rangeLabel),
      `ledger-expense-report-${new Date().toISOString().slice(0, 10)}.pdf`,
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold">Filter report</h3>
        <p className="mt-1 text-sm text-muted">
          Exports include only records matching these filters.
        </p>
      </div>

      <ExpenseFilters value={filters} onChange={setFilters} />

      <div className="flex flex-col items-stretch justify-between gap-4 rounded-xl border border-line bg-canvas p-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-muted">Selected report</p>
          <p className="mt-1 break-words text-sm font-semibold">
            {filteredExpenses.length}{" "}
            {filteredExpenses.length === 1 ? "transaction" : "transactions"} ·{" "}
            {rangeLabel}
          </p>
          <p className="mt-1 text-sm font-medium text-accent">
            Total: {formatCurrency(total)}
          </p>
          {filteredExpenses.length === 0 && (
            <p className="mt-2 text-sm text-muted">
              No expenses match these filters. Exports will contain the summary
              and an empty report.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportCsv}
            className="ledger-button-secondary"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button type="button" onClick={exportPdf} className="ledger-button">
            <FileText className="h-4 w-4" />
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}
