"use server"

import { prisma } from "@/lib/prisma"

import { MercadoPagoConfig, Preference } from 'mercadopago';
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN! });

export async function createSubscriptionPreference(planName: string, price: number) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const preference = new Preference(client);

  try {
    const result = await preference.create({
      body: {
        items: [
          {
            id: `plan-${planName.toLowerCase()}`,
            title: `Plan ${planName} - TuVitrina`,
            quantity: 1,
            unit_price: price,
            currency_id: 'MXN',
          }
        ],
        payer: {
          email: session.user.email!,
        },
        back_urls: {
          success: `${process.env.NEXTAUTH_URL}/dashboard?payment=success`,
          failure: `${process.env.NEXTAUTH_URL}/?payment=failure`,
          pending: `${process.env.NEXTAUTH_URL}/?payment=pending`,
        },
        auto_return: 'approved',
        metadata: {
          user_id: session.user.id,
          plan: planName.toUpperCase(), // 'EXPRESS', 'EMPRENDEDOR', 'PREMIUM'
        },
        notification_url: `${process.env.NEXTAUTH_URL}/api/webhooks/mercadopago`,
      }
    });

    return { init_point: result.init_point };
  } catch (error) {
    console.error("Error creating preference:", error);
    return { error: "Error al procesar el pago" };
  }
}

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
