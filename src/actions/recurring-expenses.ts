"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/categories";

export type RecurringFrequency = "weekly" | "monthly" | "yearly";

export type RecurringExpense = {
  id: string;
  description: string;
  amount: number;
  category: Category;
  frequency: RecurringFrequency;
  next_date: string;
  created_at: string;
};

export async function getRecurringExpenses(): Promise<
  RecurringExpense[]
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("recurring_expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("next_date", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    ...row,
    amount: Number(row.amount),
  })) as RecurringExpense[];
}

export async function createRecurringExpense(data: {
  description: string;
  amount: number;
  category: Category;
  frequency: RecurringFrequency;
  next_date: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const { error } = await supabase
    .from("recurring_expenses")
    .insert({
      user_id: user.id,
      description: data.description.trim(),
      amount: data.amount,
      category: data.category,
      frequency: data.frequency,
      next_date: data.next_date,
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/recurring");
}

export async function deleteRecurringExpense(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const { error } = await supabase
    .from("recurring_expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/recurring");
}