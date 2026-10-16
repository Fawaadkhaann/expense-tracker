import { redirect } from "next/navigation";
import {
  createClient,
  hasSupabaseConfig,
} from "@/lib/supabase/server";
import { getRecurringExpenses } from "@/actions/recurring-expenses";
import { RecurringExpenseForm } from "@/components/recurring-expense-form";
import { DeleteRecurringExpenseButton } from "@/components/delete-recurring-expense-button";
import { formatCurrency, formatDate } from "@/lib/format";
import { AppShell } from "@/components/app-shell";
import { CalendarClock, CircleAlert } from "lucide-react";

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

  // Get today's date and the date seven days from now.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  // Find recurring payments due within the next seven days.
  const upcomingExpenses = recurringExpenses.filter((expense) => {
    const paymentDate = new Date(`${expense.next_date}T00:00:00`);

    return (
      !Number.isNaN(paymentDate.getTime()) &&
      paymentDate >= today &&
      paymentDate <= nextWeek
    );
  });

  const upcomingTotal = upcomingExpenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  return (
    <AppShell activePath="/recurring" email={user.email ?? ""}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Recurring Expenses
          </h2>

          <p className="mt-2 text-muted">
            Manage expenses that repeat regularly.
          </p>
        </div>

        {/* Smart Payment Reminders */}
        <section className="ledger-card overflow-hidden">
          <div className="flex items-start gap-3 p-5 sm:p-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-canvas text-ink">
              <CalendarClock size={22} />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold">
                Smart Payment Reminders
              </h2>

              <p className="mt-1 text-sm text-muted">
                Payments due within the next 7 days.
              </p>

              <div className="mt-4 flex min-w-0 flex-wrap gap-6">
                <div className="min-w-0">
                  <p className="text-sm text-muted">
                    Upcoming payments
                  </p>
                  <p className="mt-1 break-words text-2xl font-semibold tabular-nums">
                    {upcomingExpenses.length}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-sm text-muted">
                    Total upcoming amount
                  </p>
                  <p className="mt-1 break-words text-2xl font-semibold tabular-nums">
                    {formatCurrency(upcomingTotal)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {upcomingExpenses.length > 0 ? (
            <div className="border-t border-line">
              {upcomingExpenses.map((expense) => {
                const paymentDate = new Date(
                  `${expense.next_date}T00:00:00`
                );

                const daysUntilPayment = Math.round(
                  (paymentDate.getTime() - today.getTime()) /
                    (24 * 60 * 60 * 1000)
                );

                const dueLabel =
                  daysUntilPayment === 0
                    ? "Due today"
                    : daysUntilPayment === 1
                      ? "Due tomorrow"
                      : `Due in ${daysUntilPayment} days`;

                return (
                  <div
                    key={expense.id}
                    className="flex flex-col gap-2 border-b border-line p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <CircleAlert
                        size={19}
                        className="mt-0.5 shrink-0 text-muted"
                      />

                      <div className="min-w-0">
                        <p className="break-words font-medium">
                          {expense.description}
                        </p>

                        <p className="mt-1 text-sm text-muted">
                          {expense.category} · {formatDate(expense.next_date)}
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {dueLabel}
                        </p>
                      </div>
                    </div>

                    <p className="break-words pl-8 text-base font-semibold tabular-nums sm:pl-0">
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border-t border-line px-5 py-5 sm:px-6">
              <p className="text-sm text-muted">
                No recurring payments are due in the next 7 days.
              </p>
            </div>
          )}
        </section>

        <RecurringExpenseForm />

        {recurringExpenses.length === 0 ? (
          <section className="ledger-card px-6 py-12 text-center">
            <h2 className="text-xl font-semibold">
              No recurring expenses
            </h2>

            <p className="mt-2 text-sm text-muted">
              You haven&apos;t added any recurring expenses yet.
            </p>
          </section>
        ) : (
          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold">
                All Recurring Expenses
              </h2>

              <p className="mt-1 text-sm text-muted">
                Your scheduled weekly, monthly, and yearly payments.
              </p>
            </div>

            {recurringExpenses.map((expense) => (
              <div
                key={expense.id}
                className="ledger-card p-4 transition-colors hover:bg-canvas/60 motion-reduce:transition-none sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="break-words font-semibold">
                      {expense.description}
                    </h2>

                    <p className="mt-1 text-sm text-muted">
                      {expense.category} · {expense.frequency}
                    </p>

                    <p className="mt-1 text-sm text-muted">
                      Next payment · {formatDate(expense.next_date)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <p className="min-w-0 break-words text-lg font-semibold tabular-nums">
                      {formatCurrency(expense.amount)}
                    </p>

                    <DeleteRecurringExpenseButton id={expense.id} />
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </AppShell>
  );
}