import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Package, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { data: { user } },
    { count: productCount },
    { data: todayOrders },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase
      .from("orders")
      .select("total_amount")
      .gte("created_at", new Date().toISOString().split("T")[0]),
  ]);

  const todayRevenue = todayOrders?.reduce((sum, o) => sum + Number(o.total_amount ?? 0), 0) ?? 0;
  const todayOrderCount = todayOrders?.length ?? 0;
  const username = user?.email?.split("@")[0] ?? "staff";

  const stats = [
    { label: "NET SALES", value: `GHS ${todayRevenue.toFixed(2)}`, sub: "today" },
    { label: "ORDERS", value: String(todayOrderCount), sub: "today" },
    { label: "PRODUCTS", value: String(productCount ?? 0), sub: "active" },
    { label: "CUSTOMERS SERVED", value: String(todayOrderCount), sub: "today" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Good day, {username} · {new Date().toLocaleDateString("en-GH", { weekday: "long", month: "long", day: "numeric" })}
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub }) => (
          <Card key={label} className="border-border shadow-none">
            <CardContent className="pt-5 pb-4">
              <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase mb-2">{label}</p>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card className="border-border shadow-none">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Recent Orders</h2>
            <Link href="/orders" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <p className="text-sm text-muted-foreground text-center py-8">
            No orders yet. <Link href="/orders/new" className="text-primary hover:underline">Create your first order →</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
