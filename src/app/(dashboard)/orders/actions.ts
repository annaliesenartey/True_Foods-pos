"use server";

import { createClient } from "@/lib/supabase/server";

// ── Send SMS receipt via mNotify ───────────────────────────────
// Requires MNOTIFY_API_KEY in .env.local
// Sign up at https://mnotify.com — pay-per-SMS, works on Ghana numbers

export async function sendReceiptSms(orderId: string, phone: string) {
  const apiKey = process.env.MNOTIFY_API_KEY;
  if (!apiKey) return { error: "mNotify API key not configured. Add MNOTIFY_API_KEY to .env.local" };

  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("id", orderId)
    .single();

  if (error || !order) return { error: "Order not found" };

  // Build a concise SMS (keep under 160 chars per segment)
  const items = (order.items ?? []) as { product_name: string; quantity: number; cup_size: string }[];
  const itemSummary = items
    .map((i) => `${i.quantity}x ${i.product_name} ${i.cup_size}`)
    .join(", ");

  const message =
    `True Foods Receipt\n` +
    `Order #${order.order_number}\n` +
    `${itemSummary}\n` +
    `Total: GHS ${Number(order.total_amount).toFixed(2)}\n` +
    `Thank you!`;

  // Normalise Ghana number: 0244... → 233244...
  const normalised = phone.replace(/\D/g, "");
  const ghPhone = normalised.startsWith("0")
    ? "233" + normalised.slice(1)
    : normalised.startsWith("233")
    ? normalised
    : "233" + normalised;

  const res = await fetch(
    `https://apps.mnotify.net/smsapi?key=${apiKey}&to=${ghPhone}&msg=${encodeURIComponent(message)}&sender_id=TrueFoods`,
    { method: "GET" }
  );

  if (!res.ok) return { error: `SMS failed: ${res.statusText}` };

  const body = await res.text();
  // mNotify returns "1000" or "1002" etc as status codes
  if (body.includes("1000")) return { success: true };

  return { error: `SMS error code: ${body}` };
}
