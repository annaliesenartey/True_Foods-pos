import { createClient } from "@/lib/supabase/server";
import { RegisterClient } from "./_components/register-client";
import type { Product, Category } from "@/lib/types";

export const metadata = { title: "Register — True Foods POS" };

export default async function NewOrderPage() {
  const supabase = await createClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, category:categories(id, name, created_at)")
      .eq("is_active", true)
      .order("name"),
    supabase.from("categories").select("*").order("name"),
  ]);

  return (
    <RegisterClient
      products={(products ?? []) as Product[]}
      categories={(categories ?? []) as Category[]}
    />
  );
}
