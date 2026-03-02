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
  let slug = formData.get("slug") as string;
  
  // Sanitize slug server-side
  if (slug) {
    slug = slug.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  const logoUrl = formData.get("logoUrl") as string;
  const bannerUrl = formData.get("bannerUrl") as string;
  const linksJson = formData.get("links") as string;
  const galleryJson = formData.get("gallery") as string;

  // Colors and Background
  const cardBackgroundColor = formData.get("cardBackgroundColor") as string;
  const cardBackgroundImage = formData.get("cardBackgroundImage") as string;
  const titleColor = formData.get("titleColor") as string;
  const descriptionColor = formData.get("descriptionColor") as string;
  const iconColor = formData.get("iconColor") as string;
  const galleryTitleColor = formData.get("galleryTitleColor") as string;
  const galleryPriceColor = formData.get("galleryPriceColor") as string;
  const linkTextColor = formData.get("linkTextColor") as string;
  const linkBackgroundColor = formData.get("linkBackgroundColor") as string;
  const linkBorderColor = formData.get("linkBorderColor") as string;

  // Validate theme color update based on plan
  const finalThemeColor = limits.allowThemeColor ? themeColor : user.businessCard.themeColor;
  
  // Validate advanced customization based on plan (Using allowThemeColor as a proxy for "Customization" feature for now, or assume available to all or specific plans)
  // Assuming allowThemeColor covers general color customization
  const canCustomizeColors = limits.allowThemeColor;

  const finalCardBackgroundColor = canCustomizeColors ? cardBackgroundColor : user.businessCard.cardBackgroundColor;
  const finalCardBackgroundImage = canCustomizeColors ? cardBackgroundImage : user.businessCard.cardBackgroundImage;
  const finalTitleColor = canCustomizeColors ? titleColor : user.businessCard.titleColor;
  const finalDescriptionColor = canCustomizeColors ? descriptionColor : user.businessCard.descriptionColor;
  const finalIconColor = canCustomizeColors ? iconColor : user.businessCard.iconColor;
  const finalGalleryTitleColor = canCustomizeColors ? galleryTitleColor : user.businessCard.galleryTitleColor;
  const finalGalleryPriceColor = canCustomizeColors ? galleryPriceColor : user.businessCard.galleryPriceColor;
  const finalLinkTextColor = canCustomizeColors ? linkTextColor : user.businessCard.linkTextColor;
  const finalLinkBackgroundColor = canCustomizeColors ? linkBackgroundColor : user.businessCard.linkBackgroundColor;
  const finalLinkBorderColor = canCustomizeColors ? linkBorderColor : user.businessCard.linkBorderColor;

  // Validate location update based on plan
  const finalLocation = limits.allowLocation ? location : user.businessCard.location;

  try {
    await prisma.$transaction(async (tx) => {
      // Update Card Basic Info
      await tx.businessCard.update({
        where: { id: user.businessCard!.id },
        data: {
          title,
          description,
          themeColor: finalThemeColor,
          location: finalLocation,
          slug,
          logoUrl,
          bannerUrl,
          cardBackgroundColor: finalCardBackgroundColor,
          cardBackgroundImage: finalCardBackgroundImage,
          titleColor: finalTitleColor,
          descriptionColor: finalDescriptionColor,
          iconColor: finalIconColor,
          galleryTitleColor: finalGalleryTitleColor,
          galleryPriceColor: finalGalleryPriceColor,
          linkTextColor: finalLinkTextColor,
          linkBackgroundColor: finalLinkBackgroundColor,
          linkBorderColor: finalLinkBorderColor,
        },
      });

      // Update Links if provided
      if (linksJson) {
        const links = JSON.parse(linksJson);
        await tx.link.deleteMany({ where: { cardId: user.businessCard!.id } });
        if (links.length > 0) {
            await tx.link.createMany({
            data: links.map((link: any, index: number) => ({
                cardId: user.businessCard!.id,
                icon: link.icon,
                label: link.label,
                url: link.url,
                order: index,
            })),
            });
        }
      }

      // Update Gallery if provided
      if (galleryJson) {
        const gallery = JSON.parse(galleryJson);
        // Only update gallery if we have valid data (array)
        if (Array.isArray(gallery)) {
            await tx.galleryImage.deleteMany({ where: { cardId: user.businessCard!.id } });
            if (gallery.length > 0) {
                await tx.galleryImage.createMany({
                    data: gallery.map((img: any, index: number) => ({
                        cardId: user.businessCard!.id,
                        imageUrl: img.imageUrl,
                        title: img.title,
                        price: img.price ? parseFloat(img.price) : null,
                        order: index,
                    })),
                });
            }
        }
      }
    });

    revalidatePath("/dashboard");
    revalidatePath(`/${slug}`);
    
    return { message: "Tarjeta actualizada correctamente", success: true };
  } catch (error) {
    console.error("Error updating card:", error);
    return { message: "Error al actualizar la tarjeta" };
  }
}

export async function updateSocialLinks(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    return { message: "No autenticado" };
  }

  const targetUserId = formData.get("targetUserId") as string;
  const isSelf = !targetUserId || targetUserId === session.user.id;
  
  if (!isSelf && session.user.role !== Role.ADMIN) {
     return { message: "No autorizado para editar esta tarjeta" };
  }

  const userIdToUpdate = isSelf ? session.user.id : targetUserId;
  const whereClause = isSelf ? { email: session.user.email } : { id: userIdToUpdate };

  const user = await prisma.user.findUnique({
    where: whereClause as any,
    include: { businessCard: true },
  });

  if (!user || !user.businessCard) {
    return { message: "Usuario o tarjeta no encontrados" };
  }

  const cardId = user.businessCard.id;

  try {
    const linksJson = formData.get("links") as string;
    const links = JSON.parse(linksJson);

    // Delete existing links and create new ones (simplest approach for full sync)
    // Alternatively, update/create/delete based on ID, but full sync is safer for order
    await prisma.$transaction([
      prisma.link.deleteMany({ where: { cardId } }),
      prisma.link.createMany({
        data: links.map((link: any, index: number) => ({
          cardId,
          icon: link.icon,
          label: link.label,
          url: link.url,
          order: index,
        })),
      }),
    ]);

    revalidatePath("/dashboard");
    revalidatePath(`/${user.businessCard.slug}`);

    return { message: "Redes sociales actualizadas", success: true };
  } catch (error) {
    console.error("Error updating links:", error);
    return { message: "Error al actualizar redes sociales" };
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
