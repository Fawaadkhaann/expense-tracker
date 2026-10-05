"use server";

import { revalidatePath } from "next/cache";
import { CATEGORIES, isCategory } from "@/lib/categories";
import { createClient } from "@/lib/supabase/server";
import type { Expense } from "@/types/expense";

export type ExpenseState = { error?: string; success?: boolean } | undefined;

function parseExpense(formData: FormData) {
  const amount = Number(formData.get("amount"));
  const category = String(formData.get("category") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const expenseDate = String(formData.get("expense_date") ?? "");

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Enter an amount greater than 0." } as const;
  }

  if (!isCategory(category)) {
    return { error: `Choose a category: ${CATEGORIES.join(", ")}.` } as const;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(expenseDate)) {
    return { error: "Pick a valid date." } as const;
  }

  return {
    amount: Math.round(amount * 100) / 100,
    category,
    description: description || null,
    expense_date: expenseDate,
  };
}

export async function createExpense(_prev: ExpenseState, formData: FormData) {
  const parsed = parseExpense(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You need to be signed in." };

  const { error } = await supabase.from("expenses").insert({
    user_id: user.id,
    ...parsed,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateExpense(_prev: ExpenseState, formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing expense id." };

  const parsed = parseExpense(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You need to be signed in." };

  const { error } = await supabase
    .from("expenses")
    .update(parsed)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You need to be signed in." };

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getExpenses(): Promise<Expense[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    ...row,
    amount: Number(row.amount),
    category: row.category,
  })) as Expense[];
}
