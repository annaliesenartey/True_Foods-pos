import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, CheckCircle } from "lucide-react";
import Link from "next/link";
import type { Material, Product } from "@/lib/types";

export default async function InventoryPage() {
  const supabase = await createClient();

  const [{ data: materials }, { data: products }] = await Promise.all([
    supabase.from("materials").select("*").order("name"),
    supabase.from("products").select("*, category:categories(id,name)").order("name"),
  ]);

  const lowMaterials = (materials as Material[] ?? []).filter(
    (m) => m.current_stock <= m.low_stock_threshold
  );
  const lowProducts = (products as Product[] ?? []).filter(
    (p) => p.is_active && p.stock_quantity <= p.low_stock_threshold
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-muted-foreground text-sm mt-1">Stock levels, supplies, and production runs.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/inventory/purchases/new"
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted transition-colors"
          >
            Record purchase
          </Link>
          <Link
            href="/inventory/production/new"
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Record production
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {(lowMaterials.length > 0 || lowProducts.length > 0) && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" /> Low stock alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {lowProducts.map((p) => (
              <p key={p.id} className="text-sm">
                <span className="font-medium">{p.name}</span> — only {p.stock_quantity} bottles left
              </p>
            ))}
            {lowMaterials.map((m) => (
              <p key={m.id} className="text-sm">
                <span className="font-medium">{m.name}</span> — only {m.current_stock} {m.unit} left
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Finished goods */}
      <div>
        <h2 className="text-base font-semibold mb-3">Finished stock</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {(products as Product[] ?? []).filter((p) => p.is_active).map((p) => {
            const low = p.stock_quantity <= p.low_stock_threshold;
            return (
              <Card key={p.id} className={low ? "border-destructive/50" : ""}>
                <CardContent className="pt-4 pb-3">
                  <p className="font-medium text-sm leading-tight">{p.name}</p>
                  <p className="text-xs text-muted-foreground mb-2">{p.cup_size}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-2xl font-bold ${low ? "text-destructive" : ""}`}>
                      {p.stock_quantity}
                    </span>
                    {low
                      ? <AlertTriangle className="h-4 w-4 text-destructive" />
                      : <CheckCircle className="h-4 w-4 text-primary" />
                    }
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">bottles</p>
                </CardContent>
              </Card>
            );
          })}
          {(products ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full py-6">
              No active products. Add products first.
            </p>
          )}
        </div>
      </div>

      {/* Raw materials */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Raw materials</h2>
          <Link
            href="/inventory/purchases/new"
            className="inline-flex items-center h-7 px-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            + Record purchase
          </Link>
        </div>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Material</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">In stock</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Alert at</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(materials as Material[] ?? []).map((m) => {
                const low = m.current_stock <= m.low_stock_threshold;
                return (
                  <tr key={m.id} className="hover:bg-muted/30" data-testid="material-row">
                    <td className="px-4 py-3 font-medium">{m.name}</td>
                    <td className={`px-4 py-3 text-right ${low ? "text-destructive font-semibold" : ""}`}>
                      {m.current_stock} {m.unit}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {m.low_stock_threshold} {m.unit}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant={low ? "destructive" : "default"}>
                        {low ? "Low" : "OK"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
