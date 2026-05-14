"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Expense, ExpenseCategory } from "@/lib/types";
import { EXPENSE_CATEGORIES } from "@/lib/types";
import { createExpense, deleteExpense } from "../actions";

interface ExpenseClientProps {
  expenses: Expense[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Rent: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Transport: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Utilities: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  Marketing: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  Packaging: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  Staff: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Equipment: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300",
  Other: "bg-muted text-muted-foreground",
};

export function ExpenseClient({ expenses }: ExpenseClientProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>("Other");

  const totalThisMonth = expenses
    .filter((e) => e.expense_date.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((s, e) => s + Number(e.amount), 0);

  async function handleAdd(fd: FormData) {
    fd.set("category", category);
    setSaving(true);
    const result = await createExpense(fd);
    setSaving(false);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Expense recorded");
    setAddOpen(false);
    setCategory("Other");
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteExpense(deleteId);
    setDeleting(false);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Expense deleted");
    setDeleteId(null);
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1>Expenses</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            This month: <span className="font-semibold text-foreground">GHS {totalThisMonth.toFixed(2)}</span>
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Log expense
        </Button>
      </div>

      {/* Table */}
      {expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-sm gap-3">
          <Receipt className="h-12 w-12 opacity-20" />
          <span>No expenses logged yet</span>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {new Date(e.expense_date).toLocaleDateString("en-GH", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[e.category] ?? CATEGORY_COLORS.Other}`}>
                      {e.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">{e.description}</td>
                  <td className="px-4 py-3 text-right font-semibold">GHS {Number(e.amount).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDeleteId(e.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log expense</DialogTitle>
          </DialogHeader>
          <form action={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="expense_date">Date</Label>
                <Input
                  id="expense_date"
                  name="expense_date"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="e.g. Monthly shop rent" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (GHS)</Label>
              <Input id="amount" name="amount" type="number" step="0.01" min="0.01" placeholder="0.00" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input id="notes" name="notes" placeholder="Any extra details" />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save expense"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete expense?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This cannot be undone.</p>
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
