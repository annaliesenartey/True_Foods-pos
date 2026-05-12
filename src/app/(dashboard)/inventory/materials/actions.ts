"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createMaterial(formData: FormData) {
  const supabase = await createClient();
  const name = (formData.get("name") as string)?.trim();
  const unit = (formData.get("unit") as string)?.trim();
  const low_stock_threshold = Number(formData.get("low_stock_threshold") ?? 0);

  if (!name) return { error: "Name is required" };
  if (!unit) return { error: "Unit is required" };

  const { error } = await supabase.from("materials").insert({ name, unit, low_stock_threshold });
  if (error) return { error: error.message };

  revalidatePath("/inventory");
  revalidatePath("/inventory/materials");
  return { success: true };
}

export async function updateMaterialThreshold(id: string, threshold: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("materials")
    .update({ low_stock_threshold: threshold })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/inventory");
  revalidatePath("/inventory/materials");
  return { success: true };
}

export async function deleteMaterial(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("materials").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/inventory");
  revalidatePath("/inventory/materials");
  return { success: true };
}
