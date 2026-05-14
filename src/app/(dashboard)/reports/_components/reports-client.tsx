"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Cell,
} from "recharts";
import type { Expense } from "@/lib/types";

interface DaySale { date: string; revenue: number; orders: number }
interface ProductSale { name: string; qty: number; revenue: number }

interface ReportsClientProps {
  period: "week" | "month" | "year";
  dailySales: DaySale[];
  topProducts: ProductSale[];
  totalRevenue: number;
  totalOrders: number;
  totalExpenses: number;
  expensesByCategory: { category: string; amount: number }[];
  recentExpenses: Expense[];
}

const PURPLE = "oklch(0.42 0.16 292)";
const COLORS = [
  "oklch(0.42 0.16 292)",
  "oklch(0.55 0.14 292)",
  "oklch(0.65 0.12 292)",
  "oklch(0.72 0.10 150)",
  "oklch(0.65 0.15 60)",
  "oklch(0.60 0.18 20)",
];

function StatCard({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${positive === false ? "text-destructive" : positive ? "text-green-600 dark:text-green-400" : ""}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

export function ReportsClient({
  dailySales, topProducts,
  totalRevenue, totalOrders, totalExpenses,
  expensesByCategory,
}: ReportsClientProps) {
  const netIncome = totalRevenue - totalExpenses;

  return (
    <div className="space-y-8">
      {/* ── KPI strip ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Revenue" value={`GHS ${totalRevenue.toFixed(2)}`} />
        <StatCard label="Expenses" value={`GHS ${totalExpenses.toFixed(2)}`} positive={false} />
        <StatCard
          label="Net Income"
          value={`GHS ${Math.abs(netIncome).toFixed(2)}`}
          sub={netIncome < 0 ? "loss" : "profit"}
          positive={netIncome >= 0}
        />
        <StatCard label="Orders" value={String(totalOrders)} />
      </div>

      {/* ── Revenue chart ───────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold mb-4">Revenue over time</h2>
        {dailySales.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No sales data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailySales} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.005 80)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} width={55} />
              <Tooltip
                formatter={(v) => [`GHS ${Number(v).toFixed(2)}`, "Revenue"]}
                contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.90 0.005 80)", fontSize: 12 }}
              />
              <Line
                type="monotone" dataKey="revenue" stroke={PURPLE}
                strokeWidth={2.5} dot={false} activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* ── Top products ──────────────────────────────────── */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">Top products</h2>
          {topProducts.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">No sales yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.005 80)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={100} />
                <Tooltip
                  formatter={(v) => [Number(v), "Bottles"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.90 0.005 80)", fontSize: 12 }}
                />
                <Bar dataKey="qty" radius={[0, 4, 4, 0]}>
                  {topProducts.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Expenses by category ──────────────────────────── */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">Expenses by category</h2>
          {expensesByCategory.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">No expenses logged</div>
          ) : (
            <div className="space-y-3">
              {expensesByCategory.map(({ category, amount }, i) => {
                const pct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium">{category}</span>
                      <span className="text-muted-foreground">GHS {amount.toFixed(2)} <span className="text-xs">({pct.toFixed(0)}%)</span></span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── P&L summary ───────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold mb-4">Profit & Loss summary</h2>
        <div className="space-y-2">
          {[
            { label: "Total Revenue", value: totalRevenue, positive: true },
            { label: "Total Expenses", value: -totalExpenses, positive: false },
          ].map(({ label, value, positive }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className={`text-sm font-semibold ${positive ? "text-foreground" : "text-destructive"}`}>
                {positive ? "+" : "−"} GHS {Math.abs(value).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2">
            <span className="font-semibold">Net Income</span>
            <span className={`text-lg font-bold ${netIncome >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
              {netIncome >= 0 ? "+" : "−"} GHS {Math.abs(netIncome).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
