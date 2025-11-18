/**
 * CSV Import Script for MLE Fantasy Platform
 *
 * This script imports data from MLE CSV files into the database.
 * Run with: npm run import:csv
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

const prisma = new PrismaClient();

// CSV file paths (relative to project root)
const CSV_DIR = path.join(process.cwd(), "data", "csv");

// CSV row interfaces - only including fields we actually use
interface TeamRow {
  Conference: string;
  "Super Division": string;
  Division: string;
  Franchise: string;
  Code: string;
  "Primary Color": string;
  "Secondary Color": string;
  "Photo URL": string;
}

interface PlayerRow {
  member_id: string;
  skill_group: string;
  franchise: string;
  "Franchise Staff Position": string;
  slot: string;
  name: string; // Also needed for display
}

interface FixtureRow {
  fixture_id: string;
  match_group_id: string;
  home: string;
  away: string;
}

interface MatchRow {
  match_id: string;
  fixture_id: string;
  match_group_id: string;
  home: string;
  away: string;
  league: string;
  game_mode: string;
  home_wins: string;
  away_wins: string;
  winning_team: string;
  scheduling_start_time: string; // For date calculation
}

interface RoundRow {
  match_id: string;
  round_id: string;
  Home: string;
  "Home Goals": string;
  Away: string;
  "Away Goals": string;
}

interface MatchGroupRow {
  match_group_id: string;
  match_group_title: string;
  parent_group_title: string;
}

interface RoleUsageRow {
  doubles_uses: string;
  standard_uses: string;
  total_uses: string;
  season_number: string;
  team_name: string;
  league: string;
  role: string;
  gamemode: string;
}

interface PlayerStatsRow {
  member_id: string;
  team_name: string;
  skill_group: string;
  gamemode: string;
  match_id: string;
  round_id: string;
  gpi: string;
  goals: string;
  saves: string;
  shots: string;
  assists: string;
  goals_against: string;
  shots_against: string;
  demos_inflicted: string;
  demos_taken: string;
}

interface HistoricalStatsRow {
  name: string;
  member_id: string;
  gamemode: string;
  games_played: string;
  sprocket_rating: string;
  total_goals: string;
  total_saves: string;
  total_shots: string;
  total_assists: string;
  total_demos_inflicted: string;
  total_demos_taken: string;
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

  // Extract unique leagues (conferences)
  const leaguesMap = new Map<string, { name: string; colorHex: string; colorHexTwo?: string }>();

  teams.forEach((team) => {
    const leagueId = team.Conference;
    if (!leaguesMap.has(leagueId)) {
      leaguesMap.set(leagueId, {
        name: team.Conference,
        colorHex: team["Primary Color"] || "#FFFFFF",
        colorHexTwo: team["Secondary Color"] || undefined,
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
    const teamId = team.Code; // Use Code as team ID
    const slug = team.Franchise.toLowerCase().replace(/\s+/g, "-");

    await prisma.mLETeam.upsert({
      where: { id: teamId },
      update: {
        name: team.Franchise,
        leagueId: team.Conference,
        slug,
        logoPath: team["Photo URL"] || "",
        primaryColor: team["Primary Color"] || "#FFFFFF",
        secondaryColor: team["Secondary Color"] || "#000000",
      },
      create: {
        id: teamId,
        name: team.Franchise,
        leagueId: team.Conference,
        slug,
        logoPath: team["Photo URL"] || "",
        primaryColor: team["Primary Color"] || "#FFFFFF",
        secondaryColor: team["Secondary Color"] || "#000000",
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
    const playerId = player.member_id; // Use member_id as player ID

    await prisma.mLEPlayer.upsert({
      where: { id: playerId },
      update: {
        name: player.name,
        teamId: player.franchise || null,
      },
      create: {
        id: playerId,
        name: player.name,
        teamId: player.franchise || null,
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
    // Fixture date would need to come from match_groups or matches
    // For now, use a placeholder date
    await prisma.fixture.upsert({
      where: { id: fixture.fixture_id },
      update: {
        date: new Date(), // TODO: Get actual date from match_groups
      },
      create: {
        id: fixture.fixture_id,
        date: new Date(), // TODO: Get actual date from match_groups
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
  const calculateWeek = (date: Date): number => {
    // TODO: This should be calculated based on season settings weekDates
    const seasonStart = new Date("2025-01-01");
    const daysDiff = Math.floor((date.getTime() - seasonStart.getTime()) / (1000 * 60 * 60 * 24));
    const week = Math.floor(daysDiff / 7) + 1;
    return Math.min(Math.max(week, 1), 10);
  };

  let count = 0;
  for (const match of matches) {
    const scheduledDate = new Date(match.scheduling_start_time);
    const week = calculateWeek(scheduledDate);

    await prisma.match.upsert({
      where: { id: match.match_id },
      update: {
        fixtureId: match.fixture_id,
        roundId: "round_placeholder", // Rounds will be imported separately
        matchGroupId: match.match_group_id,
        homeTeamId: match.home,
        awayTeamId: match.away,
        scheduledDate,
        week,
        completed: match.winning_team !== "",
      },
      create: {
        id: match.match_id,
        fixtureId: match.fixture_id,
        roundId: "round_placeholder",
        matchGroupId: match.match_group_id,
        homeTeamId: match.home,
        awayTeamId: match.away,
        scheduledDate,
        week,
        completed: match.winning_team !== "",
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
    // We need to find the player ID from team_name
    // For now, skip if we can't determine the player
    const role = roleUsage.gamemode === "doubles" ? "2s" : "3s";
    const totalUses = parseInt(roleUsage.total_uses) || 0;

    // TODO: Map team_name to actual player IDs
    // This requires a lookup table or additional data
    count++;
  }

  console.log(`⚠️  Role usage import requires player ID mapping (skipped for now)`);
}

async function importPlayerStats() {
  console.log("\n📈 Importing Player Match Stats...");

  const playerStats = readCSV<PlayerStatsRow>("player_stats_s18.csv");

  if (playerStats.length === 0) {
    console.warn("⚠️  No player stats data found");
    return;
  }

  let count = 0;
  let skipped = 0;

  for (const stat of playerStats) {
    try {
      await prisma.playerMatchStats.upsert({
        where: {
          playerId_matchId: {
            playerId: stat.member_id,
            matchId: stat.match_id,
          },
        },
        update: {
          goals: parseInt(stat.goals) || 0,
          shots: parseInt(stat.shots) || 0,
          saves: parseInt(stat.saves) || 0,
          assists: parseInt(stat.assists) || 0,
          demosInflicted: parseInt(stat.demos_inflicted) || 0,
          demosTaken: parseInt(stat.demos_taken) || 0,
          sprocketRating: parseFloat(stat.gpi) || 0, // Using GPI as Sprocket Rating
        },
        create: {
          playerId: stat.member_id,
          matchId: stat.match_id,
          goals: parseInt(stat.goals) || 0,
          shots: parseInt(stat.shots) || 0,
          saves: parseInt(stat.saves) || 0,
          assists: parseInt(stat.assists) || 0,
          demosInflicted: parseInt(stat.demos_inflicted) || 0,
          demosTaken: parseInt(stat.demos_taken) || 0,
          sprocketRating: parseFloat(stat.gpi) || 0,
        },
      });
      count++;
    } catch (error) {
      skipped++;
      if (skipped < 10) {
        console.warn(`⚠️  Skipped stat for player ${stat.member_id} in match ${stat.match_id}`);
      }
    }
  }

  console.log(`✅ Imported ${count} player match stats (${skipped} skipped)`);
}

async function importHistoricalStats() {
  console.log("\n📊 Importing Historical Player Stats...");

  const historicalStats = readCSV<HistoricalStatsRow>("historicalAggregatedPlayerStats.csv");

  if (historicalStats.length === 0) {
    console.warn("⚠️  No historical stats data found");
    return;
  }

  let count = 0;
  let skipped = 0;

  for (const stat of historicalStats) {
    try {
      await prisma.playerHistoricalStats.upsert({
        where: { id: stat.member_id },
        update: {
          totalGoals: parseInt(stat.total_goals) || 0,
          totalShots: parseInt(stat.total_shots) || 0,
          totalSaves: parseInt(stat.total_saves) || 0,
          totalAssists: parseInt(stat.total_assists) || 0,
          totalDemos: parseInt(stat.total_demos_inflicted) || 0,
          avgSR: parseFloat(stat.sprocket_rating) || 0,
          gamesPlayed: parseInt(stat.games_played) || 0,
        },
        create: {
          id: stat.member_id,
          playerId: stat.member_id,
          totalGoals: parseInt(stat.total_goals) || 0,
          totalShots: parseInt(stat.total_shots) || 0,
          totalSaves: parseInt(stat.total_saves) || 0,
          totalAssists: parseInt(stat.total_assists) || 0,
          totalDemos: parseInt(stat.total_demos_inflicted) || 0,
          avgSR: parseFloat(stat.sprocket_rating) || 0,
          gamesPlayed: parseInt(stat.games_played) || 0,
        },
      });
      count++;
    } catch (error) {
      skipped++;
      if (skipped < 10) {
        console.warn(`⚠️  Skipped historical stats for player ${stat.member_id}`);
      }
    }
  }

  console.log(`✅ Imported ${count} historical player stats (${skipped} skipped)`);
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
