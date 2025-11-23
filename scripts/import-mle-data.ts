import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting data import to Digital Ocean...\n');

    // Import MLELeague first (it's referenced by MLETeam)
    console.log('Importing MLELeague...');
    const mleLeaguesData = JSON.parse(
      readFileSync(join(process.cwd(), 'exports', 'MLELeague.json'), 'utf-8')
    );

    for (const league of mleLeaguesData) {
      await prisma.mLELeague.upsert({
        where: { id: league.id },
        update: league,
        create: league,
      });
    }
    console.log(`✅ Imported ${mleLeaguesData.length} MLE Leagues`);

    // Import MLETeam
    console.log('Importing MLETeam...');
    const mleTeamsData = JSON.parse(
      readFileSync(join(process.cwd(), 'exports', 'MLETeam.json'), 'utf-8')
    );

    for (const team of mleTeamsData) {
      await prisma.mLETeam.upsert({
        where: { id: team.id },
        update: team,
        create: team,
      });
    }
    console.log(`✅ Imported ${mleTeamsData.length} MLE Teams`);

    // Import MLEPlayer
    console.log('Importing MLEPlayer...');
    const mlePlayersData = JSON.parse(
      readFileSync(join(process.cwd(), 'exports', 'MLEPlayer.json'), 'utf-8')
    );

    for (const player of mlePlayersData) {
      await prisma.mLEPlayer.upsert({
        where: { id: player.id },
        update: player,
        create: player,
      });
    }
    console.log(`✅ Imported ${mlePlayersData.length} MLE Players`);

    console.log('\n📦 All MLE data imported successfully to Digital Ocean!');
    console.log('\nImported:');
    console.log(`  - ${mleLeaguesData.length} MLE Leagues`);
    console.log(`  - ${mleTeamsData.length} MLE Teams`);
    console.log(`  - ${mlePlayersData.length} MLE Players`);

  } catch (error) {
    console.error('❌ Error importing data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
