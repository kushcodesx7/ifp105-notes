import type { ReactNode } from "react";
import AdminSubNav from "@/components/admin/AdminSubNav";
import AdminCommandPaletteMount from "@/components/admin/AdminCommandPaletteMount";
import { ToastProvider } from "@/components/admin/Toast";

// Shared layout for /admin/* pages.
//
// Wraps everything in the ToastProvider so any admin page can drop
// `useToast()` and get a consistent notification channel. Sticky sub-nav
// sits under the main Navbar so admins can jump between Home · People ·
// Roster · Tools without going back to a hub page.
//
// AdminCommandPaletteMount owns the global ⌘K listener + lazy-loads
// the palette chunk only when the signed-in user is an admin. Every
// admin page gets Cmd+K navigation for free.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AdminSubNav />
      <AdminCommandPaletteMount />
      {children}
    </ToastProvider>
  );
}
