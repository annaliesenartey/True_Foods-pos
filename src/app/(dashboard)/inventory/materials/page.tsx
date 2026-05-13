import { createClient } from "@/lib/supabase/server";
import { MaterialsClient } from "./materials-client";
import type { Material } from "@/lib/types";

export default async function MaterialsPage() {
  const supabase = await createClient();
  const { data: materials, error } = await supabase.from("materials").select("*").order("name");
  if (error) console.error("Materials fetch error:", error);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Raw Materials</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Add or manage your supply materials. Use &quot;Record purchase&quot; on the Inventory page to update stock levels.
        </p>
      </div>
      <MaterialsClient materials={(materials as Material[]) ?? []} />
    </div>
  );
}
