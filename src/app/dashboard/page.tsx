import { auth } from "@/auth";
import { getDashboardData } from "@/actions/dashboard";
import { getAdminStats, getAdminUsers } from "@/actions/admin";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import AdminClient from "@/components/admin/admin-client";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  // Admin View
  if (session.user.role === Role.ADMIN && searchParams?.view !== 'card') {
    const [users, stats] = await Promise.all([
      getAdminUsers(),
      getAdminStats()
    ]);
    
    return (
      <AdminClient 
        initialUsers={users} 
        stats={stats} 
        currentUserEmail={session.user.email} 
      />
    );
  }

  // User View (or Admin editing own card)
  const data = await getDashboardData();

  if (!data) {
    return <div>Error al cargar datos del usuario.</div>;
  }

  return <DashboardClient data={data as any} isSessionAdmin={session.user.role === Role.ADMIN} />;
}
