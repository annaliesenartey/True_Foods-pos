"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ── Material CRUD ──────────────────────────────────────────────

const materialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  unit: z.string().min(1, "Unit is required"),
  low_stock_threshold: z.coerce.number().min(0),
  cost_per_unit: z.coerce.number().min(0).nullable().optional(),
});

export async function updateMaterial(id: string, formData: FormData) {
  const supabase = await createClient();
  const parsed = materialSchema.safeParse({
    name: formData.get("name"),
    unit: formData.get("unit"),
    low_stock_threshold: formData.get("low_stock_threshold"),
    cost_per_unit: formData.get("cost_per_unit") || null,
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase.from("materials").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/inventory");
  return { success: true };
}

// ── Purchase recording ─────────────────────────────────────────

const purchaseSchema = z.object({
  material_id: z.string().uuid(),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  cost_per_unit: z.coerce.number().min(0).nullable().optional(),
  total_cost: z.coerce.number().min(0).nullable().optional(),
  purchased_at: z.string(),
  notes: z.string().optional().nullable(),
});

export async function recordPurchase(formData: FormData) {
  const supabase = await createClient();
  const parsed = purchaseSchema.safeParse({
    material_id: formData.get("material_id"),
    quantity: formData.get("quantity"),
    cost_per_unit: formData.get("cost_per_unit") || null,
    total_cost: formData.get("total_cost") || null,
    purchased_at: formData.get("purchased_at"),
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // Insert purchase record
  const { error: purchaseError } = await supabase
    .from("material_purchases")
    .insert(parsed.data);
  if (purchaseError) return { error: purchaseError.message };

  // Increment material stock
  const { error: stockError } = await supabase.rpc("increment_material_stock", {
    p_material_id: parsed.data.material_id,
    p_quantity: parsed.data.quantity,
  });
  if (stockError) return { error: stockError.message };

  revalidatePath("/inventory");
  return { success: true };
}

// ── Production run ─────────────────────────────────────────────

export async function recordProductionRun(formData: FormData) {
  const supabase = await createClient();

  const production_date = formData.get("production_date") as string;
  const notes = (formData.get("notes") as string) || null;

  // Parse items: product_id:quantity pairs (JSON string)
  const itemsRaw = formData.get("items") as string;
  const materialsRaw = formData.get("materials") as string;

  let items: { product_id: string; quantity_produced: number }[] = [];
  let materials: { material_id: string; quantity_used: number }[] = [];

  try {
    items = JSON.parse(itemsRaw);
    materials = JSON.parse(materialsRaw);
  } catch {
    return { error: "Invalid production data" };
  }

  if (!items.length) return { error: "Add at least one product" };

  // Create production run
  const { data: run, error: runError } = await supabase
    .from("production_runs")
    .insert({ production_date, notes })
    .select()
    .single();

  if (runError) return { error: runError.message };

  // Insert items
  const { error: itemsError } = await supabase.from("production_run_items").insert(
    items.map((i) => ({ ...i, production_run_id: run.id }))
  );
  if (itemsError) return { error: itemsError.message };

  // Insert materials used
  if (materials.length) {
    const { error: matsError } = await supabase.from("production_run_materials").insert(
      materials.map((m) => ({ ...m, production_run_id: run.id }))
    );
    if (matsError) return { error: matsError.message };
  }

  // Update product stock quantities
  for (const item of items) {
    await supabase.rpc("increment_product_stock", {
      p_product_id: item.product_id,
      p_quantity: item.quantity_produced,
    });
  }

  // Deduct material stock
  for (const mat of materials) {
    await supabase.rpc("decrement_material_stock", {
      p_material_id: mat.material_id,
      p_quantity: mat.quantity_used,
    });
  }

  revalidatePath("/inventory");
  revalidatePath("/products");
  return { success: true };
}
