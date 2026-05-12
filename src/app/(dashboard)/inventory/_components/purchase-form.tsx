"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { recordPurchase } from "../actions";
import type { Material } from "@/lib/types";

const schema = z.object({
  material_id: z.string().uuid("Select a material"),
  quantity: z.coerce.number().positive("Enter a quantity"),
  cost_per_unit: z.coerce.number().min(0).optional(),
  total_cost: z.coerce.number().min(0).optional(),
  purchased_at: z.string(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function PurchaseForm({ materials }: { materials: Material[] }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const selectedMaterialId = useState<string>("");

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      purchased_at: new Date().toISOString().split("T")[0],
    },
  });

  const materialId = watch("material_id");
  const selectedMaterial = materials.find((m) => m.id === materialId);

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => {
      if (v !== undefined && v !== "") fd.set(k, String(v));
    });
    const result = await recordPurchase(fd);
    setSubmitting(false);
    if (result?.error) { toast.error(result.error); return; }
    toast.success("Purchase recorded — stock updated");
    router.push("/inventory");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Material</Label>
        <Select onValueChange={(v) => setValue("material_id", v)}>
          <SelectTrigger data-testid="material-select">
            <SelectValue placeholder="Select material" />
          </SelectTrigger>
          <SelectContent>
            {materials.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name} ({m.unit})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.material_id && <p className="text-xs text-destructive">{errors.material_id.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="quantity">
          Quantity {selectedMaterial ? `(${selectedMaterial.unit})` : ""}
        </Label>
        <Input
          id="quantity"
          type="number"
          step="0.001"
          min="0"
          placeholder="0"
          data-testid="quantity-input"
          {...register("quantity")}
        />
        {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="cost_per_unit">Cost per unit (GHS)</Label>
          <Input id="cost_per_unit" type="number" step="0.01" min="0" placeholder="0.00" {...register("cost_per_unit")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="total_cost">Total cost (GHS)</Label>
          <Input id="total_cost" type="number" step="0.01" min="0" placeholder="0.00" {...register("total_cost")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="purchased_at">Date purchased</Label>
        <Input id="purchased_at" type="date" {...register("purchased_at")} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Input id="notes" placeholder="Supplier, batch number, etc." {...register("notes")} />
      </div>

      <Button type="submit" className="w-full" disabled={submitting} data-testid="save-purchase-btn">
        {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : "Record purchase"}
      </Button>
    </form>
  );
}
