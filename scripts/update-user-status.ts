import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Update all users to have status = "active"
  const result = await prisma.user.updateMany({
    data: {
      status: 'active'
    }
  });

  console.log(`Updated ${result.count} users to active status`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
