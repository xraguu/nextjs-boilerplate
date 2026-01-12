import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leagueId: string; teamId: string }> }
) {
  try {
    const { leagueId, teamId } = await params;
    const { searchParams } = new URL(request.url);
    const week = searchParams.get("week");

    if (!week) {
      return NextResponse.json(
        { error: "Week parameter is required" },
        { status: 400 }
      );
    }

    const weekNumber = parseInt(week, 10);

    // Find if this MLE team was rostered in this week
    const rosterSlot = await prisma.rosterSlot.findFirst({
      where: {
        mleTeamId: teamId,
        week: weekNumber,
      },
      include: {
        fantasyTeam: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!rosterSlot) {
      return NextResponse.json({
        rostered: false,
        message: "This team was not rostered in the specified week",
      });
    }

    // Get the matchup for this fantasy team and week
    const matchup = await prisma.matchup.findFirst({
      where: {
        fantasyLeagueId: rosterSlot.fantasyTeam.fantasyLeagueId,
        week: weekNumber,
        OR: [
          { homeTeamId: rosterSlot.fantasyTeamId },
          { awayTeamId: rosterSlot.fantasyTeamId },
        ],
      },
      include: {
        homeTeam: {
          include: {
            owner: true,
          },
        },
        awayTeam: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!matchup) {
      return NextResponse.json({
        rostered: true,
        matchup: null,
        message: "No matchup found for this week",
      });
    }

    // Determine which team is "my team" (the one that rostered the clicked MLE team)
    const isHomeTeam = matchup.homeTeamId === rosterSlot.fantasyTeamId;
    const myTeam = isHomeTeam ? matchup.homeTeam : matchup.awayTeam;
    const oppTeam = isHomeTeam ? matchup.awayTeam : matchup.homeTeam;

    // Get lineup for both teams
    const myLineup = await prisma.rosterSlot.findMany({
      where: {
        fantasyTeamId: myTeam.id,
        week: weekNumber,
      },
      include: {
        mleTeam: {
          include: {
            league: true,
          },
        },
      },
      orderBy: [
        { position: "asc" },
        { slotIndex: "asc" },
      ],
    });

    const oppLineup = await prisma.rosterSlot.findMany({
      where: {
        fantasyTeamId: oppTeam.id,
        week: weekNumber,
      },
      include: {
        mleTeam: {
          include: {
            league: true,
          },
        },
      },
      orderBy: [
        { position: "asc" },
        { slotIndex: "asc" },
      ],
    });

    // Get stats for all MLE teams in both lineups
    const allMleTeamIds: string[] = [
      ...myLineup.map((slot) => slot.mleTeamId),
      ...oppLineup.map((slot) => slot.mleTeamId),
    ];

    const weeklyStats = await prisma.teamWeeklyStats.findMany({
      where: {
        teamId: { in: allMleTeamIds },
        week: weekNumber,
      },
    });

    // Create a map of team stats for easy lookup
    const statsMap = new Map(
      weeklyStats.map((stat) => [stat.teamId, stat])
    );

    // Format the lineup data with stats
    const formatLineup = (lineup: typeof myLineup) =>
      lineup.map((slot) => ({
        position: slot.position,
        slotIndex: slot.slotIndex,
        team: {
          id: slot.mleTeam.id,
          name: slot.mleTeam.name,
          leagueId: slot.mleTeam.leagueId,
          logoPath: slot.mleTeam.logoPath,
          primaryColor: slot.mleTeam.primaryColor,
          secondaryColor: slot.mleTeam.secondaryColor,
        },
        stats: statsMap.get(slot.mleTeamId) || null,
        fantasyPoints: slot.fantasyPoints,
      }));

    return NextResponse.json({
      rostered: true,
      matchup: {
        id: matchup.id,
        week: matchup.week,
        homeScore: matchup.homeScore,
        awayScore: matchup.awayScore,
        myTeam: {
          id: myTeam.id,
          displayName: myTeam.displayName,
          manager: myTeam.owner.displayName,
          isHome: isHomeTeam,
          lineup: formatLineup(myLineup),
        },
        oppTeam: {
          id: oppTeam.id,
          displayName: oppTeam.displayName,
          manager: oppTeam.owner.displayName,
          isHome: !isHomeTeam,
          lineup: formatLineup(oppLineup),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching weekly matchup:", error);
    return NextResponse.json(
      { error: "Failed to fetch weekly matchup data" },
      { status: 500 }
    );
  }
}
