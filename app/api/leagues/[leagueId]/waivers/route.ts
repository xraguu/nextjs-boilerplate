import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/leagues/[leagueId]/waivers
 * Get all pending waiver claims for a league
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

    // Fetch all pending waiver claims for this league
    const waiverClaims = await prisma.waiverClaim.findMany({
      where: {
        fantasyLeagueId: leagueId,
        status: "pending",
      },
      orderBy: {
        priority: "asc",
      },
    });

    return NextResponse.json({ waiverClaims });
  } catch (error) {
    console.error("Error fetching waiver claims:", error);
    return NextResponse.json(
      { error: "Failed to fetch waiver claims" },
      { status: 500 }
    );
  }
}
