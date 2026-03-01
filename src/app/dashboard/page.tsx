import { auth } from "@/auth";
import { getDashboardData } from "@/actions/dashboard";
import DashboardClient from "@/components/dashboard/dashboard-client";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  const data = await getDashboardData();

  if (!data) {
    return <div>Error al cargar datos del usuario.</div>;
  }

  return <DashboardClient data={data} />;
}
