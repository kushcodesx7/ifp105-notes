import type { ReactNode } from "react";
import AdminSubNav from "@/components/admin/AdminSubNav";
import { ToastProvider } from "@/components/admin/Toast";

// Shared layout for /admin/* pages.
//
// Wraps everything in the ToastProvider so any admin page can drop
// `useToast()` and get a consistent notification channel. Sticky sub-nav
// sits under the main Navbar so admins can jump between Home · People ·
// Roster · Tools without going back to a hub page.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AdminSubNav />
      {children}
    </ToastProvider>
  );
}
