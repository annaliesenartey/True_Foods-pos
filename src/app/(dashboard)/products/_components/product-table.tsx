"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import type { Category, Product } from "@/lib/types";
import { ProductForm } from "./product-form";
import { deleteProduct } from "../actions";
import { toast } from "sonner";

interface ProductTableProps {
  products: Product[];
  categories: Category[];
}

export function ProductTable({ products, categories }: ProductTableProps) {
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteProduct(deleteId);
    setDeleting(false);
    if (result?.error) { toast.error(result.error); return; }
    toast.success("Product deleted");
    setDeleteId(null);
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setAddOpen(true)} data-testid="add-product-btn">
          <Plus className="h-4 w-4 mr-2" /> Add product
        </Button>
      </div>

      {/* Add sheet */}
      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add product</SheetTitle>
          </SheetHeader>
          <ProductForm categories={categories} onSuccess={() => setAddOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Edit sheet */}
      <Sheet open={!!editProduct} onOpenChange={(o) => !o && setEditProduct(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit product</SheetTitle>
          </SheetHeader>
          {editProduct && (
            <ProductForm
              categories={categories}
              product={editProduct}
              onSuccess={() => setEditProduct(null)}
            />
          )}
        </SheetContent>
      </Sheet>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                  No products yet. Add your first product above.
                </TableCell>
              </TableRow>
            )}
            {products.map((p) => {
              const lowStock = p.stock_quantity <= p.low_stock_threshold;
              return (
                <TableRow key={p.id} data-testid="product-row">
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {p.category?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{p.cup_size}</Badge>
                  </TableCell>
                  <TableCell>GHS {Number(p.price_ghs).toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`flex items-center gap-1 text-sm ${lowStock ? "text-destructive font-medium" : ""}`}>
                      {lowStock && <AlertTriangle className="h-3.5 w-3.5" />}
                      {p.stock_quantity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.is_active ? "default" : "secondary"}>
                      {p.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditProduct(p)}
                        data-testid="edit-product-btn"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(p.id)}
                        data-testid="delete-product-btn"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete product?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete the product. Past orders will not be affected.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} data-testid="confirm-delete-btn">
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
