
import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { PlanType } from "@prisma/client";

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN! });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (type === "payment") {
      const payment = new Payment(client);
      const paymentInfo = await payment.get({ id: data.id });

      if (paymentInfo.status === "approved") {
        const metadata = paymentInfo.metadata;
        const userId = metadata.user_id;
        const plan = metadata.plan;

        if (userId && plan) {
          // Calculate subscription end date (e.g., 1 year from now)
          const startDate = new Date();
          const endDate = new Date();
          endDate.setFullYear(endDate.getFullYear() + 1); // 1 year subscription

          // Update user plan and subscription
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: plan as PlanType, // Ensure this matches your Prisma Enum
              subscriptionEnd: endDate,
            },
          });
          
          // Create subscription record
          await prisma.subscription.create({
            data: {
              userId: userId,
              amount: paymentInfo.transaction_amount || 0,
              currency: paymentInfo.currency_id || 'MXN',
              status: 'active',
              startDate: startDate,
              endDate: endDate,
              paymentId: data.id,
            }
          });

          console.log(`User ${userId} upgraded to ${plan}`);
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
