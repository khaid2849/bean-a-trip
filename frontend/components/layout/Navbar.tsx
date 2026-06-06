"use client";

import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {
  title?: string;
}

export function Navbar({ title = "Dashboard" }: NavbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--border-default)] bg-white dark:bg-sumi-200 px-6">
      <h1 className="text-base font-medium text-[var(--text-primary)]">{title}</h1>
      <ThemeToggle />
    </header>
  );
}
