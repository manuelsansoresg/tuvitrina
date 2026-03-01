import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// Initialize adapter
const connectionString = process.env.POSTGRES_PRISMA_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "manuelsansoresg@gmail.com";
  const password = "demor00txx";
  const name = "Manuel Sansores";

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`User ${email} already exists.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Set subscription end date to 1 year from now
  const subscriptionEnd = new Date();
  subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: "ADMIN",
      subscriptionEnd,
      businessCard: {
        create: {
          slug: "manuel-sansores",
          title: name,
          description: "Desarrollador Fullstack & Admin de TuVitrina",
          themeColor: "#0F172A",
          active: true,
          logoUrl: "", // Optional
        },
      },
    },
  });

  console.log(`User created: ${user.email} with role ${user.role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
