import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/mle-teams
 * Get all MLE teams
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mleTeams = await prisma.mLETeam.findMany({
      orderBy: [
        { leagueId: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({ teams: mleTeams });
  } catch (error) {
    console.error("Error fetching MLE teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch MLE teams" },
      { status: 500 }
    );
  }
}
