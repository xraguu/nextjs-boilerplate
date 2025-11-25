import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyFranchiseData() {
  console.log('Verifying franchise data...\n');

  // Get all unique franchises
  const allPlayers = await prisma.mLEPlayer.findMany({
    where: {
      franchise: {
        not: null,
      },
    },
    select: {
      franchise: true,
    },
  });

  const uniqueFranchises = [...new Set(allPlayers.map(p => p.franchise))].sort();
  console.log(`Found ${uniqueFranchises.length} unique franchises:`);
  console.log(uniqueFranchises.join(', '));
  console.log();

  // Show staff members with franchises (managers not on teams)
  const staffWithFranchise = await prisma.mLEPlayer.findMany({
    where: {
      staffPosition: {
        not: null,
      },
    },
    select: {
      name: true,
      franchise: true,
      staffPosition: true,
      teamId: true,
      team: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      franchise: 'asc',
    },
    take: 20,
  });

  console.log('Sample staff members with franchise data:');
  console.log('─'.repeat(80));
  console.table(
    staffWithFranchise.map(s => ({
      Name: s.name,
      Franchise: s.franchise,
      Position: s.staffPosition,
      Team: s.team?.name || 'Free Agent',
    }))
  );

  // Count players by franchise
  const franchiseCounts: { [key: string]: number } = {};
  allPlayers.forEach(p => {
    if (p.franchise) {
      franchiseCounts[p.franchise] = (franchiseCounts[p.franchise] || 0) + 1;
    }
  });

  console.log('\nPlayers per franchise:');
  console.log('─'.repeat(80));
  Object.entries(franchiseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([franchise, count]) => {
      console.log(`${franchise.padEnd(20)} ${count} players`);
    });

  await prisma.$disconnect();
}

verifyFranchiseData()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
