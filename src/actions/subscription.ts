"use server"

import { prisma } from "@/lib/prisma"

export async function checkSubscriptionStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { businessCard: true }
  })

  if (!user) return { error: "User not found" }
  
  // If no subscription end date, assume inactive or free tier depending on logic
  // Here we assume it's required for active status
  if (!user.subscriptionEnd) {
     if (user.businessCard?.active) {
       await prisma.businessCard.update({
         where: { userId },
         data: { active: false }
       })
     }
     return { status: "inactive" }
  }

  if (new Date() > user.subscriptionEnd) {
    // Subscription expired
    if (user.businessCard?.active) {
      await prisma.businessCard.update({
        where: { userId },
        data: { active: false }
      })
    }
    return { status: "expired" }
  }
  
  return { status: "active" }
}

export async function checkAllSubscriptions() {
  const expiredUsers = await prisma.user.findMany({
    where: {
      subscriptionEnd: {
        lt: new Date()
      },
      businessCard: {
        active: true
      }
    }
  })

  let count = 0;
  for (const user of expiredUsers) {
    await prisma.businessCard.update({
      where: { userId: user.id },
      data: { active: false }
    })
    count++;
  }
  
  return { processed: count }
}
