
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  console.log('Seeding test data...');

  const hashedPassword = await bcrypt.hash('123456', 10);

  // Create a regular user
  const user = await prisma.user.create({
    data: {
      email: 'usuario_prueba@test.com',
      name: 'Usuario Prueba',
      password: hashedPassword,
      role: 'USER',
      plan: 'PREMIUM',
      active: true,
      subscriptionEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  });

  console.log('Created user:', user.email);

  // Create a business card for them
  const card = await prisma.businessCard.create({
    data: {
      userId: user.id,
      slug: 'prueba-card',
      title: 'Mi Negocio de Prueba',
      description: 'Esta es una tarjeta de prueba',
      active: true,
    },
  });

  console.log('Created card:', card.slug);

  // Create a subscription
  const sub = await prisma.subscription.create({
    data: {
      userId: user.id,
      amount: 299.00,
      currency: 'MXN',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  });

  console.log('Created subscription:', sub.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
