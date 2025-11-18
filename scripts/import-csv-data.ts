/**
 * CSV Import Script for MLE Fantasy Platform
 *
 * This script imports data from MLE CSV files into the database.
 * Run with: npx tsx scripts/import-csv-data.ts
 */

import { PrismaClient } from "@/lib/generated/prisma";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

const prisma = new PrismaClient();

// CSV file paths (relative to project root)
const CSV_DIR = path.join(process.cwd(), "data", "csv");

interface TeamRow {
  id: string;
  name: string;
  league: string;
  slug: string;
  logoPath: string;
  primaryColor: string;
  secondaryColor: string;
  colorHex: string;
  colorHexTwo?: string;
}

interface PlayerRow {
  id: string;
  name: string;
  teamId?: string;
}

interface FixtureRow {
  id: string;
  date: string;
}

interface MatchRow {
  id: string;
  fixtureId: string;
  roundId: string;
  matchGroupId: string;
  homeTeamId: string;
  awayTeamId: string;
  scheduledDate: string;
}

interface RoleUsageRow {
  playerId: string;
  role: string;
  gamesPlayed: string;
}

interface PlayerStatsRow {
  playerId: string;
  matchId: string;
  goals: string;
  shots: string;
  saves: string;
  assists: string;
  demosInflicted: string;
  demosTaken: string;
  sprocketRating: string;
}

interface HistoricalStatsRow {
  playerId: string;
  totalGoals: string;
  totalShots: string;
  totalSaves: string;
  totalAssists: string;
  totalDemos: string;
  avgSR: string;
  gamesPlayed: string;
}

function readCSV<T>(filename: string): T[] {
  const filepath = path.join(CSV_DIR, filename);

  if (!fs.existsSync(filepath)) {
    console.warn(`⚠️  CSV file not found: ${filename}`);
    return [];
  }

  const fileContent = fs.readFileSync(filepath, "utf-8");
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return records as T[];
}

async function importLeaguesAndTeams() {
  console.log("\n📊 Importing Leagues and Teams...");

  const teams = readCSV<TeamRow>("teams.csv");

  if (teams.length === 0) {
    console.warn("⚠️  No teams data found");
    return;
  }

  // Extract unique leagues
  const leaguesMap = new Map<string, { name: string; colorHex: string; colorHexTwo?: string }>();

  teams.forEach((team) => {
    if (!leaguesMap.has(team.league)) {
      leaguesMap.set(team.league, {
        name: team.league,
        colorHex: team.colorHex || "#FFFFFF",
        colorHexTwo: team.colorHexTwo,
      });
    }
  });

  // Import leagues
  for (const [leagueId, leagueData] of leaguesMap) {
    await prisma.mLELeague.upsert({
      where: { id: leagueId },
      update: leagueData,
      create: {
        id: leagueId,
        ...leagueData,
      },
    });
  }

  console.log(`✅ Imported ${leaguesMap.size} leagues`);

  // Import teams
  let teamCount = 0;
  for (const team of teams) {
    await prisma.mLETeam.upsert({
      where: { id: team.id },
      update: {
        name: team.name,
        leagueId: team.league,
        slug: team.slug,
        logoPath: team.logoPath || "",
        primaryColor: team.primaryColor || "#FFFFFF",
        secondaryColor: team.secondaryColor || "#000000",
      },
      create: {
        id: team.id,
        name: team.name,
        leagueId: team.league,
        slug: team.slug,
        logoPath: team.logoPath || "",
        primaryColor: team.primaryColor || "#FFFFFF",
        secondaryColor: team.secondaryColor || "#000000",
      },
    });
    teamCount++;
  }

  console.log(`✅ Imported ${teamCount} teams`);
}

async function importPlayers() {
  console.log("\n👥 Importing Players...");

  const players = readCSV<PlayerRow>("players.csv");

  if (players.length === 0) {
    console.warn("⚠️  No players data found");
    return;
  }

  let count = 0;
  for (const player of players) {
    await prisma.mLEPlayer.upsert({
      where: { id: player.id },
      update: {
        name: player.name,
        teamId: player.teamId || null,
      },
      create: {
        id: player.id,
        name: player.name,
        teamId: player.teamId || null,
      },
    });
    count++;
  }

  console.log(`✅ Imported ${count} players`);
}

async function importFixtures() {
  console.log("\n📅 Importing Fixtures...");

  const fixtures = readCSV<FixtureRow>("fixtures.csv");

  if (fixtures.length === 0) {
    console.warn("⚠️  No fixtures data found");
    return;
  }

  let count = 0;
  for (const fixture of fixtures) {
    await prisma.fixture.upsert({
      where: { id: fixture.id },
      update: {
        date: new Date(fixture.date),
      },
      create: {
        id: fixture.id,
        date: new Date(fixture.date),
      },
    });
    count++;
  }

  console.log(`✅ Imported ${count} fixtures`);
}

async function importMatches() {
  console.log("\n⚽ Importing Matches...");

  const matches = readCSV<MatchRow>("matches.csv");

  if (matches.length === 0) {
    console.warn("⚠️  No matches data found");
    return;
  }

  // Helper function to calculate fantasy week from date
  // Assumes each week is 7 days and starts from a base date
  const calculateWeek = (date: Date): number => {
    // TODO: This should be calculated based on season settings weekDates
    // For now, return a default week calculation
    const seasonStart = new Date("2025-01-01"); // Adjust this
    const daysDiff = Math.floor((date.getTime() - seasonStart.getTime()) / (1000 * 60 * 60 * 24));
    const week = Math.floor(daysDiff / 7) + 1;
    return Math.min(Math.max(week, 1), 10); // Clamp between 1-10
  };

  let count = 0;
  for (const match of matches) {
    const scheduledDate = new Date(match.scheduledDate);
    const week = calculateWeek(scheduledDate);

    await prisma.match.upsert({
      where: { id: match.id },
      update: {
        fixtureId: match.fixtureId,
        roundId: match.roundId,
        matchGroupId: match.matchGroupId,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        scheduledDate,
        week,
      },
      create: {
        id: match.id,
        fixtureId: match.fixtureId,
        roundId: match.roundId,
        matchGroupId: match.matchGroupId,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        scheduledDate,
        week,
        completed: false,
      },
    });
    count++;
  }

  console.log(`✅ Imported ${count} matches`);
}

async function importRoleUsages() {
  console.log("\n🎯 Importing Role Usages...");

  const roleUsages = readCSV<RoleUsageRow>("role_usages.csv");

  if (roleUsages.length === 0) {
    console.warn("⚠️  No role usages data found");
    return;
  }

  let count = 0;
  for (const roleUsage of roleUsages) {
    try {
      await prisma.roleUsage.upsert({
        where: {
          playerId_role: {
            playerId: roleUsage.playerId,
            role: roleUsage.role,
          },
        },
        update: {
          gamesPlayed: parseInt(roleUsage.gamesPlayed) || 0,
        },
        create: {
          playerId: roleUsage.playerId,
          role: roleUsage.role,
          gamesPlayed: parseInt(roleUsage.gamesPlayed) || 0,
        },
      });
      count++;
    } catch (error) {
      console.warn(`⚠️  Failed to import role usage for player ${roleUsage.playerId}: ${error}`);
    }
  }

  console.log(`✅ Imported ${count} role usages`);
}

async function importPlayerStats() {
  console.log("\n📈 Importing Player Match Stats...");

  const playerStats = readCSV<PlayerStatsRow>("player_stats_s18.csv");

  if (playerStats.length === 0) {
    console.warn("⚠️  No player stats data found");
    return;
  }

  let count = 0;
  for (const stat of playerStats) {
    try {
      await prisma.playerMatchStats.upsert({
        where: {
          playerId_matchId: {
            playerId: stat.playerId,
            matchId: stat.matchId,
          },
        },
        update: {
          goals: parseInt(stat.goals) || 0,
          shots: parseInt(stat.shots) || 0,
          saves: parseInt(stat.saves) || 0,
          assists: parseInt(stat.assists) || 0,
          demosInflicted: parseInt(stat.demosInflicted) || 0,
          demosTaken: parseInt(stat.demosTaken) || 0,
          sprocketRating: parseFloat(stat.sprocketRating) || 0,
        },
        create: {
          playerId: stat.playerId,
          matchId: stat.matchId,
          goals: parseInt(stat.goals) || 0,
          shots: parseInt(stat.shots) || 0,
          saves: parseInt(stat.saves) || 0,
          assists: parseInt(stat.assists) || 0,
          demosInflicted: parseInt(stat.demosInflicted) || 0,
          demosTaken: parseInt(stat.demosTaken) || 0,
          sprocketRating: parseFloat(stat.sprocketRating) || 0,
        },
      });
      count++;
    } catch (error) {
      console.warn(`⚠️  Failed to import stat for player ${stat.playerId} in match ${stat.matchId}`);
    }
  }

  console.log(`✅ Imported ${count} player match stats`);
}

async function importHistoricalStats() {
  console.log("\n📊 Importing Historical Player Stats...");

  const historicalStats = readCSV<HistoricalStatsRow>("historicalAggregatedPlayerStats.csv");

  if (historicalStats.length === 0) {
    console.warn("⚠️  No historical stats data found");
    return;
  }

  let count = 0;
  for (const stat of historicalStats) {
    try {
      await prisma.playerHistoricalStats.upsert({
        where: { id: stat.playerId },
        update: {
          totalGoals: parseInt(stat.totalGoals) || 0,
          totalShots: parseInt(stat.totalShots) || 0,
          totalSaves: parseInt(stat.totalSaves) || 0,
          totalAssists: parseInt(stat.totalAssists) || 0,
          totalDemos: parseInt(stat.totalDemos) || 0,
          avgSR: parseFloat(stat.avgSR) || 0,
          gamesPlayed: parseInt(stat.gamesPlayed) || 0,
        },
        create: {
          id: stat.playerId,
          playerId: stat.playerId,
          totalGoals: parseInt(stat.totalGoals) || 0,
          totalShots: parseInt(stat.totalShots) || 0,
          totalSaves: parseInt(stat.totalSaves) || 0,
          totalAssists: parseInt(stat.totalAssists) || 0,
          totalDemos: parseInt(stat.totalDemos) || 0,
          avgSR: parseFloat(stat.avgSR) || 0,
          gamesPlayed: parseInt(stat.gamesPlayed) || 0,
        },
      });
      count++;
    } catch (error) {
      console.warn(`⚠️  Failed to import historical stats for player ${stat.playerId}`);
    }
  }

  console.log(`✅ Imported ${count} historical player stats`);
}

async function main() {
  console.log("🚀 Starting CSV Import...");
  console.log(`📁 Looking for CSV files in: ${CSV_DIR}\n`);

  try {
    // Import in dependency order
    await importLeaguesAndTeams();
    await importPlayers();
    await importFixtures();
    await importMatches();
    await importRoleUsages();
    await importPlayerStats();
    await importHistoricalStats();

    console.log("\n✅ CSV Import completed successfully!");
  } catch (error) {
    console.error("\n❌ Error during import:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
main()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
