"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ── Place Order ───────────────────────────────────────────────

const orderItemSchema = z.object({
  product_id: z.string().uuid().nullable().optional(),
  product_name: z.string().min(1),
  cup_size: z.string().min(1),
  unit_price: z.number().positive(),
  quantity: z.number().int().positive(),
  line_total: z.number().positive(),
});

const placeOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Cart is empty"),
  customer_name: z.string().optional().nullable(),
  customer_phone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  total_amount: z.number().min(0),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

export async function placeOrder(data: PlaceOrderInput) {
  const supabase = await createClient();
  const parsed = placeOrderSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { items, customer_name, customer_phone, notes, total_amount } = parsed.data;

  // Create the order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: customer_name || null,
      customer_phone: customer_phone || null,
      notes: notes || null,
      total_amount,
      status: "completed",
    })
    .select()
    .single();

  if (orderError) return { error: orderError.message };

  // Insert order items (snapshot product details so history stays accurate)
  const { error: itemsError } = await supabase.from("order_items").insert(
    items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id ?? null,
      product_name: item.product_name,
      cup_size: item.cup_size,
      unit_price: item.unit_price,
      quantity: item.quantity,
      line_total: item.line_total,
    }))
  );

  if (itemsError) return { error: itemsError.message };

  // Decrement product stock for each item sold
  for (const item of items) {
    if (item.product_id) {
      await supabase.rpc("decrement_product_stock", {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/orders");
  revalidatePath("/products");
  revalidatePath("/inventory");

  return {
    success: true,
    order_id: order.id,
    order_number: order.order_number as number,
  };
}
