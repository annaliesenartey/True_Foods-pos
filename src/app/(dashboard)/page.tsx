import { createClient } from "@/lib/supabase/server";
import { TrendingUp, TrendingDown, Clock, ArrowRight, Package } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthStartStr = monthStart.toISOString();

  const [
    { data: { user } },
    { data: monthOrders },
    { data: monthExpenses },
    { data: pendingOrders },
    { data: topProductsRaw },
  ] = await Promise.all([
    supabase.auth.getUser(),

    // All completed orders this month
    supabase
      .from("orders")
      .select("total_amount")
      .eq("status", "completed")
      .gte("created_at", monthStartStr),

    // All expenses this month
    supabase
      .from("expenses")
      .select("amount")
      .gte("expense_date", monthStart.toISOString().split("T")[0]),

    // Pending orders (any time)
    supabase
      .from("orders")
      .select("id, order_number, customer_name, total_amount, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),

    // Top-selling order items this month
    supabase
      .from("order_items")
      .select("product_name, cup_size, quantity")
      .gte("created_at" as never, monthStartStr),
  ]);

  const username = user?.email?.split("@")[0] ?? "staff";
  const totalIncome = (monthOrders ?? []).reduce((s, o) => s + Number(o.total_amount), 0);
  const totalExpenses = (monthExpenses ?? []).reduce((s, e) => s + Number(e.amount), 0);
  const pendingCount = pendingOrders?.length ?? 0;

  // Aggregate top products
  const productMap = new Map<string, { name: string; size: string; qty: number }>();
  for (const item of topProductsRaw ?? []) {
    const key = `${item.product_name}__${item.cup_size}`;
    const ex = productMap.get(key);
    if (ex) ex.qty += item.quantity;
    else productMap.set(key, { name: item.product_name, size: item.cup_size, qty: item.quantity });
  }
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const today = new Date().toLocaleDateString("en-GH", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Welcome back, {username} · {today}
        </p>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Total Income */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Total Income
              </p>
              <p className="text-3xl font-bold mt-2 tracking-tight">
                GHS {totalIncome.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Total Expenses
              </p>
              <p className="text-3xl font-bold mt-2 tracking-tight">
                GHS {totalExpenses.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
              <TrendingDown className="h-5 w-5 text-red-500 dark:text-red-400" />
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Pending Orders
              </p>
              <p className="text-3xl font-bold mt-2 tracking-tight">{pendingCount}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {pendingCount === 0 ? "All caught up" : "Awaiting completion"}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              pendingCount > 0
                ? "bg-amber-100 dark:bg-amber-900/30"
                : "bg-muted"
            }`}>
              <Clock className={`h-5 w-5 ${
                pendingCount > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground"
              }`} />
            </div>
          </div>
          <Link
            href="/orders?status=pending"
            className="inline-flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            See all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Top Selling Products ────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold">Top Selling Products</h2>
          <span className="text-xs text-muted-foreground">This month</span>
        </div>

        {topProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm gap-3">
            <Package className="h-10 w-10 opacity-20" />
            <span>No sales recorded this month</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40">
                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                    Product
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-xs hidden sm:table-cell">
                    Size
                  </th>
                  <th className="text-right px-5 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                    Qty Sold
                  </th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr
                    key={`${p.name}-${p.size}`}
                    className="border-t border-border hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {/* Rank badge */}
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          i === 0 ? "bg-primary text-primary-foreground"
                          : i === 1 ? "bg-muted-foreground/20 text-muted-foreground"
                          : "bg-muted text-muted-foreground"
                        }`}>
                          {i + 1}
                        </span>
                        <span className="font-medium">{p.name}</span>
                        {/* Show size inline on mobile */}
                        <span className="sm:hidden text-xs text-muted-foreground">({p.size})</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground hidden sm:table-cell">{p.size}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="font-semibold">{p.qty}</span>
                      <span className="text-muted-foreground text-xs ml-1">bottles</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
