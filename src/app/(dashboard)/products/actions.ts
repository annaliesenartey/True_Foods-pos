"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category_id: z.string().uuid().nullable().optional(),
  cup_size: z.enum(["500ml", "1L"]),
  price_ghs: z.coerce.number().positive("Price must be greater than 0"),
  low_stock_threshold: z.coerce.number().int().min(0),
  is_active: z.boolean().default(true),
  description: z.string().optional().nullable(),
});

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    category_id: formData.get("category_id") || null,
    cup_size: formData.get("cup_size"),
    price_ghs: formData.get("price_ghs"),
    low_stock_threshold: formData.get("low_stock_threshold") ?? 10,
    is_active: formData.get("is_active") === "true",
    description: formData.get("description") || null,
  });

  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { error } = await supabase.from("products").insert(parsed.data);
  if (error) return { error: error.message };

  revalidatePath("/products");
  return { success: true };
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient();
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    category_id: formData.get("category_id") || null,
    cup_size: formData.get("cup_size"),
    price_ghs: formData.get("price_ghs"),
    low_stock_threshold: formData.get("low_stock_threshold") ?? 10,
    is_active: formData.get("is_active") === "true",
    description: formData.get("description") || null,
  });

  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { error } = await supabase.from("products").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/products");
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/products");
  return { success: true };
}
