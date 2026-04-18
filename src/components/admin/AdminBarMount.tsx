"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth-context";
import { isAdminEmail } from "@/lib/admins";

// Mount point for the floating AdminBar. Two jobs:
//
//   1. Guard the entire bar behind an admin-email check. Non-admins
//      never load the AdminBar chunk at all — the dynamic import below
//      keeps it out of their bundle.
//   2. Wrap in Suspense because the inner AdminBar calls useSearchParams
//      which requires a Suspense boundary on static-export'd pages.
//
// Kept as a separate file so the root layout stays a server component
// (RootLayout itself can't be "use client" — it renders metadata).

const AdminBar = dynamic(() => import("@/components/admin/AdminBar"), {
  ssr: false,
});

export default function AdminBarMount() {
  const { user, isLoggedIn } = useAuth();
  const isAdmin = isLoggedIn && isAdminEmail(user?.email);

  if (!isAdmin) return null;

  return (
    <Suspense fallback={null}>
      <AdminBar />
    </Suspense>
  );
}
