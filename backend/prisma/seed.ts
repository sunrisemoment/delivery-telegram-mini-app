import { PrismaClient, PaymentMethod, PaymentStatus, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.product.createMany({
    data: [
      {
        name: "Fresh Produce Box",
        description: "Weekly mix of local fruits and vegetables",
        price: "35.00",
        imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e",
      },
      {
        name: "Household Essentials",
        description: "Basic cleaning and home supplies",
        price: "24.99",
        imageUrl: "https://images.unsplash.com/photo-1583947582886-f40ec95dd752",
      },
      {
        name: "Quick Meal Kit",
        description: "Ingredients for a 20-minute dinner",
        price: "19.50",
        imageUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.driver.createMany({
    data: [
      { name: "Malik Thompson", phone: "+1-404-555-0101", isActive: true },
      { name: "Jordan Reed", phone: "+1-404-555-0112", isActive: true },
    ],
    skipDuplicates: true,
  });

  const defaultUser = await prisma.user.upsert({
    where: { telegramId: BigInt(999000111) },
    update: {},
    create: {
      telegramId: BigInt(999000111),
      firstName: "Demo",
      lastName: "Customer",
      phoneNumber: "+1-404-555-0199",
    },
  });

  const defaultAddress = await prisma.address.upsert({
    where: { id: "11111111-1111-1111-1111-111111111111" },
    update: {
      userId: defaultUser.id,
      isDefault: true,
    },
    create: {
      id: "11111111-1111-1111-1111-111111111111",
      userId: defaultUser.id,
      addressLine1: "123 Peachtree St NE",
      city: "Atlanta",
      state: "GA",
      zipCode: "30303",
      isDefault: true,
    },
  });

  const existingOrder = await prisma.order.findFirst({
    where: { orderNumber: "ATL-100001" },
  });

  if (!existingOrder) {
    const product = await prisma.product.findFirst();
    if (product) {
      await prisma.order.create({
        data: {
          userId: defaultUser.id,
          addressId: defaultAddress.id,
          orderNumber: "ATL-100001",
          totalAmount: "35.00",
          paymentMethod: PaymentMethod.cod,
          paymentStatus: PaymentStatus.pending,
          orderStatus: OrderStatus.pending,
          items: {
            create: [
              {
                productId: product.id,
                quantity: 1,
                price: product.price,
              },
            ],
          },
          events: {
            create: [
              {
                eventType: "ORDER_CREATED",
                actorType: "customer",
                actorId: defaultUser.id,
              },
            ],
          },
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
