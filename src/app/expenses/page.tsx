import { redirect } from "next/navigation";
import { getExpenses } from "@/actions/expenses";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import { ExpensesPage } from "@/components/expenses-page";

export const dynamic = "force-dynamic";

export default async function ExpensesRoute() {
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

  return (
    <ExpensesPage
      expenses={expenses}
      email={user.email ?? ""}
    />
  );
}