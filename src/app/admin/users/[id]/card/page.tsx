import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PLAN_LIMITS } from "@/lib/constants";
import { Role, PlanType } from "@prisma/client";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function AdminEditCardPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  // Security check: Only Admins can access this route
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/");
  }

  const { id: targetUserId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: {
      businessCard: {
        include: {
          links: { orderBy: { order: "asc" } },
          gallery: { orderBy: { order: "asc" } },
          products: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!user) {
    return <div>Usuario no encontrado</div>;
  }

  // Admin should respect User's plan limits for editing experience
  const limits = PLAN_LIMITS[user.plan as PlanType] || PLAN_LIMITS.EXPRESS;

  const data = {
    user,
    limits, 
  };

  return <DashboardClient data={data as any} targetUserId={targetUserId} isSessionAdmin={true} />;
}
