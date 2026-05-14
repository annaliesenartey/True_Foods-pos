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
    supabase
      .from("orders")
      .select("total_amount")
      .eq("status", "completed")
      .gte("created_at", monthStartStr),
    supabase
      .from("expenses")
      .select("amount")
      .gte("expense_date", monthStart.toISOString().split("T")[0]),
    supabase
      .from("orders")
      .select("id, order_number, customer_name, total_amount, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("order_items")
      .select("product_name, cup_size, quantity")
      .gte("created_at" as never, monthStartStr),
  ]);

  const username = user?.email?.split("@")[0] ?? "staff";
  const totalIncome   = (monthOrders   ?? []).reduce((s, o) => s + Number(o.total_amount), 0);
  const totalExpenses = (monthExpenses ?? []).reduce((s, e) => s + Number(e.amount), 0);
  const pendingCount  = pendingOrders?.length ?? 0;

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

  const maxQty = topProducts[0]?.qty ?? 1;

  const today = new Date().toLocaleDateString("en-GH", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Welcome back, {username} · {today}
        </p>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Total Income — green gradient */}
        <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30">
          {/* Decorative circle */}
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -right-2 w-16 h-16 rounded-full bg-white/10" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-100">
                Total Income
              </p>
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight">GHS {totalIncome.toFixed(2)}</p>
            <p className="text-xs text-emerald-100 mt-1">This month</p>
          </div>
        </div>

        {/* Total Expenses — red/rose gradient */}
        <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-200 dark:shadow-rose-900/30">
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -right-2 w-16 h-16 rounded-full bg-white/10" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-rose-100">
                Total Expenses
              </p>
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <TrendingDown className="h-4.5 w-4.5" />
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight">GHS {totalExpenses.toFixed(2)}</p>
            <p className="text-xs text-rose-100 mt-1">This month</p>
          </div>
        </div>

        {/* Pending Orders — purple gradient */}
        <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-violet-500 to-primary text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/30 flex flex-col justify-between gap-4">
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -right-2 w-16 h-16 rounded-full bg-white/10" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-100">
                Pending Orders
              </p>
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Clock className="h-4.5 w-4.5" />
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight">{pendingCount}</p>
            <p className="text-xs text-violet-100 mt-1">
              {pendingCount === 0 ? "All caught up" : "Awaiting completion"}
            </p>
          </div>
          {/* See all button */}
          <Link
            href="/orders?status=pending"
            className="relative inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white text-primary text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            See all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Top Selling Products ─────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold">Top Selling Products</h2>
          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            This month
          </span>
        </div>

        {topProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm gap-3">
            <Package className="h-10 w-10 opacity-20" />
            <span>No sales recorded this month</span>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {topProducts.map((p, i) => {
              const pct = Math.round((p.qty / maxQty) * 100);
              const barColors = [
                "bg-primary",
                "bg-emerald-500",
                "bg-rose-500",
                "bg-amber-500",
                "bg-sky-500",
              ];
              const rankColors = [
                "bg-primary text-primary-foreground",
                "bg-emerald-500 text-white",
                "bg-rose-500 text-white",
                "bg-amber-500 text-white",
                "bg-sky-500 text-white",
              ];
              return (
                <div key={`${p.name}-${p.size}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${rankColors[i]}`}>
                        {i + 1}
                      </span>
                      <span className="font-medium text-sm">{p.name}</span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {p.size}
                      </span>
                    </div>
                    <span className="text-sm font-bold tabular-nums">
                      {p.qty} <span className="text-xs font-normal text-muted-foreground">bottles</span>
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${barColors[i]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
