import { createClient } from "@/lib/supabase/server";
import { ProductTable } from "./_components/product-table";
import type { Product, Category } from "@/lib/types";

export default async function ProductsPage() {
  const supabase = await createClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, category:categories(id, name)")
      .order("name"),
    supabase.from("categories").select("*").order("name"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your yoghurt products and their pricing.
        </p>
      </div>
      <ProductTable
        products={(products as Product[]) ?? []}
        categories={(categories as Category[]) ?? []}
      />
    </div>
  );
}
