import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting data import...\n');

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

    // Import PlayerHistoricalStats
    console.log('Importing PlayerHistoricalStats...');
    const playerStatsData = JSON.parse(
      readFileSync(join(process.cwd(), 'exports', 'PlayerHistoricalStats.json'), 'utf-8')
    );

    for (const stats of playerStatsData) {
      await prisma.playerHistoricalStats.upsert({
        where: { id: stats.id },
        update: stats,
        create: stats,
      });
    }
    console.log(`✅ Imported ${playerStatsData.length} Player Historical Stats`);

    console.log('\n📦 All data imported successfully!');

  } catch (error) {
    console.error('❌ Error importing data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
