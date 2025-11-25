import { prisma } from '@/lib/prisma';

async function checkTeamNames() {
  console.log('Checking team name formats...\n');

  // Get teams from different leagues
  const teams = await prisma.mLETeam.findMany({
    select: {
      id: true,
      name: true,
      leagueId: true,
    },
    take: 20,
  });

  console.log('Sample team names:');
  console.table(teams);

  // Check how many teams have league prefix in their name
  const teamsWithPrefix = teams.filter(t =>
    /^(PL|ML|CL|AL|FL)\s+/.test(t.name)
  );

  const teamsWithoutPrefix = teams.filter(t =>
    !/^(PL|ML|CL|AL|FL)\s+/.test(t.name)
  );

  console.log(`\nTeams WITH league prefix in name: ${teamsWithPrefix.length}`);
  console.log(`Teams WITHOUT league prefix in name: ${teamsWithoutPrefix.length}`);

  if (teamsWithPrefix.length > 0) {
    console.log('\nExample WITH prefix:', teamsWithPrefix[0]);
  }
  if (teamsWithoutPrefix.length > 0) {
    console.log('Example WITHOUT prefix:', teamsWithoutPrefix[0]);
  }

  await prisma.$disconnect();
}

checkTeamNames()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
