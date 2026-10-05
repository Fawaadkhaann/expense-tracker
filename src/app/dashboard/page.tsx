import { redirect } from "next/navigation";
import { getExpenses } from "@/actions/expenses";
import { Dashboard } from "@/components/dashboard";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";

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

  const expenses = await getExpenses();

  return <Dashboard expenses={expenses} email={user.email ?? ""} />;
}
