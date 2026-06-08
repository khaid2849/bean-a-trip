"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Map, PlaneTakeoff, Settings } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trips",     label: "Trips",     icon: Map },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={close}
        />
      )}

      <aside className={cn(
        "flex h-screen w-60 flex-col border-r border-[var(--border-default)] bg-washi-100 dark:bg-sumi-400",
        // Mobile: fixed overlay, controlled by isOpen
        "fixed inset-y-0 left-0 z-50 transition-transform duration-300",
        // Desktop: static, always visible
        "md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-[var(--border-default)] px-5">
          <PlaneTakeoff className="h-6 w-6 text-terracotta" />
          <span className="text-lg font-medium tracking-tight text-terracotta">BeanATrip</span>
        </div>

        {/* Main nav */}
        <nav className="flex-1 space-y-0.5 p-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150",
                  isActive
                    ? "border-l-2 border-terracotta bg-terracotta-lt dark:bg-[#5A2318] font-medium text-terracotta dark:text-terracotta-dk"
                    : "text-washi-600 dark:text-[#A89882] hover:bg-washi-200 dark:hover:bg-sumi-100"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-terracotta dark:text-terracotta-dk" : "text-washi-400 dark:text-[#6B5E4E]"
                  )}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Settings — pinned to bottom */}
        <div className="border-t border-[var(--border-default)] p-3">
          <Link
            href="/settings"
            onClick={close}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150",
              pathname.startsWith("/settings")
                ? "border-l-2 border-terracotta bg-terracotta-lt dark:bg-[#5A2318] font-medium text-terracotta dark:text-terracotta-dk"
                : "text-washi-600 dark:text-[#A89882] hover:bg-washi-200 dark:hover:bg-sumi-100"
            )}
          >
            <Settings
              className={cn(
                "h-4 w-4 shrink-0",
                pathname.startsWith("/settings") ? "text-terracotta dark:text-terracotta-dk" : "text-washi-400 dark:text-[#6B5E4E]"
              )}
            />
            Settings
          </Link>
        </div>
      </aside>
    </>
  );
}
