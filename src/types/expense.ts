import type { Category } from "@/lib/categories";

export type Expense = {
  id: string;
  user_id: string;
  amount: number;
  category: Category;
  description: string | null;
  expense_date: string;
  created_at: string;
  updated_at: string;
};
