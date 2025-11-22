import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting data export...\n');

    // Export MLETeam
    console.log('Exporting MLETeam...');
    const mleTeams = await prisma.mLETeam.findMany();
    writeFileSync(
      join(process.cwd(), 'exports', 'MLETeam.json'),
      JSON.stringify(mleTeams, null, 2)
    );
    console.log(`✅ Exported ${mleTeams.length} MLE Teams`);

    // Export MLEPlayer
    console.log('Exporting MLEPlayer...');
    const mlePlayers = await prisma.mLEPlayer.findMany();
    writeFileSync(
      join(process.cwd(), 'exports', 'MLEPlayer.json'),
      JSON.stringify(mlePlayers, null, 2)
    );
    console.log(`✅ Exported ${mlePlayers.length} MLE Players`);

    // Export PlayerHistoricalStats
    console.log('Exporting PlayerHistoricalStats...');
    const playerStats = await prisma.playerHistoricalStats.findMany();
    writeFileSync(
      join(process.cwd(), 'exports', 'PlayerHistoricalStats.json'),
      JSON.stringify(playerStats, null, 2)
    );
    console.log(`✅ Exported ${playerStats.length} Player Historical Stats`);

    console.log('\n📦 All data exported successfully to ./exports/ folder!');
    console.log('\nFiles created:');
    console.log('  - exports/MLETeam.json');
    console.log('  - exports/MLEPlayer.json');
    console.log('  - exports/PlayerHistoricalStats.json');

  } catch (error) {
    console.error('❌ Error exporting data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
