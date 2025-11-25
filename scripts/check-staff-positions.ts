import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStaffPositions() {
  console.log('Checking staff positions in database...\n');

  // Get a few specific examples
  const examples = await prisma.mLEPlayer.findMany({
    where: {
      name: {
        in: ['B++', 'R E D', 'ChaosSpike', 'C0P3x', 'Haimgame']
      }
    },
    select: {
      id: true,
      name: true,
      staffPosition: true,
      teamId: true,
    }
  });

  console.log('Sample players:');
  console.table(examples);

  // Count total with staff positions
  const count = await prisma.mLEPlayer.count({
    where: {
      staffPosition: {
        not: null
      }
    }
  });

  console.log(`\nTotal players with staff positions: ${count}`);

  await prisma.$disconnect();
}

checkStaffPositions()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
