"use client";

import { ThemeToggle } from "./ThemeToggle";
import { Menu } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

interface NavbarProps {
  title?: string;
}

export function Navbar({ title = "Dashboard" }: NavbarProps) {
  const { toggle } = useSidebar();

  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--border-default)] bg-white dark:bg-sumi-200 px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-secondary)] transition-colors hover:bg-washi-100 dark:hover:bg-sumi-100 md:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base font-medium text-[var(--text-primary)]">{title}</h1>
      </div>
      <ThemeToggle />
    </header>
  );
}
