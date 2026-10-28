"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  ACCOUNT_TYPES,
  PAYMENT_METHOD_TYPES,
  type AccountType,
  type PaymentMethodType,
} from "@/types/account";

export type AccountActionState =
  | { error?: string; success?: string }
  | undefined;

function isAccountType(value: string): value is AccountType {
  return (ACCOUNT_TYPES as readonly string[]).includes(value);
}

function isPaymentMethodType(value: string): value is PaymentMethodType {
  return (PAYMENT_METHOD_TYPES as readonly string[]).includes(value);
}

export async function createAccount(
  _previousState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const accountType = String(formData.get("account_type") ?? "");
  const openingBalanceText = String(
    formData.get("opening_balance") ?? "0",
  ).trim();

  if (!name || name.length > 100) {
    return { error: "Enter an account name of 1 to 100 characters." };
  }

  if (!isAccountType(accountType)) {
    return { error: "Choose a valid account type." };
  }

  if (!/^\d{1,10}(?:\.\d{1,2})?$/.test(openingBalanceText)) {
    return { error: "Enter a non-negative balance with up to 2 decimals." };
  }

  const openingBalance = Number(openingBalanceText);
  if (!Number.isFinite(openingBalance) || openingBalance > 9_999_999_999.99) {
    return { error: "Enter a valid opening balance." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be signed in." };
  }

  const { error } = await supabase.rpc("create_account_with_opening_balance", {
    p_name: name,
    p_account_type: accountType,
    p_opening_balance: openingBalance,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  return { success: "Account created." };
}

export async function createPaymentMethod(
  _previousState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const accountId = String(formData.get("account_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const methodType = String(formData.get("method_type") ?? "");
  const provider = String(formData.get("provider") ?? "").trim();
  const lastFour = String(formData.get("last_four") ?? "").trim();

  if (!accountId) {
    return { error: "Choose an account." };
  }

  if (!name || name.length > 100) {
    return { error: "Enter a payment method name of 1 to 100 characters." };
  }

  if (!isPaymentMethodType(methodType)) {
    return { error: "Choose a valid payment method type." };
  }

  if (provider.length > 100) {
    return { error: "Provider must be 100 characters or fewer." };
  }

  if (lastFour && !/^\d{4}$/.test(lastFour)) {
    return { error: "Last four digits must contain exactly 4 numbers." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be signed in." };
  }

  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("id")
    .eq("id", accountId)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (accountError) {
    return { error: accountError.message };
  }

  if (!account) {
    return { error: "Choose one of your active accounts." };
  }

  const { error } = await supabase.from("payment_methods").insert({
    user_id: user.id,
    account_id: account.id,
    name,
    method_type: methodType,
    provider: provider || null,
    last_four: lastFour || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  return { success: "Payment method added." };
}
