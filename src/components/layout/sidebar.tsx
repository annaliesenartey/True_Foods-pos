"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Package,
  History,
  BarChart3,
  Settings,
  LogOut,
  Boxes,
  Tag,
  FlaskConical,
  Users,
  Receipt,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/login/actions";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders/new", label: "Register", icon: ShoppingCart },
  { href: "/orders", label: "Orders", icon: History },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/products", label: "Catalog", icon: Package },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/inventory/categories", label: "Categories", icon: Tag, indent: true },
  { href: "/inventory/materials", label: "Materials", icon: FlaskConical, indent: true },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-52 min-h-screen bg-sidebar border-r border-sidebar-border">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm">
          T
        </div>
        <div>
          <p className="font-semibold text-sidebar-foreground text-sm leading-tight">True Foods</p>
          <p className="text-xs text-muted-foreground">ACCRA · 01</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, indent }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : href === "/orders/new"
              ? pathname === "/orders/new"
              : href === "/orders"
              ? pathname === "/orders"
              : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[0.9375rem] transition-colors",
                indent && "pl-8 text-sm py-2",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className={cn("shrink-0", indent ? "h-3.5 w-3.5" : "h-4 w-4")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — theme toggle + user + sign out */}
      <div className="px-2 py-3 border-t border-sidebar-border space-y-1">
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-xs text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
              A
            </div>
            <span className="flex-1 text-left text-xs leading-tight">
              <span className="block font-medium">anna</span>
              <span className="text-muted-foreground">Counter</span>
            </span>
            <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </form>
      </div>
    </aside>
  );
}
