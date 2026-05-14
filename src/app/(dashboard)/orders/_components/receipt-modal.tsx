"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, MessageSquare, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { Order } from "@/lib/types";
import { sendReceiptSms } from "../actions";

interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export function ReceiptModal({ order, onClose }: ReceiptModalProps) {
  const [phone, setPhone] = useState(order?.customer_phone ?? "");
  const [sending, setSending] = useState(false);

  if (!order) return null;

  const pdfUrl = `/api/invoice/${order.id}`;

  async function handleSendSms() {
    const target = phone.trim();
    if (!target) { toast.error("Enter a phone number"); return; }
    setSending(true);
    const result = await sendReceiptSms(order!.id, target);
    setSending(false);
    if (result.error) { toast.error(result.error); return; }
    toast.success(`Receipt sent to ${target}`);
  }

  function handleWhatsApp() {
    if (!order) return;
    const msg = encodeURIComponent(
      `True Foods Receipt\nOrder #${order.order_number}\n` +
      (order.items ?? []).map((i) => `  ${i.product_name} ×${i.quantity} — GHS ${Number(i.line_total).toFixed(2)}`).join("\n") +
      `\nTotal: GHS ${Number(order.total_amount).toFixed(2)}\nThank you!`
    );
    const num = (phone || "").replace(/\D/g, "");
    const waNum = num.startsWith("0") ? "233" + num.slice(1) : num || "";
    window.open(`https://wa.me/${waNum}?text=${msg}`, "_blank");
  }

  return (
    <Dialog open={!!order} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Receipt — Order #{order.order_number}
          </DialogTitle>
        </DialogHeader>

        {/* Order summary */}
        <div className="space-y-2 text-sm">
          {order.customer_name && (
            <p className="text-muted-foreground">Customer: <span className="text-foreground font-medium">{order.customer_name}</span></p>
          )}
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">Item</th>
                  <th className="text-center px-3 py-2 font-medium text-muted-foreground">Qty</th>
                  <th className="text-right px-3 py-2 font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                {(order.items ?? []).map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2">{item.product_name} <span className="text-muted-foreground text-xs">({item.cup_size})</span></td>
                    <td className="px-3 py-2 text-center">{item.quantity}</td>
                    <td className="px-3 py-2 text-right">GHS {Number(item.line_total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between font-bold pt-1">
            <span>Total</span>
            <span>GHS {Number(order.total_amount).toFixed(2)}</span>
          </div>
        </div>

        <Separator />

        {/* Send actions */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="receipt-phone">Phone number</Label>
            <Input
              id="receipt-phone"
              type="tel"
              placeholder="0244000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={handleSendSms}
              disabled={sending}
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              {sending ? "Sending…" : "SMS receipt"}
            </Button>
            <Button
              variant="outline"
              onClick={handleWhatsApp}
              className="gap-2 text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-950"
            >
              <MessageSquare className="h-4 w-4" />
              WhatsApp
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => window.open(pdfUrl, "_blank")}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const w = window.open(pdfUrl, "_blank");
                w?.addEventListener("load", () => w.print());
              }}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
