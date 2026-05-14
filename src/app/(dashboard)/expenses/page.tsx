import { createClient } from "@/lib/supabase/server";
import { ExpenseClient } from "./_components/expense-client";
import type { Expense } from "@/lib/types";

export const metadata = { title: "Expenses — True Foods POS" };

export default async function ExpensesPage() {
  const supabase = await createClient();
  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false });

  return <ExpenseClient expenses={(expenses ?? []) as Expense[]} />;
}
