"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Category, Product } from "@/lib/types";
import { createProduct, updateProduct } from "../actions";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  category_id: z.string().optional(),
  cup_size: z.enum(["500ml", "1L"]),
  price_ghs: z.coerce.number().positive("Price must be greater than 0"),
  low_stock_threshold: z.coerce.number().int().min(0).default(10),
  is_active: z.boolean().default(true),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ProductFormProps {
  categories: Category[];
  product?: Product;
  onSuccess: () => void;
}

export function ProductForm({ categories, product, onSuccess }: ProductFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name ?? "",
      category_id: product?.category_id ?? undefined,
      cup_size: product?.cup_size ?? "500ml",
      price_ghs: product?.price_ghs ?? undefined,
      low_stock_threshold: product?.low_stock_threshold ?? 10,
      is_active: product?.is_active ?? true,
      description: product?.description ?? "",
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.set(k, String(v));
    });

    const result = product
      ? await updateProduct(product.id, fd)
      : await createProduct(fd);

    setSubmitting(false);
    if (result?.error) { toast.error(result.error); return; }
    toast.success(product ? "Product updated" : "Product created");
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label htmlFor="name">Product name</Label>
        <Input id="name" placeholder="e.g. Mango Yoghurt" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select
            defaultValue={product?.category_id ?? undefined}
            onValueChange={(v) => setValue("category_id", v)}
          >
            <SelectTrigger data-testid="category-select">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Cup size</Label>
          <Select
            defaultValue={product?.cup_size ?? "500ml"}
            onValueChange={(v) => setValue("cup_size", v as "500ml" | "1L")}
          >
            <SelectTrigger data-testid="cup-size-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="500ml">500ml</SelectItem>
              <SelectItem value="1L">1L</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="price_ghs">Price (GHS)</Label>
          <Input
            id="price_ghs"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            data-testid="price-input"
            {...register("price_ghs")}
          />
          {errors.price_ghs && <p className="text-xs text-destructive">{errors.price_ghs.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="low_stock_threshold">Low stock alert (bottles)</Label>
          <Input
            id="low_stock_threshold"
            type="number"
            min="0"
            placeholder="10"
            {...register("low_stock_threshold")}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description (optional)</Label>
        <Input id="description" placeholder="Any notes about this product" {...register("description")} />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="is_active"
          defaultChecked={product?.is_active ?? true}
          onChange={(e) => setValue("is_active", e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="is_active">Active (visible on POS)</Label>
      </div>

      <Button type="submit" className="w-full" disabled={submitting} data-testid="save-product-btn">
        {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : product ? "Update product" : "Add product"}
      </Button>
    </form>
  );
}
