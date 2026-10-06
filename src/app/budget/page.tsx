import { redirect } from "next/navigation";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import { getMonthlyBudget } from "@/actions/budget";
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

  return (
    <BudgetPage
      budget={budget}
      email={user.email ?? ""}
      month={currentMonth}
    />
  );
}