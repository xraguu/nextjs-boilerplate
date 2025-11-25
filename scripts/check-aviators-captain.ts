import { prisma } from '@/lib/prisma';

async function checkAviatorsCaptain() {
  console.log('Checking for Aviators captains...\n');

  // Check all Aviators teams
  const aviatorsTeams = await prisma.mLETeam.findMany({
    where: {
      name: 'Aviators',
    },
    select: {
      id: true,
      name: true,
      leagueId: true,
    },
  });

  console.log('Aviators teams:');
  console.table(aviatorsTeams);

  // Check for captains for each team
  for (const team of aviatorsTeams) {
    const captain = await prisma.mLEPlayer.findFirst({
      where: {
        teamId: team.id,
        staffPosition: 'Captain',
      },
      select: {
        name: true,
        teamId: true,
        staffPosition: true,
      },
    });

    console.log(`\nCaptain for ${team.leagueId} ${team.name} (${team.id}):`, captain || 'Not found');
  }

  // Check all players assigned to Aviators teams
  console.log('\n' + '='.repeat(80));
  console.log('All staff on any Aviators team:');

  const aviatorPlayers = await prisma.mLEPlayer.findMany({
    where: {
      teamId: {
        in: aviatorsTeams.map(t => t.id),
      },
      staffPosition: {
        not: null,
      },
    },
    select: {
      name: true,
      teamId: true,
      staffPosition: true,
    },
  });

  console.table(aviatorPlayers);

  await prisma.$disconnect();
}

checkAviatorsCaptain()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
