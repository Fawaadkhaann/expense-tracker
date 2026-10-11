import { redirect } from "next/navigation";
import {
  createClient,
  hasSupabaseConfig,
} from "@/lib/supabase/server";
import { getRecurringExpenses } from "@/actions/recurring-expenses";
import { RecurringExpenseForm } from "@/components/recurring-expense-form";
import { DeleteRecurringExpenseButton } from "@/components/delete-recurring-expense-button";

export const dynamic = "force-dynamic";

export default async function RecurringPage() {
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

  const recurringExpenses = await getRecurringExpenses();

  return (
    <main className="min-h-screen bg-canvas p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-sm text-muted">{user.email}</p>

          <h1 className="mt-1 text-3xl font-semibold">
            Recurring Expenses
          </h1>

          <p className="mt-2 text-muted">
            Manage expenses that repeat regularly.
          </p>
        </div>

        <RecurringExpenseForm />

        {recurringExpenses.length === 0 ? (
          <section className="rounded-3xl border border-line bg-card p-8 text-center">
            <h2 className="text-xl font-semibold">
              No recurring expenses
            </h2>

            <p className="mt-2 text-sm text-muted">
              You haven't added any recurring expenses yet.
            </p>
          </section>
        ) : (
          <section className="space-y-3">
            {recurringExpenses.map((expense) => (
              <div
                key={expense.id}
                className="rounded-3xl border border-line bg-card p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-semibold">
                      {expense.description}
                    </h2>

                    <p className="mt-1 text-sm text-muted">
                      {expense.category} · {expense.frequency}
                    </p>

                    <p className="mt-1 text-sm text-muted">
                      Next: {expense.next_date}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="text-lg font-semibold">
                      Rs. {expense.amount.toLocaleString()}
                    </p>

                    <DeleteRecurringExpenseButton
                      id={expense.id}
                    />
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}