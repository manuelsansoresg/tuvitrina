"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PlanType, Role } from "@prisma/client";
import { PLAN_LIMITS } from "@/lib/constants";

export async function updateBusinessCard(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    return { message: "No autenticado" };
  }

  // Check if targetUserId is provided (Admin override)
  const targetUserId = formData.get("targetUserId") as string;
  const isSelf = !targetUserId || targetUserId === session.user.id;
  
  if (!isSelf && session.user.role !== Role.ADMIN) {
     return { message: "No autorizado para editar esta tarjeta" };
  }

  const userIdToUpdate = isSelf ? session.user.id : targetUserId;

  // If editing self, we can use email for safety, but if admin editing other, use ID
  const whereClause = isSelf ? { email: session.user.email } : { id: userIdToUpdate };

  const user = await prisma.user.findUnique({
    where: whereClause as any, // TS might complain about OneOf, casting to any for simplicity or specific type
    include: { businessCard: true },
  });

  if (!user || !user.businessCard) {
    return { message: "Usuario o tarjeta no encontrados" };
  }

  // Admin always gets PREMIUM limits regardless of whose card they are editing?
  // User asked: "que pueda editar la tarjeta de cualquier usuario"
  // If Admin edits a User's card, should they be bound by User's limits or Admin's power?
  // Usually Admin has god-mode. Let's use Admin Role to determine limits application.
  
  // If the EDITOR is Admin, use Premium limits.
  const isEditorAdmin = session.user.role === Role.ADMIN;

  const limits = isEditorAdmin 
    ? PLAN_LIMITS.PREMIUM 
    : (PLAN_LIMITS[user.plan as PlanType] || PLAN_LIMITS.EXPRESS);

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const themeColor = formData.get("themeColor") as string;
  const location = formData.get("location") as string;
  const slug = formData.get("slug") as string;

  // Validate theme color update based on plan
  const finalThemeColor = limits.allowThemeColor ? themeColor : user.businessCard.themeColor;
  
  // Validate location update based on plan
  const finalLocation = limits.allowLocation ? location : user.businessCard.location;

  try {
    await prisma.businessCard.update({
      where: { id: user.businessCard.id },
      data: {
        title,
        description,
        themeColor: finalThemeColor,
        location: finalLocation,
        slug,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/${slug}`);
    
    return { message: "Tarjeta actualizada correctamente", success: true };
  } catch (error) {
    console.error("Error updating card:", error);
    return { message: "Error al actualizar la tarjeta" };
  }
}

export async function getDashboardData() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
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

  if (!user) return null;

  return {
    user,
    limits: (user.role === Role.ADMIN) 
      ? PLAN_LIMITS.PREMIUM 
      : (PLAN_LIMITS[user.plan as PlanType] || PLAN_LIMITS.EXPRESS),
  };
}
