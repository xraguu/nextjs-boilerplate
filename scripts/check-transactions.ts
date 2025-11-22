import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.transaction.count();
    console.log(`\n✅ Transaction count: ${count}`);

    if (count > 0) {
      const transactions = await prisma.transaction.findMany({
        take: 5,
        orderBy: { processedAt: 'desc' },
        include: {
          fantasyTeam: { select: { displayName: true } },
          user: { select: { displayName: true } },
          league: { select: { name: true } },
        },
      });

      console.log('\n📋 Sample transactions:\n');
      transactions.forEach((t, i) => {
        console.log(`${i + 1}. ${t.type.toUpperCase()} - ${t.fantasyTeam.displayName}`);
        console.log(`   League: ${t.league.name}`);
        console.log(`   Status: ${t.status}`);
        console.log(`   Processed: ${t.processedAt.toISOString()}`);
        if (t.addTeamId) console.log(`   Added: ${t.addTeamId}`);
        if (t.dropTeamId) console.log(`   Dropped: ${t.dropTeamId}`);
        if (t.faabBid) console.log(`   FAAB Bid: $${t.faabBid}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No transactions found - may need to run seed script');
    }
  } catch (error) {
    console.error('Error checking transactions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
