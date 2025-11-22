import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Seeding sample transactions...');

    // Get a fantasy league and team to use for samples
    const league = await prisma.fantasyLeague.findFirst({
      include: {
        fantasyTeams: {
          include: {
            owner: true,
          },
          take: 2,
        },
      },
    });

    if (!league || league.fantasyTeams.length === 0) {
      console.log('No leagues or teams found. Please create a league and team first.');
      return;
    }

    const team = league.fantasyTeams[0];
    const team2 = league.fantasyTeams[1] || team;

    console.log(`Using league: ${league.name}, team: ${team.displayName}`);

    // Get some MLE teams from the database
    const mleTeams = await prisma.mLETeam.findMany({ take: 10 });

    if (mleTeams.length < 4) {
      console.log('Not enough MLE teams found. Please seed MLE teams first.');
      return;
    }

    // Create sample waiver transactions
    const waiverTransaction1 = await prisma.transaction.create({
      data: {
        fantasyLeagueId: league.id,
        fantasyTeamId: team.id,
        userId: team.ownerUserId,
        type: 'waiver',
        addTeamId: mleTeams[0].id,
        dropTeamId: mleTeams[1].id,
        faabBid: 25,
        status: 'approved',
        processedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    });

    const waiverTransaction2 = await prisma.transaction.create({
      data: {
        fantasyLeagueId: league.id,
        fantasyTeamId: team.id,
        userId: team.ownerUserId,
        type: 'waiver',
        addTeamId: mleTeams[2].id,
        dropTeamId: mleTeams[3].id,
        faabBid: 15,
        status: 'denied',
        reason: 'Lower priority',
        processedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    });

    // Create sample trade transaction
    const tradeTransaction = await prisma.transaction.create({
      data: {
        fantasyLeagueId: league.id,
        fantasyTeamId: team.id,
        userId: team.ownerUserId,
        type: 'trade',
        addTeamId: mleTeams[4].id,
        dropTeamId: mleTeams[5].id,
        tradePartnerTeamId: team2.id,
        tradePartnerGave: [mleTeams[4].id],
        status: 'approved',
        processedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    });

    // Create sample pickup transaction
    const pickupTransaction = await prisma.transaction.create({
      data: {
        fantasyLeagueId: league.id,
        fantasyTeamId: team.id,
        userId: team.ownerUserId,
        type: 'pickup',
        addTeamId: mleTeams[6].id,
        status: 'approved',
        processedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      },
    });

    // Create sample drop transaction
    const dropTransaction = await prisma.transaction.create({
      data: {
        fantasyLeagueId: league.id,
        fantasyTeamId: team.id,
        userId: team.ownerUserId,
        type: 'drop',
        dropTeamId: mleTeams[7].id,
        status: 'approved',
        processedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
    });

    console.log('✅ Sample transactions created successfully!');
    console.log(`Created ${5} transactions for team "${team.displayName}"`);
    console.log('\nTransaction IDs:');
    console.log(`- Waiver (approved): ${waiverTransaction1.id}`);
    console.log(`- Waiver (denied): ${waiverTransaction2.id}`);
    console.log(`- Trade: ${tradeTransaction.id}`);
    console.log(`- Pickup: ${pickupTransaction.id}`);
    console.log(`- Drop: ${dropTransaction.id}`);

  } catch (error) {
    console.error('Error seeding transactions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
