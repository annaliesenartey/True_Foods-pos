"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createCategory, deleteCategory } from "./actions";
import type { Category } from "@/lib/types";

export function CategoriesClient({ categories }: { categories: Category[] }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const fd = new FormData();
    fd.set("name", name);
    const result = await createCategory(fd);
    setSaving(false);
    if (result?.error) { toast.error(result.error); return; }
    toast.success("Category added");
    setName("");
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const result = await deleteCategory(id);
    setDeletingId(null);
    if (result?.error) { toast.error(result.error); return; }
    toast.success("Category deleted");
  }

  return (
    <div className="space-y-4">
      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          placeholder="e.g. Fruit Yoghurt"
          value={name}
          onChange={(e) => setName(e.target.value)}
          data-testid="category-name-input"
        />
        <Button type="submit" disabled={saving} data-testid="add-category-btn">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1" />Add</>}
        </Button>
      </form>

      {/* List */}
      <div className="rounded-lg border border-border divide-y divide-border">
        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No categories yet. Add one above.
          </p>
        )}
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between px-4 py-3">
            <span className="font-medium text-sm">{cat.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive h-8 w-8"
              onClick={() => handleDelete(cat.id)}
              disabled={deletingId === cat.id}
              data-testid="delete-category-btn"
            >
              {deletingId === cat.id
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Trash2 className="h-4 w-4" />}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
