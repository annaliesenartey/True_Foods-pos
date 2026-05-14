import { createClient } from "@/lib/supabase/server";
import { OrdersClient } from "./_components/orders-client";
import type { Order } from "@/lib/types";

export const metadata = { title: "Orders — True Foods POS" };

export default async function OrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .order("created_at", { ascending: false })
    .limit(200);

  const totalRevenue = (orders ?? []).reduce((s, o) => s + Number(o.total_amount ?? 0), 0);

  return (
    <OrdersClient
      orders={(orders ?? []) as Order[]}
      totalRevenue={totalRevenue}
    />
  );
}
