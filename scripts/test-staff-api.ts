import { prisma } from '@/lib/prisma';

async function testStaffAPI() {
  console.log('Testing staff API logic...\n');

  // Get a sample team
  const sampleTeam = await prisma.mLETeam.findFirst({
    select: {
      id: true,
      name: true,
      leagueId: true,
    },
  });

  if (!sampleTeam) {
    console.log('No teams found in database');
    return;
  }

  console.log('Testing with team:', sampleTeam);
  console.log('─'.repeat(80));

  // Extract franchise name (same logic as API)
  const franchiseName = sampleTeam.name.replace(/^(PL|ML|CL|AL|FL)\s+/, '');
  console.log(`\nExtracted franchise name: "${franchiseName}"`);

  // Find Franchise Manager
  const franchiseManager = await prisma.mLEPlayer.findFirst({
    where: {
      franchise: franchiseName,
      staffPosition: "Franchise Manager",
    },
    select: {
      id: true,
      name: true,
      franchise: true,
      staffPosition: true,
    },
  });

  console.log('\nFranchise Manager:', franchiseManager || 'Not found');

  // Find General Manager
  const generalManager = await prisma.mLEPlayer.findFirst({
    where: {
      franchise: franchiseName,
      staffPosition: "General Manager",
    },
    select: {
      id: true,
      name: true,
      franchise: true,
      staffPosition: true,
    },
  });

  console.log('General Manager:', generalManager || 'Not found');

  // Find Captain
  const captain = await prisma.mLEPlayer.findFirst({
    where: {
      teamId: sampleTeam.id,
      staffPosition: "Captain",
    },
    select: {
      id: true,
      name: true,
      teamId: true,
      franchise: true,
      staffPosition: true,
    },
  });

  console.log('Captain:', captain || 'Not found');

  // Check what franchises exist in the database
  console.log('\n' + '─'.repeat(80));
  console.log('Checking all franchises with staff positions...\n');

  const allStaff = await prisma.mLEPlayer.findMany({
    where: {
      staffPosition: {
        in: ['Franchise Manager', 'General Manager', 'Captain'],
      },
    },
    select: {
      name: true,
      franchise: true,
      staffPosition: true,
      teamId: true,
    },
    take: 10,
  });

  console.log('Sample staff members:');
  console.table(allStaff);

  await prisma.$disconnect();
}

testStaffAPI()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
