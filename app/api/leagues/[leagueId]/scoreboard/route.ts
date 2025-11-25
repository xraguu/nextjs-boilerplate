import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/leagues/[leagueId]/scoreboard?week=X
 * Get all matchups for a specific week with team rosters
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
    const { searchParams } = new URL(req.url);
    const weekParam = searchParams.get("week");
    const week = weekParam ? parseInt(weekParam) : 1;

    if (isNaN(week) || week < 1 || week > 10) {
      return NextResponse.json({ error: "Invalid week" }, { status: 400 });
    }

    // Get the league
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

    // For weeks 9-10 (playoffs), return empty matchups if they haven't been generated yet
    // Get all matchups for this week
    const matchups = await prisma.matchup.findMany({
      where: {
        fantasyLeagueId: leagueId,
        week: week,
      },
      include: {
        homeTeam: {
          include: {
            owner: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
        awayTeam: {
          include: {
            owner: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    // If no matchups for this week (e.g., playoffs not started), return empty array
    if (matchups.length === 0) {
      return NextResponse.json({ matchups: [], week, league });
    }

    // Get all teams' records
    const allMatchups = await prisma.matchup.findMany({
      where: { fantasyLeagueId: leagueId },
    });

    const teamRecords = new Map<string, { wins: number; losses: number }>();
    allMatchups.forEach((matchup) => {
      if (!matchup.homeScore || !matchup.awayScore) return;

      if (!teamRecords.has(matchup.homeTeamId)) {
        teamRecords.set(matchup.homeTeamId, { wins: 0, losses: 0 });
      }
      if (!teamRecords.has(matchup.awayTeamId)) {
        teamRecords.set(matchup.awayTeamId, { wins: 0, losses: 0 });
      }

      const homeRecord = teamRecords.get(matchup.homeTeamId)!;
      const awayRecord = teamRecords.get(matchup.awayTeamId)!;

      if (matchup.homeScore > matchup.awayScore) {
        homeRecord.wins++;
        awayRecord.losses++;
      } else {
        awayRecord.wins++;
        homeRecord.losses++;
      }
    });

    // Calculate standings
    const allTeams = await prisma.fantasyTeam.findMany({
      where: { fantasyLeagueId: leagueId },
    });

    const standings = allTeams.map((team) => {
      const record = teamRecords.get(team.id) || { wins: 0, losses: 0 };
      const teamMatchups = allMatchups.filter(
        (m) => m.homeTeamId === team.id || m.awayTeamId === team.id
      );

      let totalPoints = 0;
      teamMatchups.forEach((m) => {
        if (!m.homeScore || !m.awayScore) return;
        const isHome = m.homeTeamId === team.id;
        totalPoints += isHome ? m.homeScore : m.awayScore;
      });

      return {
        teamId: team.id,
        wins: record.wins,
        losses: record.losses,
        totalPoints,
      };
    });

    standings.sort((a, b) => {
      if (a.wins !== b.wins) return b.wins - a.wins;
      return b.totalPoints - a.totalPoints;
    });

    const getPlacement = (teamId: string) => {
      const index = standings.findIndex((s) => s.teamId === teamId);
      if (index === -1) return "-";
      const place = index + 1;
      const suffix =
        place === 1 ? "st" : place === 2 ? "nd" : place === 3 ? "rd" : "th";
      return `${place}${suffix}`;
    };

    // Get rosters for each team in the matchups
    const formattedMatchups = await Promise.all(
      matchups.map(async (matchup) => {
        const homeRecord = teamRecords.get(matchup.homeTeamId) || {
          wins: 0,
          losses: 0,
        };
        const awayRecord = teamRecords.get(matchup.awayTeamId) || {
          wins: 0,
          losses: 0,
        };

        // Get rosters for both teams
        const homeRoster = await prisma.rosterSlot.findMany({
          where: {
            fantasyTeamId: matchup.homeTeamId,
            week: week,
          },
          include: {
            mleTeam: {
              include: {
                league: true,
              },
            },
          },
          orderBy: [{ position: "asc" }, { slotIndex: "asc" }],
        });

        const awayRoster = await prisma.rosterSlot.findMany({
          where: {
            fantasyTeamId: matchup.awayTeamId,
            week: week,
          },
          include: {
            mleTeam: {
              include: {
                league: true,
              },
            },
          },
          orderBy: [{ position: "asc" }, { slotIndex: "asc" }],
        });

        // Get roster config to fill empty slots
        const rosterConfig = league.rosterConfig as {
          "2s": number;
          "3s": number;
          flx: number;
          be: number;
        };

        const fillRosterSlots = (
          roster: typeof homeRoster,
          teamId: string
        ) => {
          const slots: any[] = [];
          const positions = [
            ...Array(rosterConfig["2s"]).fill("2s"),
            ...Array(rosterConfig["3s"]).fill("3s"),
            ...Array(rosterConfig.flx).fill("flx"),
            ...Array(rosterConfig.be).fill("be"),
          ];

          positions.forEach((position, index) => {
            const existingSlot = roster.find(
              (s) =>
                s.position === position &&
                s.slotIndex ===
                  positions.slice(0, index).filter((p) => p === position).length
            );

            if (existingSlot) {
              slots.push({
                id: existingSlot.id,
                position: existingSlot.position,
                slotIndex: existingSlot.slotIndex,
                fantasyPoints: existingSlot.fantasyPoints || 0,
                isLocked: existingSlot.isLocked,
                mleTeam: existingSlot.mleTeam
                  ? {
                      id: existingSlot.mleTeam.id,
                      name: existingSlot.mleTeam.name,
                      leagueId: existingSlot.mleTeam.leagueId,
                      slug: existingSlot.mleTeam.slug,
                      logoPath: existingSlot.mleTeam.logoPath,
                      primaryColor: existingSlot.mleTeam.primaryColor,
                      secondaryColor: existingSlot.mleTeam.secondaryColor,
                    }
                  : null,
              });
            } else {
              // Empty slot
              slots.push({
                id: `empty-${teamId}-${position}-${index}`,
                position: position,
                slotIndex: positions
                  .slice(0, index)
                  .filter((p) => p === position).length,
                fantasyPoints: 0,
                isLocked: false,
                mleTeam: null,
              });
            }
          });

          return slots;
        };

        const homeRosterFilled = fillRosterSlots(homeRoster, matchup.homeTeamId);
        const awayRosterFilled = fillRosterSlots(awayRoster, matchup.awayTeamId);

        return {
          id: matchup.id,
          week: matchup.week,
          team1: {
            id: matchup.homeTeamId,
            teamName: matchup.homeTeam.displayName,
            managerName: matchup.homeTeam.owner.displayName,
            managerId: matchup.homeTeam.owner.id,
            record: `${homeRecord.wins}-${homeRecord.losses}`,
            standing: getPlacement(matchup.homeTeamId),
            score: matchup.homeScore || 0,
            roster: homeRosterFilled,
          },
          team2: {
            id: matchup.awayTeamId,
            teamName: matchup.awayTeam.displayName,
            managerName: matchup.awayTeam.owner.displayName,
            managerId: matchup.awayTeam.owner.id,
            record: `${awayRecord.wins}-${awayRecord.losses}`,
            standing: getPlacement(matchup.awayTeamId),
            score: matchup.awayScore || 0,
            roster: awayRosterFilled,
          },
        };
      })
    );

    return NextResponse.json({
      matchups: formattedMatchups,
      week,
      league: {
        id: league.id,
        name: league.name,
        currentWeek: league.currentWeek,
      },
    });
  } catch (error) {
    console.error("Error fetching scoreboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch scoreboard" },
      { status: 500 }
    );
  }
}
