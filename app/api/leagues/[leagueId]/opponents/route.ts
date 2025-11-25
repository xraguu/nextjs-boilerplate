import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/leagues/[leagueId]/opponents
 * Get all opponents (other fantasy teams) in the league with their rosters
 * Query params: ?week=1
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ leagueId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leagueId } = await params;
    const url = new URL(req.url);
    const week = parseInt(url.searchParams.get("week") || "1");

    // Get the league with roster config
    const league = await prisma.fantasyLeague.findUnique({
      where: { id: leagueId },
      select: {
        id: true,
        name: true,
        currentWeek: true,
        rosterConfig: true,
      },
    });

    if (!league) {
      return NextResponse.json({ error: "League not found" }, { status: 404 });
    }

    // Parse roster config to know how many slots each position has
    const rosterConfig = league.rosterConfig as any;
    const expectedSlots = [
      ...Array(rosterConfig["2s"] || 0).fill("2s"),
      ...Array(rosterConfig["3s"] || 0).fill("3s"),
      ...Array(rosterConfig.flx || 0).fill("FLX"),
      ...Array(rosterConfig.be || 0).fill("BE"),
    ];

    // Get all fantasy teams in the league (excluding current user's team)
    const allTeams = await prisma.fantasyTeam.findMany({
      where: {
        fantasyLeagueId: leagueId,
        ownerUserId: {
          not: session.user.id,
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        displayName: "asc",
      },
    });

    // For each team, get their roster and calculate stats
    const opponents = await Promise.all(
      allTeams.map(async (team) => {
        // Get roster for the specified week
        const rosterSlots = await prisma.rosterSlot.findMany({
          where: {
            fantasyTeamId: team.id,
            week,
          },
          include: {
            mleTeam: {
              include: {
                weeklyStats: {
                  where: { week },
                  take: 1,
                },
              },
            },
          },
          orderBy: [{ position: "asc" }, { slotIndex: "asc" }],
        });

        // Get all matchups for this team to calculate record
        const matchups = await prisma.matchup.findMany({
          where: {
            fantasyLeagueId: leagueId,
            OR: [
              { homeTeamId: team.id },
              { awayTeamId: team.id },
            ],
          },
          include: {
            homeTeam: {
              select: {
                id: true,
                displayName: true,
              },
            },
            awayTeam: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        });

        // Calculate wins, losses, total points
        let wins = 0;
        let losses = 0;
        let totalPoints = 0;

        matchups.forEach((matchup) => {
          if (!matchup.homeScore || !matchup.awayScore) return;

          const isHome = matchup.homeTeamId === team.id;
          const myScore = isHome ? matchup.homeScore : matchup.awayScore;
          const oppScore = isHome ? matchup.awayScore : matchup.homeScore;

          totalPoints += myScore;

          if (myScore > oppScore) {
            wins++;
          } else if (myScore < oppScore) {
            losses++;
          }
        });

        const gamesPlayed = wins + losses;
        const avgPoints = gamesPlayed > 0 ? totalPoints / gamesPlayed : 0;

        // Calculate standings place (simplified - just sort by wins)
        const allTeamsWithRecords = await prisma.matchup.findMany({
          where: { fantasyLeagueId: leagueId },
          select: {
            homeTeamId: true,
            awayTeamId: true,
            homeScore: true,
            awayScore: true,
          },
        });

        // Group by team and calculate wins
        const teamWins = new Map<string, number>();
        allTeamsWithRecords.forEach((m) => {
          if (!m.homeScore || !m.awayScore) return;

          const homeWins = teamWins.get(m.homeTeamId) || 0;
          const awayWins = teamWins.get(m.awayTeamId) || 0;

          if (m.homeScore > m.awayScore) {
            teamWins.set(m.homeTeamId, homeWins + 1);
          } else if (m.awayScore > m.homeScore) {
            teamWins.set(m.awayTeamId, awayWins + 1);
          }
        });

        // Sort teams by wins and find place
        const sortedTeams = Array.from(teamWins.entries())
          .sort((a, b) => b[1] - a[1]);
        const place = sortedTeams.findIndex(([teamId]) => teamId === team.id) + 1;

        // Get last and current matchup
        const sortedMatchups = matchups
          .filter(m => m.homeScore !== null && m.awayScore !== null)
          .sort((a, b) => a.week - b.week);

        const lastMatchup = sortedMatchups[sortedMatchups.length - 2];
        const currentMatchup = sortedMatchups[sortedMatchups.length - 1];

        // Create a map of filled roster slots by position
        const filledSlots = new Map<string, typeof rosterSlots[0]>();
        rosterSlots.forEach(slot => {
          const key = `${slot.position}-${slot.slotIndex}`;
          filledSlots.set(key, slot);
        });

        // Build roster array with all expected slots (including empty ones)
        const roster = await Promise.all(
          expectedSlots.map(async (slotName, index) => {
            // Determine position and slotIndex based on slot name
            let position = "";
            let slotIndex = 0;

            if (slotName === "2s") {
              position = "2s";
              slotIndex = expectedSlots.slice(0, index).filter(s => s === "2s").length;
            } else if (slotName === "3s") {
              position = "3s";
              slotIndex = expectedSlots.slice(0, index).filter(s => s === "3s").length;
            } else if (slotName === "FLX") {
              position = "FLX";
              slotIndex = expectedSlots.slice(0, index).filter(s => s === "FLX").length;
            } else if (slotName === "BE") {
              position = "BE";
              slotIndex = expectedSlots.slice(0, index).filter(s => s === "BE").length;
            }

            const key = `${position}-${slotIndex}`;
            const slot = filledSlots.get(key);

            // If slot is empty, return empty slot data
            if (!slot) {
              return {
                slot: slotName,
                name: "",
                score: 0,
                opponent: "",
                oprk: 0,
                fprk: 0,
                fpts: 0,
                avg: 0,
                last: 0,
                goals: 0,
                shots: 0,
                saves: 0,
                assists: 0,
                demos: 0,
                teamRecord: "",
                opponentGameRecord: "",
                opponentFantasyRank: 0,
              };
            }

            // Process filled slot
            return await (async () => {
            // Get all weekly stats for this team to calculate totals
            const allWeeklyStats = await prisma.teamWeeklyStats.findMany({
              where: { teamId: slot.mleTeam.id },
            });

            // Calculate total stats
            const totalGoals = allWeeklyStats.reduce((sum, s) => sum + s.goals, 0);
            const totalShots = allWeeklyStats.reduce((sum, s) => sum + s.shots, 0);
            const totalSaves = allWeeklyStats.reduce((sum, s) => sum + s.saves, 0);
            const totalAssists = allWeeklyStats.reduce((sum, s) => sum + s.assists, 0);
            const totalDemos = allWeeklyStats.reduce((sum, s) => sum + s.demosInflicted, 0);
            const totalWins = allWeeklyStats.reduce((sum, s) => sum + s.wins, 0);
            const totalLosses = allWeeklyStats.reduce((sum, s) => sum + s.losses, 0);

            // Calculate fantasy points
            const calculateFantasyPoints = (stats: any) => {
              return (stats.goals * 2) + (stats.shots * 0.1) + (stats.saves * 1) + (stats.assists * 1.5) + (stats.demosInflicted * 0.5);
            };

            const totalFantasyPoints = allWeeklyStats.reduce((sum, s) => sum + calculateFantasyPoints(s), 0);
            const avgFantasyPoints = allWeeklyStats.length > 0 ? totalFantasyPoints / allWeeklyStats.length : 0;
            const lastWeekStats = allWeeklyStats.find(s => s.week === week - 1);
            const lastWeekPoints = lastWeekStats ? calculateFantasyPoints(lastWeekStats) : 0;
            const currentWeekStats = slot.mleTeam.weeklyStats[0];
            const currentWeekPoints = currentWeekStats ? calculateFantasyPoints(currentWeekStats) : 0;

              // Get opponent info for this week (simplified - would need Match data)
              const opponent = "TBD"; // TODO: Get actual opponent from Match data
              const oprk = 0; // TODO: Calculate opponent rank
              const fprk = 0; // TODO: Calculate fantasy points rank
              const opponentGameRecord = "0-0"; // TODO: Get actual record
              const opponentFantasyRank = 0; // TODO: Get actual rank

              return {
                slot: slotName,
                name: `${slot.mleTeam.leagueId} ${slot.mleTeam.name}`,
                score: currentWeekPoints,
                opponent,
                oprk,
                fprk,
                fpts: totalFantasyPoints,
                avg: avgFantasyPoints,
                last: lastWeekPoints,
                goals: totalGoals,
                shots: totalShots,
                saves: totalSaves,
                assists: totalAssists,
                demos: totalDemos,
                teamRecord: `${totalWins}-${totalLosses}`,
                opponentGameRecord,
                opponentFantasyRank,
              };
            })();
          })
        );

        return {
          id: team.id,
          name: team.owner.displayName,
          teamName: team.displayName,
          record: `${wins}-${losses}`,
          place: place > 0 ? `${place}${place === 1 ? "st" : place === 2 ? "nd" : place === 3 ? "rd" : "th"}` : "N/A",
          totalPoints: Math.round(totalPoints),
          avgPoints: Math.round(avgPoints),
          currentWeek: league.currentWeek,
          lastMatchup: lastMatchup ? {
            myTeam: team.displayName,
            myScore: lastMatchup.homeTeamId === team.id ? Math.round(lastMatchup.homeScore || 0) : Math.round(lastMatchup.awayScore || 0),
            opponent: lastMatchup.homeTeamId === team.id ? lastMatchup.awayTeam.displayName : lastMatchup.homeTeam.displayName,
            opponentScore: lastMatchup.homeTeamId === team.id ? Math.round(lastMatchup.awayScore || 0) : Math.round(lastMatchup.homeScore || 0),
          } : undefined,
          currentMatchup: currentMatchup ? {
            myTeam: team.displayName,
            myScore: currentMatchup.homeTeamId === team.id ? Math.round(currentMatchup.homeScore || 0) : Math.round(currentMatchup.awayScore || 0),
            opponent: currentMatchup.homeTeamId === team.id ? currentMatchup.awayTeam.displayName : currentMatchup.homeTeam.displayName,
            opponentScore: currentMatchup.homeTeamId === team.id ? Math.round(currentMatchup.awayScore || 0) : Math.round(currentMatchup.homeScore || 0),
          } : undefined,
          teams: roster,
        };
      })
    );

    return NextResponse.json({
      opponents,
      league: {
        id: league.id,
        name: league.name,
        currentWeek: league.currentWeek,
      },
    });
  } catch (error) {
    console.error("Error fetching opponents:", error);
    return NextResponse.json(
      { error: "Failed to fetch opponents" },
      { status: 500 }
    );
  }
}
