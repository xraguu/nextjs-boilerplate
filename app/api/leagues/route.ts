import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/leagues - List leagues user has access to
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all leagues where user has a fantasy team
    const leagues = await prisma.fantasyLeague.findMany({
      where: {
        fantasyTeams: {
          some: {
            ownerUserId: session.user.id,
          },
        },
      },
      include: {
        fantasyTeams: {
          where: {
            ownerUserId: session.user.id,
          },
          include: {
            _count: {
              select: {
                roster: true,
              },
            },
          },
        },
        _count: {
          select: {
            fantasyTeams: true,
            matchups: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ leagues });
  } catch (error) {
    console.error("Error fetching leagues:", error);
    return NextResponse.json(
      { error: "Failed to fetch leagues" },
      { status: 500 }
    );
  }
}
