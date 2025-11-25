import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/players/[playerId]/stats
 * Get historical stats for a player
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params;

    const stats = await prisma.playerHistoricalStats.findMany({
      where: {
        playerId: playerId,
      },
      orderBy: [
        { season: "desc" },
        { gamemode: "asc" },
      ],
    });

    return NextResponse.json({
      stats,
    });
  } catch (error) {
    console.error("Error fetching player stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch player stats" },
      { status: 500 }
    );
  }
}
