"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { createMaterial, deleteMaterial, updateMaterialThreshold } from "./actions";
import type { Material } from "@/lib/types";

const UNITS = ["kg", "g", "ml", "pieces", "rolls", "bags", "boxes", "litres"];

export function MaterialsClient({ materials }: { materials: Material[] }) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("pieces");
  const [threshold, setThreshold] = useState("0");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const fd = new FormData();
    fd.set("name", name);
    fd.set("unit", unit);
    fd.set("low_stock_threshold", threshold);
    const result = await createMaterial(fd);
    setSaving(false);
    if (result?.error) { toast.error(result.error); return; }
    toast.success("Material added");
    setName(""); setThreshold("0");
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const result = await deleteMaterial(id);
    setDeletingId(null);
    if (result?.error) { toast.error(result.error); return; }
    toast.success("Material deleted");
  }

  async function handleThresholdBlur(id: string, value: string) {
    const result = await updateMaterialThreshold(id, Number(value));
    if (result?.error) toast.error(result.error);
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-semibold text-sm mb-4">Add new material</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5 col-span-2 md:col-span-1">
            <Label htmlFor="mat-name">Material name</Label>
            <Input
              id="mat-name"
              placeholder="e.g. Vanilla Flavour"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="material-name-input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Unit</Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger data-testid="unit-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNITS.map((u) => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mat-threshold">Low stock alert at</Label>
            <Input
              id="mat-threshold"
              type="number"
              min="0"
              step="0.001"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="col-span-2">
            <Button type="submit" disabled={saving} className="w-full" data-testid="add-material-btn">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Add material
            </Button>
          </div>
        </form>
      </div>

      {/* Materials table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Current stock</TableHead>
              <TableHead>Alert threshold</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  No materials yet.
                </TableCell>
              </TableRow>
            )}
            {materials.map((m) => (
              <TableRow key={m.id} data-testid="material-row">
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell className="text-muted-foreground">{m.unit}</TableCell>
                <TableCell>{m.current_stock} {m.unit}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step="0.001"
                    defaultValue={m.low_stock_threshold}
                    className="w-24 h-8"
                    onBlur={(e) => handleThresholdBlur(m.id, e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive h-8 w-8"
                    onClick={() => handleDelete(m.id)}
                    disabled={deletingId === m.id}
                  >
                    {deletingId === m.id
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Trash2 className="h-4 w-4" />}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
