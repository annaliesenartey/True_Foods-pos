"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Plus, Search, Users, Phone, Mail, Pencil, Trash2, ShoppingBag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import type { Customer, Order } from "@/lib/types";
import { createCustomer, updateCustomer, deleteCustomer } from "../actions";

interface CustomerClientProps {
  customers: (Customer & { orders: Order[] })[];
}

export function CustomerClient({ customers }: CustomerClientProps) {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [viewCustomer, setViewCustomer] = useState<(Customer & { orders: Order[] }) | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() =>
    customers.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    ),
    [customers, search]
  );

  async function handleSave(fd: FormData, id?: string) {
    setSaving(true);
    const result = id ? await updateCustomer(id, fd) : await createCustomer(fd);
    setSaving(false);
    if (result.error) { toast.error(result.error); return; }
    toast.success(id ? "Customer updated" : "Customer added");
    setAddOpen(false);
    setEditCustomer(null);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteCustomer(deleteId);
    setDeleting(false);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Customer deleted");
    setDeleteId(null);
  }

  const CustomerForm = ({ customer }: { customer?: Customer }) => (
    <form action={(fd) => handleSave(fd, customer?.id)} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label htmlFor="name">Full name *</Label>
        <Input id="name" name="name" defaultValue={customer?.name} placeholder="e.g. Abena Mensah" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone number</Label>
        <Input id="phone" name="phone" type="tel" defaultValue={customer?.phone ?? ""} placeholder="0244000000" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email (optional)</Label>
        <Input id="email" name="email" type="email" defaultValue={customer?.email ?? ""} placeholder="abena@example.com" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" name="notes" defaultValue={customer?.notes ?? ""} placeholder="e.g. Prefers 500ml cups, orders every Friday" className="h-20 resize-none" />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={() => { setAddOpen(false); setEditCustomer(null); }}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving ? "Saving…" : customer ? "Update" : "Add customer"}
        </Button>
      </div>
    </form>
  );

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1>Customers</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{customers.length} saved</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add customer
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search by name or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-sm gap-3">
          <Users className="h-12 w-12 opacity-20" />
          <span>{search ? "No customers match your search" : "No customers yet"}</span>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => {
            const totalSpent = c.orders.reduce((s, o) => s + Number(o.total_amount), 0);
            return (
              <div
                key={c.id}
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => setViewCustomer(c)}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                    {c.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>}
                    {c.email && <span className="flex items-center gap-1 hidden sm:flex"><Mail className="h-3 w-3" />{c.email}</span>}
                  </p>
                </div>

                {/* Stats */}
                <div className="text-right shrink-0 mr-1">
                  <p className="text-sm font-semibold">GHS {totalSpent.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{c.orders.length} order{c.orders.length !== 1 ? "s" : ""}</p>
                </div>

                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            );
          })}
        </div>
      )}

      {/* Add sheet */}
      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent>
          <SheetHeader><SheetTitle>Add customer</SheetTitle></SheetHeader>
          <CustomerForm />
        </SheetContent>
      </Sheet>

      {/* Edit sheet */}
      <Sheet open={!!editCustomer} onOpenChange={(o) => !o && setEditCustomer(null)}>
        <SheetContent>
          <SheetHeader><SheetTitle>Edit customer</SheetTitle></SheetHeader>
          {editCustomer && <CustomerForm customer={editCustomer} />}
        </SheetContent>
      </Sheet>

      {/* View customer sheet */}
      <Sheet open={!!viewCustomer} onOpenChange={(o) => !o && setViewCustomer(null)}>
        <SheetContent className="flex flex-col">
          {viewCustomer && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                    {viewCustomer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <SheetTitle>{viewCustomer.name}</SheetTitle>
                    <p className="text-sm text-muted-foreground">{viewCustomer.phone ?? "No phone"}</p>
                  </div>
                </div>
              </SheetHeader>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { label: "TOTAL SPENT", value: `GHS ${viewCustomer.orders.reduce((s, o) => s + Number(o.total_amount), 0).toFixed(2)}` },
                  { label: "ORDERS", value: String(viewCustomer.orders.length) },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg bg-muted/50 p-3">
                    <p className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase">{label}</p>
                    <p className="text-lg font-bold mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {viewCustomer.notes && (
                <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 mt-2">{viewCustomer.notes}</p>
              )}

              <Separator className="my-3" />

              {/* Order history */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Order history</p>
              <div className="flex-1 overflow-y-auto space-y-2">
                {viewCustomer.orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>
                ) : (
                  viewCustomer.orders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-sm font-medium">Order #{o.order_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(o.created_at).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">GHS {Number(o.total_amount).toFixed(2)}</p>
                        <Badge variant={o.status === "completed" ? "default" : "secondary"} className="text-[10px] h-4">
                          {o.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-border mt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setViewCustomer(null); setEditCustomer(viewCustomer); }}
                >
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => { setViewCustomer(null); setDeleteId(viewCustomer.id); }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete customer?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Their order history will be kept but unlinked from this profile.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
