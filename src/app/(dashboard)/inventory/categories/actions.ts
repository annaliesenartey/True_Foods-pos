"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name is required" };

  const { error } = await supabase.from("categories").insert({ name });
  if (error) return { error: error.message };

  revalidatePath("/inventory/categories");
  revalidatePath("/products");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/inventory/categories");
  return { success: true };
}
