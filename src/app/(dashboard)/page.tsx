import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Package, TrendingUp, Users } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const stats = [
    { label: "Today's Orders", value: "0", icon: ShoppingCart, color: "text-primary" },
    { label: "Products", value: "0", icon: Package, color: "text-accent-foreground" },
    { label: "Revenue Today", value: "GHS 0.00", icon: TrendingUp, color: "text-primary" },
    { label: "Customers Served", value: "0", icon: Users, color: "text-accent-foreground" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Good day 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back, {user?.email?.split("@")[0]}. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <a
            href="/orders/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            New Order
          </a>
          <a
            href="/products"
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            <Package className="h-4 w-4" />
            Manage Products
          </a>
        </CardContent>
      </Card>

      {/* Recent orders placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No orders yet. Start by creating a new order.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
