import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyStaffPositions() {
  console.log('Verifying staff positions...\n');

  // Find all players with staff positions
  const staffMembers = await prisma.mLEPlayer.findMany({
    where: {
      staffPosition: {
        not: null,
      },
    },
    orderBy: {
      staffPosition: 'asc',
    },
    select: {
      name: true,
      staffPosition: true,
      team: {
        select: {
          name: true,
          league: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  console.log(`Found ${staffMembers.length} players with staff positions:\n`);

  // Group by staff position
  const grouped: { [key: string]: typeof staffMembers } = {};

  staffMembers.forEach((member) => {
    const position = member.staffPosition || 'Unknown';
    if (!grouped[position]) {
      grouped[position] = [];
    }
    grouped[position].push(member);
  });

  // Display results grouped by position
  Object.keys(grouped).sort().forEach((position) => {
    console.log(`\n${position} (${grouped[position].length}):`);
    console.log('─'.repeat(60));
    grouped[position].forEach((member) => {
      const teamInfo = member.team
        ? `${member.team.league.name} - ${member.team.name}`
        : 'Free Agent';
      console.log(`  ${member.name.padEnd(30)} | ${teamInfo}`);
    });
  });

  await prisma.$disconnect();
}

verifyStaffPositions()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
