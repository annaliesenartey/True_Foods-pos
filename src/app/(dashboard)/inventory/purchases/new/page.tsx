import { createClient } from "@/lib/supabase/server";
import { PurchaseForm } from "../../_components/purchase-form";
import type { Material } from "@/lib/types";

export default async function NewPurchasePage() {
  const supabase = await createClient();
  const { data: materials } = await supabase.from("materials").select("*").order("name");

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Record purchase</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Log when you buy supplies. Stock will update automatically.
        </p>
      </div>
      <div className="bg-card rounded-xl border border-border p-6">
        <PurchaseForm materials={(materials as Material[]) ?? []} />
      </div>
    </div>
  );
}
