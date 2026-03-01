"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PlanType } from "@prisma/client";

// Define limits per plan
export const PLAN_LIMITS = {
  EXPRESS: {
    galleryImages: 0,
    allowLocation: false,
    allowThemeColor: false,
    allowProducts: false,
  },
  EMPRENDEDOR: {
    galleryImages: 5,
    allowLocation: true,
    allowThemeColor: true,
    allowProducts: false,
  },
  PREMIUM: {
    galleryImages: 12,
    allowLocation: true,
    allowThemeColor: true,
    allowProducts: true,
  },
};

export async function updateBusinessCard(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    return { message: "No autenticado" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { businessCard: true },
  });

  if (!user || !user.businessCard) {
    return { message: "Usuario o tarjeta no encontrados" };
  }

  const limits = PLAN_LIMITS[user.plan as PlanType] || PLAN_LIMITS.EXPRESS;

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
    limits: PLAN_LIMITS[user.plan as PlanType] || PLAN_LIMITS.EXPRESS,
  };
}
