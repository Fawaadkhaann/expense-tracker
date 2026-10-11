
import { redirect } from "next/navigation";
import { getExpenses } from "@/actions/expenses";
import ExportExpensesButton from "@/components/export-expenses-button";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  if (!hasSupabaseConfig()) {
    redirect("/");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const expenses = await getExpenses();

  // Calculate total spending
  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  // Calculate spending for each category
  const categoryTotals = expenses.reduce(
    (totals, expense) => {
      const category = expense.category;
      totals[category] =
        (totals[category] ?? 0) + Number(expense.amount);

      return totals;
    },
    {} as Record<string, number>
  );

  // Show highest-spending categories first
  const sortedCategories = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1]
  );

  const highestCategoryAmount = sortedCategories[0]?.[1] ?? 0;

  return (
    <main className="min-h-screen space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold">Expense Reports</h1>
        <p className="mt-2 text-muted">
          Understand your spending and download your expense report.
        </p>
      </div>

      {/* Total spending */}
      <section className="rounded-xl border border-line bg-card p-6">
        <p className="text-sm text-muted">Total Expenses</p>

        <h2 className="mt-2 text-3xl font-bold">
          Rs. {total.toLocaleString("en-PK")}
        </h2>

        <p className="mt-2 text-sm text-muted">
          Total spending across your recorded expenses.
        </p>
      </section>

      {/* Spending by category */}
      <section className="rounded-xl border border-line bg-card p-6">
        <h2 className="text-xl font-semibold">
          Spending by Category
        </h2>

        <p className="mt-1 text-sm text-muted">
          See which categories account for the most spending.
        </p>

        {sortedCategories.length === 0 ? (
          <p className="mt-5 text-muted">
            No expenses recorded yet.
          </p>
        ) : (
          <div className="mt-6 space-y-5">
            {sortedCategories.map(([category, amount]) => {
              const percentage =
                total > 0 ? (amount / total) * 100 : 0;

              const barWidth =
                highestCategoryAmount > 0
                  ? (amount / highestCategoryAmount) * 100
                  : 0;

              return (
                <div key={category}>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{category}</span>

                    <div className="text-right">
                      <span className="font-semibold">
                        Rs. {amount.toLocaleString("en-PK")}
                      </span>

                      <span className="ml-2 text-sm text-muted">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CSV export */}
      <section className="rounded-xl border border-line bg-card p-6">
        <h2 className="text-xl font-semibold">Export Expenses</h2>

        <p className="mt-2 mb-4 text-sm text-muted">
          Download your recorded expenses as a CSV file that opens in Excel.
        </p>

        <ExportExpensesButton expenses={expenses} />
      </section>
    </main>
  );
}
