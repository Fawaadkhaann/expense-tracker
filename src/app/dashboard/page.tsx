import { redirect } from "next/navigation";
import { Dashboard } from "@/components/dashboard";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { Expense } from "@/types/expense";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
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

  const currentMonth = `${new Date().toISOString().slice(0, 7)}-01`;
  const [
    { data: expenseRows, error: expensesError },
    { data: budget, error: budgetError },
  ] = await Promise.all([
    supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("monthly_budgets")
      .select("id, month, amount")
      .eq("user_id", user.id)
      .eq("month", currentMonth)
      .maybeSingle(),
  ]);

  if (budgetError) {
    throw new Error(budgetError.message);
  }

  const expenses: Expense[] =
    expensesError || !expenseRows
      ? []
      : expenseRows.map((row) => ({
          ...row,
          amount: Number(row.amount),
          category: row.category,
        })) as Expense[];

  return (
    <Dashboard
      expenses={expenses}
      email={user.email ?? ""}
      month={currentMonth}
      monthlyBudget={budget ? Number(budget.amount) : null}
    />
  );
}
