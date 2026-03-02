import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAdminUsers, getAdminStats } from "@/actions/admin";
import AdminClient from "@/components/admin/admin-client";

export default async function AdminPage() {
  const session = await auth();
  
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/");
  }

  const users = await getAdminUsers();
  const stats = await getAdminStats();

  return <AdminClient initialUsers={users} stats={stats} currentUserEmail={session.user.email} />;
}
