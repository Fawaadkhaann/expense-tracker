export const ACCOUNT_TYPES = [
  "cash",
  "bank",
  "mobile_wallet",
  "credit_card",
  "other",
] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  cash: "Cash",
  bank: "Bank account",
  mobile_wallet: "Mobile wallet",
  credit_card: "Credit card",
  other: "Other",
};

export const PAYMENT_METHOD_TYPES = [
  "cash",
  "debit_card",
  "credit_card",
  "bank_transfer",
  "mobile_wallet",
  "other",
] as const;

export type PaymentMethodType = (typeof PAYMENT_METHOD_TYPES)[number];

export const PAYMENT_METHOD_TYPE_LABELS: Record<PaymentMethodType, string> = {
  cash: "Cash",
  debit_card: "Debit card",
  credit_card: "Credit card",
  bank_transfer: "Bank transfer",
  mobile_wallet: "Mobile wallet",
  other: "Other",
};

export type AccountSummary = {
  account_id: string;
  account_name: string;
  account_type: AccountType;
  currency: string;
  is_active: boolean;
  current_balance: number | string;
};

export type PaymentMethodSummary = {
  id: string;
  account_id: string | null;
  name: string;
  method_type: PaymentMethodType;
  provider: string | null;
  last_four: string | null;
  is_active: boolean;
};
