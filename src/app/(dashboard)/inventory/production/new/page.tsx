import { createClient } from "@/lib/supabase/server";
import { ProductionForm } from "../../_components/production-form";
import type { Material, Product } from "@/lib/types";

export default async function NewProductionPage() {
  const supabase = await createClient();

  const [{ data: products }, { data: materials }] = await Promise.all([
    supabase.from("products").select("*, category:categories(id,name)").eq("is_active", true).order("name"),
    supabase.from("materials").select("*").order("name"),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Record production run</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Log what was made today. Finished stock and material stock will update automatically.
        </p>
      </div>
      <div className="bg-card rounded-xl border border-border p-6">
        <ProductionForm
          products={(products as Product[]) ?? []}
          materials={(materials as Material[]) ?? []}
        />
      </div>
    </div>
  );
}
