import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME || "Administrador TuVitrina";

  if (!email) {
    throw new Error(
      "Falta la variable de entorno SEED_ADMIN_EMAIL"
    );
  }

  if (!password) {
    throw new Error(
      "Falta la variable de entorno SEED_ADMIN_PASSWORD"
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    console.log(`El usuario ${email} ya existe.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const subscriptionEnd = new Date();
  subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: "ADMIN",
      plan: "PREMIUM",
      active: true,
      subscriptionEnd,

      businessCard: {
        create: {
          slug: "admin-tuvitrina",
          title: name,
          description: "Administrador de TuVitrina",
          themeColor: "#0F172A",
          active: true,
          logoUrl: "",
          cardBackgroundColor: "#ffffff",
          titleColor: "#0f172a",
          descriptionColor: "#64748b",
          galleryTitleColor: "#ffffff",
          galleryPriceColor: "#4ade80",
          linkTextColor: "#0f172a",
          linkBackgroundColor: "#ffffff",
          linkBorderColor: "#e2e8f0",
        },
      },

      subscriptions: {
        create: {
          amount: 0,
          currency: "MXN",
          status: "active",
          startDate: new Date(),
          endDate: subscriptionEnd,
        },
      },
    },

    include: {
      businessCard: true,
      subscriptions: true,
    },
  });

  console.log("Seed completado correctamente.");
  console.log(`Usuario creado: ${user.email}`);
  console.log(`Rol: ${user.role}`);
  console.log(`Plan: ${user.plan}`);
}

main()
  .catch((error) => {
    console.error("Error ejecutando el seed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });