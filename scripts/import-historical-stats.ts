import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

interface CSVRow {
  name: string;
  member_id: string;
  gamemode: string;
  skill_group: string;
  team_name: string;
  season: string;
  games_played: string;
  sprocket_rating: string;
  dpi_per_game: string;
  opi_per_game: string;
  avg_score: string;
  goals_per_game: string;
  total_goals: string;
  saves_per_game: string;
  total_saves: string;
  shots_per_game: string;
  total_shots: string;
  assists_per_game: string;
  total_assists: string;
  avg_goals_against: string;
  total_goals_against: string;
  avg_shots_against: string;
  total_shots_against: string;
  avg_demos_inflicted: string;
  total_demos_inflicted: string;
  avg_demos_taken: string;
  total_demos_taken: string;
}

async function importHistoricalStats() {
  console.log('Starting import of historical player stats...');

  // Read the CSV file
  const csvPath = path.join(__dirname, '..', 'data', 'csv', 'historicalAggregatedPlayerStats.csv');
  let csvContent = fs.readFileSync(csvPath, 'utf-8');

  // Remove quotes from all lines if present
  const lines = csvContent.split('\n');
  const cleanedLines = lines.map(line => {
    line = line.trim();
    if (line.startsWith('"') && line.endsWith('"')) {
      return line.slice(1, -1);
    }
    return line;
  });
  csvContent = cleanedLines.join('\n');

  // Parse CSV
  const records: CSVRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });

  console.log(`Found ${records.length} rows in CSV`);

  // Debug: print first record
  if (records.length > 0) {
    console.log('First record:', JSON.stringify(records[0], null, 2));
  }

  // Group by player, season, and gamemode to aggregate if a player played for multiple teams in one season
  const aggregatedStats = new Map<string, {
    playerId: string;
    playerName: string;
    season: string;
    gamemode: string;
    skillGroup: string;
    gamesPlayed: number;
    totalGoals: number;
    totalSaves: number;
    totalShots: number;
    totalAssists: number;
    totalGoalsAgainst: number;
    totalShotsAgainst: number;
    totalDemosInflicted: number;
    totalDemosTaken: number;
    totalSprocketRating: number;
    totalAvgScore: number;
  }>();

  // Process each row
  for (const row of records) {
    const playerId = row.member_id?.trim();
    const season = row.season?.trim();
    const gamemode = row.gamemode?.trim();

    // Skip rows with missing critical data
    if (!playerId || !season || !gamemode) {
      console.warn('Skipping row with missing data:', row);
      continue;
    }

    const key = `${playerId}-${season}-${gamemode}`;

    if (aggregatedStats.has(key)) {
      // Aggregate stats if player played for multiple teams in same season/gamemode
      const existing = aggregatedStats.get(key)!;
      const gamesPlayed = parseInt(row.games_played) || 0;
      existing.gamesPlayed += gamesPlayed;
      existing.totalGoals += parseInt(row.total_goals) || 0;
      existing.totalSaves += parseInt(row.total_saves) || 0;
      existing.totalShots += parseInt(row.total_shots) || 0;
      existing.totalAssists += parseInt(row.total_assists) || 0;
      existing.totalGoalsAgainst += parseInt(row.total_goals_against) || 0;
      existing.totalShotsAgainst += parseInt(row.total_shots_against) || 0;
      existing.totalDemosInflicted += parseInt(row.total_demos_inflicted) || 0;
      existing.totalDemosTaken += parseInt(row.total_demos_taken) || 0;
      existing.totalSprocketRating += (parseFloat(row.sprocket_rating) || 0) * gamesPlayed;
      existing.totalAvgScore += (parseFloat(row.avg_score) || 0) * gamesPlayed;
    } else {
      // Create new entry
      const gamesPlayed = parseInt(row.games_played) || 0;
      aggregatedStats.set(key, {
        playerId,
        playerName: row.name?.trim() || '',
        season,
        gamemode,
        skillGroup: row.skill_group?.trim() || '',
        gamesPlayed,
        totalGoals: parseInt(row.total_goals) || 0,
        totalSaves: parseInt(row.total_saves) || 0,
        totalShots: parseInt(row.total_shots) || 0,
        totalAssists: parseInt(row.total_assists) || 0,
        totalGoalsAgainst: parseInt(row.total_goals_against) || 0,
        totalShotsAgainst: parseInt(row.total_shots_against) || 0,
        totalDemosInflicted: parseInt(row.total_demos_inflicted) || 0,
        totalDemosTaken: parseInt(row.total_demos_taken) || 0,
        totalSprocketRating: (parseFloat(row.sprocket_rating) || 0) * gamesPlayed,
        totalAvgScore: (parseFloat(row.avg_score) || 0) * gamesPlayed,
      });
    }
  }

  console.log(`Aggregated to ${aggregatedStats.size} unique player-season-gamemode combinations`);

  // Clear existing historical stats
  console.log('Clearing existing historical stats...');
  await prisma.playerHistoricalStats.deleteMany({});

  // Import the aggregated stats
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const [key, stats] of aggregatedStats.entries()) {
    try {
      // Check if player exists in database
      const player = await prisma.mLEPlayer.findUnique({
        where: { id: stats.playerId },
      });

      if (!player) {
        console.warn(`Player not found: ${stats.playerName} (ID: ${stats.playerId})`);
        skipped++;
        continue;
      }

      // Calculate averages
      const sprocketRating = stats.totalSprocketRating / stats.gamesPlayed;
      const avgScore = stats.totalAvgScore / stats.gamesPlayed;
      const goalsPerGame = stats.totalGoals / stats.gamesPlayed;
      const savesPerGame = stats.totalSaves / stats.gamesPlayed;
      const shotsPerGame = stats.totalShots / stats.gamesPlayed;
      const assistsPerGame = stats.totalAssists / stats.gamesPlayed;
      const avgGoalsAgainst = stats.totalGoalsAgainst / stats.gamesPlayed;
      const avgShotsAgainst = stats.totalShotsAgainst / stats.gamesPlayed;
      const avgDemosInflicted = stats.totalDemosInflicted / stats.gamesPlayed;
      const avgDemosTaken = stats.totalDemosTaken / stats.gamesPlayed;

      // Create historical stats entry
      await prisma.playerHistoricalStats.create({
        data: {
          playerId: stats.playerId,
          season: stats.season,
          gamemode: stats.gamemode,
          skillGroup: stats.skillGroup,
          gamesPlayed: stats.gamesPlayed,
          sprocketRating,
          avgScore,
          goalsPerGame,
          totalGoals: stats.totalGoals,
          savesPerGame,
          totalSaves: stats.totalSaves,
          shotsPerGame,
          totalShots: stats.totalShots,
          assistsPerGame,
          totalAssists: stats.totalAssists,
          avgGoalsAgainst,
          totalGoalsAgainst: stats.totalGoalsAgainst,
          avgShotsAgainst,
          totalShotsAgainst: stats.totalShotsAgainst,
          avgDemosInflicted,
          totalDemosInflicted: stats.totalDemosInflicted,
          avgDemosTaken,
          totalDemosTaken: stats.totalDemosTaken,
        },
      });

      imported++;

      if (imported % 100 === 0) {
        console.log(`Imported ${imported} records...`);
      }
    } catch (error) {
      console.error(`Error importing stats for ${stats.playerName} (${key}):`, error);
      errors++;
    }
  }

  console.log('\nImport complete!');
  console.log(`- Imported: ${imported}`);
  console.log(`- Skipped (player not found): ${skipped}`);
  console.log(`- Errors: ${errors}`);

  await prisma.$disconnect();
}

importHistoricalStats()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
