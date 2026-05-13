"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ShoppingCart, Plus, Minus, X,
  User, Phone, FileText, AlertTriangle, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import type { Category, Product, CartItem } from "@/lib/types";
import { placeOrder } from "../actions";

interface RegisterClientProps {
  products: Product[];
  categories: Category[];
}

export function RegisterClient({ products, categories }: RegisterClientProps) {
  const router = useRouter();

  // ── State ─────────────────────────────────────────────────────
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [placing, setPlacing] = useState(false);

  // ── Derived ───────────────────────────────────────────────────
  const cartTotal = useMemo(
    () => cart.reduce((s, i) => s + i.product.price_ghs * i.quantity, 0),
    [cart]
  );
  const cartCount = useMemo(
    () => cart.reduce((s, i) => s + i.quantity, 0),
    [cart]
  );
  const filteredProducts = useMemo(() => {
    const active = products.filter((p) => p.is_active);
    return activeCategory === "all"
      ? active
      : active.filter((p) => p.category_id === activeCategory);
  }, [products, activeCategory]);

  // ── Cart mutations ────────────────────────────────────────────
  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + 1, product.stock_quantity) }
            : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function updateQty(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.product.id !== productId) return i;
          const next = i.quantity + delta;
          if (next <= 0) return null as unknown as CartItem;
          return { ...i, quantity: Math.min(next, i.product.stock_quantity) };
        })
        .filter(Boolean)
    );
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }

  function clearCart() {
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setNotes("");
  }

  // ── Checkout ──────────────────────────────────────────────────
  async function handleCheckout() {
    if (!cart.length) { toast.error("Cart is empty"); return; }
    setPlacing(true);

    const result = await placeOrder({
      items: cart.map((i) => ({
        product_id: i.product.id,
        product_name: i.product.name,
        cup_size: i.product.cup_size,
        unit_price: i.product.price_ghs,
        quantity: i.quantity,
        line_total: i.product.price_ghs * i.quantity,
      })),
      customer_name: customerName || null,
      customer_phone: customerPhone || null,
      notes: notes || null,
      total_amount: cartTotal,
    });

    setPlacing(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(`Order #${result.order_number} placed!`);
    clearCart();
    setCartOpen(false);
    router.refresh();
  }

  // ── Cart panel JSX (used in both desktop sidebar and mobile sheet)
  // NOTE: defined as a variable, NOT a nested component, to avoid remounting
  const cartPanelJsx = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
        <h2 className="font-semibold">Order</h2>
        {cartCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge className="h-5 min-w-5 text-xs px-1.5">{cartCount}</Badge>
            <button
              onClick={clearCart}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto px-4">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
            <ShoppingCart className="h-10 w-10 mb-3 opacity-25" />
            <span>Tap a product to add it</span>
          </div>
        ) : (
          <div className="py-3 space-y-3">
            {cart.map((item) => (
              <div key={item.product.id} className="flex items-center gap-2">
                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight truncate">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.product.cup_size} · GHS {Number(item.product.price_ghs).toFixed(2)}
                  </p>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => updateQty(item.product.id, -1)}
                    className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.product.id, 1)}
                    disabled={item.quantity >= item.product.stock_quantity}
                    className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors ml-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Line total */}
                <span className="w-16 text-right text-sm font-medium shrink-0">
                  GHS {(item.product.price_ghs * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer info + total + checkout */}
      <div className="border-t border-border px-4 py-4 space-y-3 shrink-0">
        <div className="space-y-2">
          <div className="relative">
            <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Customer name (optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Phone, e.g. 0244000000"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="pl-8 h-9 text-sm"
              type="tel"
            />
          </div>
          <div className="relative">
            <FileText className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Textarea
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="pl-8 text-sm min-h-0 h-[4.5rem] resize-none"
            />
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground font-medium">Total</span>
          <span className="text-2xl font-bold">GHS {cartTotal.toFixed(2)}</span>
        </div>

        <Button
          className="w-full h-11 text-base font-semibold"
          onClick={handleCheckout}
          disabled={placing || cart.length === 0}
          data-testid="checkout-btn"
        >
          {placing
            ? "Placing order…"
            : cart.length === 0
            ? "Add items to order"
            : `Charge GHS ${cartTotal.toFixed(2)}`}
        </Button>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────
  return (
    <>
      <div className="md:flex md:gap-5 md:items-start">
        {/* ── Left: product browser ─────────────────────────── */}
        <div className="flex-1 min-w-0 pb-24 md:pb-0">
          {/* Category filter pills */}
          <div className="flex items-center gap-2 pb-4 overflow-x-auto">
            {[{ id: "all", name: "All" }, ...categories].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Product grid */}
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-sm gap-2">
              <Package className="h-12 w-12 opacity-20" />
              <span>No active products found</span>
              <a href="/products" className="text-primary text-xs hover:underline">
                Go to Catalog to add products →
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3" data-testid="product-grid">
              {filteredProducts.map((product) => {
                const inCart = cart.find((i) => i.product.id === product.id);
                const outOfStock = product.stock_quantity === 0;
                const lowStock =
                  product.stock_quantity > 0 &&
                  product.stock_quantity <= product.low_stock_threshold;

                return (
                  <button
                    key={product.id}
                    onClick={() => !outOfStock && addToCart(product)}
                    disabled={outOfStock}
                    data-testid="product-card"
                    className={`relative flex flex-col items-start text-left p-3.5 rounded-xl border transition-all ${
                      outOfStock
                        ? "border-border opacity-50 cursor-not-allowed bg-muted/30"
                        : inCart
                        ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                        : "border-border bg-card hover:border-primary/40 hover:shadow-sm cursor-pointer"
                    }`}
                  >
                    {/* In-cart count bubble */}
                    {inCart && (
                      <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center leading-none">
                        {inCart.quantity}
                      </span>
                    )}

                    <p className="font-semibold text-sm leading-snug pr-6">{product.name}</p>

                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <Badge variant="outline" className="text-[11px] px-1.5 py-0 h-4">
                        {product.cup_size}
                      </Badge>
                      {product.category?.name && (
                        <span className="text-[11px] text-muted-foreground">{product.category.name}</span>
                      )}
                    </div>

                    <p className="mt-2.5 text-base font-bold text-primary">
                      GHS {Number(product.price_ghs).toFixed(2)}
                    </p>

                    <p
                      className={`text-xs mt-0.5 flex items-center gap-1 ${
                        outOfStock
                          ? "text-destructive"
                          : lowStock
                          ? "text-amber-500 dark:text-amber-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {lowStock && <AlertTriangle className="h-3 w-3" />}
                      {outOfStock
                        ? "Out of stock"
                        : lowStock
                        ? `${product.stock_quantity} left`
                        : `${product.stock_quantity} in stock`}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Desktop: sticky cart sidebar ──────────────────── */}
        <div className="hidden md:flex sticky top-0 w-80 shrink-0 flex-col border border-border rounded-xl bg-card overflow-hidden max-h-[calc(100vh-5rem)]">
          {cartPanelJsx}
        </div>
      </div>

      {/* ── Mobile: fixed bottom bar ──────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 px-4 py-3 bg-background/95 backdrop-blur border-t border-border">
        <button
          onClick={() => setCartOpen(true)}
          className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-between px-4"
        >
          <div className="flex items-center gap-2 text-sm">
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0
              ? `${cartCount} item${cartCount !== 1 ? "s" : ""} in cart`
              : "Cart is empty"}
          </div>
          {cartCount > 0 && (
            <span className="text-sm font-bold">GHS {cartTotal.toFixed(2)}</span>
          )}
        </button>
      </div>

      {/* ── Mobile: cart bottom sheet ─────────────────────── */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent side="bottom" className="h-[88vh] p-0 rounded-t-2xl flex flex-col">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-9 h-1 rounded-full bg-border" />
          </div>
          <div className="flex-1 overflow-hidden">
            {cartPanelJsx}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
