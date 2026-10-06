"use server";

import { createClient } from "@/lib/supabase/server";

export async function getMonthlyBudget(month: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const { data, error } = await supabase
    .from("monthly_budgets")
    .select("id, month, amount")
    .eq("user_id", user.id)
    .eq("month", month)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function saveMonthlyBudget(
  month: string,
  amount: number
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const { data, error } = await supabase
    .from("monthly_budgets")
    .upsert(
      {
        user_id: user.id,
        month,
        amount,
      },
      {
        onConflict: "user_id,month",
      }
    )
    .select("id, month, amount")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}