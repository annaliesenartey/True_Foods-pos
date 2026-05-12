import { createClient } from "@/lib/supabase/server";
import { CategoriesClient } from "./categories-client";
import type { Category } from "@/lib/types";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Categories</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Group your products (e.g. Plain Yoghurt, Fruit Yoghurt, Smoothies).
        </p>
      </div>
      <CategoriesClient categories={(categories as Category[]) ?? []} />
    </div>
  );
}
