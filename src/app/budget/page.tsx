import { redirect } from "next/navigation";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import { getMonthlyBudget } from "@/actions/budget";
import { getExpenses } from "@/actions/expenses";
import { BudgetPage } from "@/components/budget-page";

export const dynamic = "force-dynamic";

export default async function BudgetRoute() {
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

  const currentMonth = new Date().toISOString().slice(0, 7) + "-01";

  const budget = await getMonthlyBudget(currentMonth);
  const expenses = await getExpenses();

  const currentMonthExpenses = expenses.filter(
    (expense) => expense.expense_date.startsWith(currentMonth.slice(0, 7))
  );

  const totalSpent = currentMonthExpenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  return (
    <BudgetPage
      budget={budget}
      email={user.email ?? ""}
      month={currentMonth}
      totalSpent={totalSpent}
    />
  );
}