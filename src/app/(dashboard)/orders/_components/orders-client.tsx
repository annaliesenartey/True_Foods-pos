"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReceiptModal } from "./receipt-modal";
import type { Order } from "@/lib/types";

interface OrdersClientProps {
  orders: Order[];
  totalRevenue: number;
}

export function OrdersClient({ orders, totalRevenue }: OrdersClientProps) {
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>Orders</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
              {orders.length ? ` · GHS ${totalRevenue.toFixed(2)} total` : ""}
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

        {orders.length === 0 ? (
          <div className="rounded-lg border border-border p-12 text-center text-muted-foreground text-sm">
            No orders yet.{" "}
            <Link href="/orders/new" className="text-primary hover:underline">
              Create your first order →
            </Link>
          </div>
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
                  <th className="w-12" />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-semibold">#{order.order_number}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {order.customer_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-3 font-medium">GHS {Number(order.total_amount).toFixed(2)}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge variant={order.status === "completed" ? "default" : order.status === "cancelled" ? "destructive" : "secondary"}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(order.created_at).toLocaleString("en-GH", {
                        month: "short", day: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setReceiptOrder(order)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="View receipt"
                      >
                        <Receipt className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />
    </>
  );
}
