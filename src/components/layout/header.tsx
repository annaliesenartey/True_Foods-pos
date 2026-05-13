"use client";

import { Menu, Bell } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

interface HeaderProps {
  title?: string;
}

export function Header({ title = "True Foods POS" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-5 bg-background/90 backdrop-blur border-b border-border md:hidden">
      <Sheet>
        <SheetTrigger
          className="inline-flex items-center justify-center rounded-xl w-11 h-11 text-foreground hover:bg-accent transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xs">
          T
        </div>
        <span className="font-semibold text-base">{title}</span>
      </div>

      <ThemeToggle />
    </header>
  );
}
