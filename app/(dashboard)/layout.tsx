import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Belt-and-braces: middleware already guards these routes, but a direct
  // server-side check keeps this layout safe even if middleware is bypassed.
  if (!session) {
    redirect("/login");
  }

  return <DashboardShell userName={session.name}>{children}</DashboardShell>;
}
