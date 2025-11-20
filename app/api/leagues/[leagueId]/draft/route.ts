import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/leagues/[leagueId]/draft
 * Returns the current draft state including:
 * - All draft picks (completed and upcoming)
 * - Current pick information
 * - Draft settings (timer, status)
 * - All fantasy team rosters
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ leagueId: string }> }
) {
  try {
    console.log("[Draft API] Starting draft state fetch");
    const session = await auth();
    if (!session?.user?.id) {
      console.log("[Draft API] Unauthorized - no session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leagueId } = await params;
    console.log("[Draft API] Fetching draft for league:", leagueId);

    // Get the fantasy league
    const league = await prisma.fantasyLeague.findUnique({
      where: { id: leagueId },
      include: {
        fantasyTeams: {
          include: {
            owner: true,
            roster: {
              include: {
                mleTeam: true,
              },
            },
          },
          orderBy: {
            draftPosition: "asc",
          },
        },
        draftPicks: {
          orderBy: {
            overallPick: "asc",
          },
        },
      },
    });

    if (!league) {
      return NextResponse.json(
        { error: "Fantasy league not found" },
        { status: 404 }
      );
    }

    // Find current pick (first unpicked)
    const currentPick = league.draftPicks.find((pick) => !pick.pickedAt);

    // Get available MLE teams (not drafted yet)
    const draftedTeamIds = league.draftPicks
      .filter((pick) => pick.mleTeamId)
      .map((pick) => pick.mleTeamId as string);

    const availableTeams = await prisma.mLETeam.findMany({
      where: {
        id: {
          notIn: draftedTeamIds,
        },
      },
      include: {
        league: true,
        weeklyStats: {
          orderBy: {
            week: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    // Get draft metadata from league (stored as JSON or separate table)
    // For now, we'll use a simple approach with league fields
    // Note: These custom fields need to be added to the Prisma schema
    const leagueAny = league as any;
    const draftState = {
      leagueId: league.id,
      leagueName: league.name,
      draftType: league.draftType,
      status: leagueAny.draftStatus || "not_started", // "not_started" | "in_progress" | "paused" | "completed"
      currentPickNumber: currentPick?.overallPick || null,
      currentPickDeadline: leagueAny.draftPickDeadline || null, // ISO timestamp
      pickTimeSeconds: leagueAny.draftPickTimeSeconds || 90, // configurable per league

      picks: league.draftPicks.map((pick) => ({
        id: pick.id,
        round: pick.round,
        pickNumber: pick.pickNumber,
        overallPick: pick.overallPick,
        fantasyTeamId: pick.fantasyTeamId,
        mleTeamId: pick.mleTeamId,
        pickedAt: pick.pickedAt,
      })),

      fantasyTeams: league.fantasyTeams.map((team) => ({
        id: team.id,
        displayName: team.displayName,
        shortCode: team.shortCode,
        draftPosition: team.draftPosition,
        ownerUserId: team.ownerUserId,
        ownerDisplayName: team.owner.displayName,
        ownerDiscordId: team.owner.discordId,
        roster: team.roster.map((slot) => ({
          week: slot.week,
          position: slot.position,
          slotIndex: slot.slotIndex,
          mleTeamId: slot.mleTeamId,
          mleTeam: slot.mleTeam
            ? {
                id: slot.mleTeam.id,
                name: slot.mleTeam.name,
                leagueId: slot.mleTeam.leagueId,
                logoPath: slot.mleTeam.logoPath,
              }
            : null,
        })),
      })),

      availableTeams: availableTeams.map((team) => ({
        id: team.id,
        name: team.name,
        leagueId: team.leagueId,
        slug: team.slug,
        logoPath: team.logoPath,
        primaryColor: team.primaryColor,
        secondaryColor: team.secondaryColor,
        // Include latest stats if available
        latestStats: (team as any).weeklyStats?.[0] || null,
      })),
    };

    console.log("[Draft API] Successfully fetched draft state");
    return NextResponse.json(draftState);
  } catch (error) {
    console.error("[Draft API] Error fetching draft state:", error);
    console.error("[Draft API] Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return NextResponse.json(
      {
        error: "Failed to fetch draft state",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
