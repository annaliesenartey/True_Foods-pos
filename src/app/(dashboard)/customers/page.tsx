import { createClient } from "@/lib/supabase/server";
import { CustomerClient } from "./_components/customer-client";
import type { Customer, Order } from "@/lib/types";

export const metadata = { title: "Customers — True Foods POS" };

export default async function CustomersPage() {
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from("customers")
    .select("*, orders(id, order_number, total_amount, status, created_at)")
    .order("name");

  return (
    <CustomerClient
      customers={(customers ?? []) as (Customer & { orders: Order[] })[]}
    />
  );
}
