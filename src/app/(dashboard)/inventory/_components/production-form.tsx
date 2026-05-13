"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { recordProductionRun } from "../actions";
import type { Material, Product } from "@/lib/types";

interface ProductionFormProps {
  products: Product[];
  materials: Material[];
}

interface ItemRow { product_id: string; quantity_produced: number }
interface MatRow { material_id: string; quantity_used: number }

export function ProductionForm({ products, materials }: ProductionFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ItemRow[]>([{ product_id: "", quantity_produced: 0 }]);
  const [mats, setMats] = useState<MatRow[]>([{ material_id: "", quantity_used: 0 }]);

  function addItem() { setItems((p) => [...p, { product_id: "", quantity_produced: 0 }]); }
  function removeItem(i: number) { setItems((p) => p.filter((_, idx) => idx !== i)); }
  function updateItem(i: number, field: keyof ItemRow, value: string | number) {
    setItems((p) => p.map((row, idx) => idx === i ? { ...row, [field]: value } : row));
  }

  function addMat() { setMats((p) => [...p, { material_id: "", quantity_used: 0 }]); }
  function removeMat(i: number) { setMats((p) => p.filter((_, idx) => idx !== i)); }
  function updateMat(i: number, field: keyof MatRow, value: string | number) {
    setMats((p) => p.map((row, idx) => idx === i ? { ...row, [field]: value } : row));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validItems = items.filter((i) => i.product_id && i.quantity_produced > 0);
    if (!validItems.length) { toast.error("Add at least one product with a quantity"); return; }

    const validMats = mats.filter((m) => m.material_id && m.quantity_used > 0);

    setSubmitting(true);
    const fd = new FormData();
    fd.set("production_date", date);
    fd.set("notes", notes);
    fd.set("items", JSON.stringify(validItems));
    fd.set("materials", JSON.stringify(validMats));

    const result = await recordProductionRun(fd);
    setSubmitting(false);
    if (result?.error) { toast.error(result.error); return; }
    toast.success("Production run recorded — stock updated");
    router.push("/inventory");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Production date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Notes (optional)</Label>
          <Input placeholder="Batch notes…" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      {/* Products made */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Products made</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add product
          </Button>
        </div>
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <Select value={item.product_id} onValueChange={(v) => updateItem(i, "product_id", v ?? "")}>
                <SelectTrigger data-testid="production-product-select">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.cup_size})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-28 space-y-1">
              <Input
                type="number"
                min="1"
                placeholder="Bottles"
                value={item.quantity_produced || ""}
                onChange={(e) => updateItem(i, "quantity_produced", Number(e.target.value))}
                data-testid="production-quantity-input"
              />
            </div>
            {items.length > 1 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <Separator />

      {/* Materials used */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Materials used</Label>
          <Button type="button" variant="outline" size="sm" onClick={addMat}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add material
          </Button>
        </div>
        {mats.map((mat, i) => {
          const selectedMat = materials.find((m) => m.id === mat.material_id);
          return (
            <div key={i} className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Select value={mat.material_id} onValueChange={(v) => updateMat(i, "material_id", v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name} ({m.unit})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-28">
                <Input
                  type="number"
                  min="0"
                  step="0.001"
                  placeholder={selectedMat?.unit ?? "Qty"}
                  value={mat.quantity_used || ""}
                  onChange={(e) => updateMat(i, "quantity_used", Number(e.target.value))}
                />
              </div>
              {mats.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removeMat(i)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          );
        })}
        <p className="text-xs text-muted-foreground">
          Materials will be deducted from stock automatically.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={submitting} data-testid="save-production-btn">
        {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : "Record production run"}
      </Button>
    </form>
  );
}
