import type { ReactNode } from "react";
import AdminSubNav from "@/components/admin/AdminSubNav";

// Shared layout for /admin/* pages. Sticky sub-nav under the main Navbar
// so the teacher can jump between Dashboard / Students / Batches / Enrollments
// without going back to the top-level admin hub each time.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminSubNav />
      {children}
    </>
  );
}
