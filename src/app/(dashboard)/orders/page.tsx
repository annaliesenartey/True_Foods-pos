import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { Order } from "@/lib/types";

export const metadata = { title: "Orders — True Foods POS" };

export default async function OrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .order("created_at", { ascending: false })
    .limit(200);

  const totalRevenue =
    orders?.reduce((s, o) => s + Number(o.total_amount ?? 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Orders</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {orders?.length ?? 0} order{(orders?.length ?? 0) !== 1 ? "s" : ""}
            {orders?.length ? ` · GHS ${totalRevenue.toFixed(2)} total` : ""}
          </p>
        </div>
        <Link
          href="/orders/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <ShoppingCart className="h-4 w-4" />
          New Order
        </Link>
      </div>

      {!orders?.length ? (
        <Card className="border-border shadow-none">
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground text-center py-12">
              No orders yet.{" "}
              <Link href="/orders/new" className="text-primary hover:underline">
                Create your first order →
              </Link>
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order #</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Items</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Total</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {(orders as Order[]).map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3 font-semibold">#{order.order_number}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {order.customer_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {order.items?.length ?? 0} item
                    {(order.items?.length ?? 0) !== 1 ? "s" : ""}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    GHS {Number(order.total_amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge
                      variant={
                        order.status === "completed"
                          ? "default"
                          : order.status === "cancelled"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {new Date(order.created_at).toLocaleString("en-GH", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
