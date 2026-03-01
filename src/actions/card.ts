"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const CardSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  themeColor: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
})

export async function createCard(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const themeColor = formData.get("themeColor") as string
  const logoUrl = formData.get("logoUrl") as string
  const slug = formData.get("slug") as string

  if (!slug) return { error: "Slug is required" }

  // Validate
  const validation = CardSchema.safeParse({ title, description, themeColor, logoUrl })
  if (!validation.success) return { error: validation.error.format() }

  try {
    // Check if slug exists
    const existing = await prisma.businessCard.findUnique({ where: { slug } })
    if (existing) return { error: "Slug already taken" }

    const card = await prisma.businessCard.create({
      data: {
        userId: session.user.id,
        slug,
        title,
        description,
        themeColor: themeColor || "#000000",
        logoUrl,
        active: true,
      }
    })
    revalidatePath("/dashboard")
    return { success: true, card }
  } catch (error) {
    console.error(error)
    return { error: "Failed to create card" }
  }
}

export async function updateCard(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const themeColor = formData.get("themeColor") as string
  const logoUrl = formData.get("logoUrl") as string

  // Validate
  const validation = CardSchema.safeParse({ title, description, themeColor, logoUrl })
  if (!validation.success) return { error: validation.error.format() }

  try {
    const card = await prisma.businessCard.update({
      where: { userId: session.user.id },
      data: {
        title,
        description,
        themeColor,
        logoUrl,
      }
    })
    revalidatePath("/dashboard")
    return { success: true, card }
  } catch (error) {
    console.error(error)
    return { error: "Failed to update card" }
  }
}

export async function addLink(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const label = formData.get("label") as string
  const url = formData.get("url") as string
  const icon = formData.get("icon") as string 

  const card = await prisma.businessCard.findUnique({ where: { userId: session.user.id } })
  if (!card) return { error: "Card not found" }

  try {
    await prisma.link.create({
      data: {
        cardId: card.id,
        label,
        url,
        icon,
      }
    })
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to add link" }
  }
}

export async function removeLink(linkId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  
  const link = await prisma.link.findUnique({ where: { id: linkId }, include: { card: true } })
  if (!link || link.card.userId !== session.user.id) return { error: "Unauthorized" }

  await prisma.link.delete({ where: { id: linkId } })
  revalidatePath("/dashboard")
  return { success: true }
}

export async function addImage(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }
  
    const imageUrl = formData.get("imageUrl") as string
    
    const card = await prisma.businessCard.findUnique({ where: { userId: session.user.id } })
    if (!card) return { error: "Card not found" }
  
    try {
      await prisma.galleryImage.create({
        data: {
          cardId: card.id,
          imageUrl,
          order: 0 
        }
      })
      revalidatePath("/dashboard")
      return { success: true }
    } catch (error) {
      console.error(error)
      return { error: "Failed to add image" }
    }
  }

export async function removeImage(imageId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  
  const image = await prisma.galleryImage.findUnique({ where: { id: imageId }, include: { card: true } })
  if (!image || image.card.userId !== session.user.id) return { error: "Unauthorized" }

  await prisma.galleryImage.delete({ where: { id: imageId } })
  revalidatePath("/dashboard")
  return { success: true }
}
