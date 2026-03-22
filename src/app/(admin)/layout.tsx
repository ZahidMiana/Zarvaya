import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getAdminSession } from "@/lib/admin/session";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const session = getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <AdminShell adminEmail={session.email}>
      <Suspense
        fallback={<div className="h-64 animate-pulse rounded-2xl border border-stone-200 bg-white" />}
      >
        {children}
      </Suspense>
    </AdminShell>
  );
}
