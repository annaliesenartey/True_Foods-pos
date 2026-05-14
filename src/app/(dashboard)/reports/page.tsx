import { createClient } from "@/lib/supabase/server";
import { ReportsClient } from "./_components/reports-client";
import Link from "next/link";
import type { Expense } from "@/lib/types";

export const metadata = { title: "Reports — True Foods POS" };

function startOfPeriod(period: "week" | "month" | "year"): string {
  const d = new Date();
  if (period === "week") d.setDate(d.getDate() - 6);
  else if (period === "month") d.setDate(1);
  else d.setMonth(0, 1);
  return d.toISOString().split("T")[0];
}

function formatLabel(dateStr: string, period: "week" | "month" | "year") {
  const d = new Date(dateStr + "T00:00:00");
  if (period === "year") return d.toLocaleDateString("en-GH", { month: "short" });
  return d.toLocaleDateString("en-GH", { day: "numeric", month: "short" });
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: rawPeriod } = await searchParams;
  const period =
    rawPeriod === "week" || rawPeriod === "month" || rawPeriod === "year"
      ? rawPeriod
      : "month";

  const supabase = await createClient();
  const from = startOfPeriod(period);

  const [{ data: orders }, { data: expenses }] = await Promise.all([
    supabase
      .from("orders")
      .select("total_amount, created_at, items:order_items(product_name, cup_size, quantity)")
      .gte("created_at", from)
      .eq("status", "completed"),
    supabase
      .from("expenses")
      .select("*")
      .gte("expense_date", from)
      .order("expense_date", { ascending: false }),
  ]);

  // ── Revenue by day ────────────────────────────────────────
  const buckets = new Map<string, { revenue: number; orders: number }>();
  for (const o of orders ?? []) {
    const key = o.created_at.split("T")[0];
    const ex = buckets.get(key) ?? { revenue: 0, orders: 0 };
    buckets.set(key, { revenue: ex.revenue + Number(o.total_amount), orders: ex.orders + 1 });
  }
  const dailySales = Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, d]) => ({ date: formatLabel(date, period), revenue: d.revenue, orders: d.orders }));

  // ── Top products ──────────────────────────────────────────
  const productMap = new Map<string, { qty: number; revenue: number }>();
  for (const o of orders ?? []) {
    for (const item of (o.items ?? []) as { product_name: string; cup_size: string; quantity: number }[]) {
      const key = `${item.product_name} (${item.cup_size})`;
      const ex = productMap.get(key) ?? { qty: 0, revenue: 0 };
      productMap.set(key, { qty: ex.qty + item.quantity, revenue: ex.revenue });
    }
  }
  const topProducts = Array.from(productMap.entries())
    .sort(([, a], [, b]) => b.qty - a.qty)
    .slice(0, 6)
    .map(([name, d]) => ({ name, ...d }));

  // ── Totals ────────────────────────────────────────────────
  const totalRevenue = (orders ?? []).reduce((s, o) => s + Number(o.total_amount), 0);
  const totalOrders = orders?.length ?? 0;
  const totalExpenses = (expenses ?? []).reduce((s, e) => s + Number(e.amount), 0);

  // ── Expenses by category ──────────────────────────────────
  const catMap = new Map<string, number>();
  for (const e of expenses ?? []) {
    catMap.set(e.category, (catMap.get(e.category) ?? 0) + Number(e.amount));
  }
  const expensesByCategory = Array.from(catMap.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => ({ category, amount }));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1>Reports</h1>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1 self-start sm:self-auto">
          {(["week", "month", "year"] as const).map((p) => (
            <Link
              key={p}
              href={`/reports?period=${p}`}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === p
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p === "week" ? "7 days" : p === "month" ? "This month" : "This year"}
            </Link>
          ))}
        </div>
      </div>

      <ReportsClient
        period={period}
        dailySales={dailySales}
        topProducts={topProducts}
        totalRevenue={totalRevenue}
        totalOrders={totalOrders}
        totalExpenses={totalExpenses}
        expensesByCategory={expensesByCategory}
        recentExpenses={(expenses ?? []) as Expense[]}
      />
    </div>
  );
}
