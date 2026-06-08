import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { SettingsProvider } from "@/context/SettingsContext";
import { SidebarProvider } from "@/context/SidebarContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden bg-[var(--bg-page)]">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
            <Toaster position="bottom-right" />
          </div>
        </div>
      </SidebarProvider>
    </SettingsProvider>
  );
}
