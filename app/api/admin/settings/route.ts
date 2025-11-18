import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/settings - Get current season settings
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const season = searchParams.get("season");

    // Get the current or specified season settings
    let settings;
    if (season) {
      settings = await prisma.seasonSettings.findUnique({
        where: { season: parseInt(season) },
      });
    } else {
      // Get the most recent season settings
      settings = await prisma.seasonSettings.findFirst({
        orderBy: { season: "desc" },
      });
    }

    // If no settings exist, return defaults
    if (!settings) {
      return NextResponse.json({
        settings: {
          season: new Date().getFullYear(),
          currentWeek: 1,
          playoffStartWeek: 9,
          tradeCutoffWeek: 8,
          lineupLockTime: "00:01",
          weekDates: Array.from({ length: 10 }, (_, i) => ({
            week: i + 1,
            startDate: "",
            endDate: "",
          })),
          scoringRules: {
            goals: 2,
            shots: 0.1,
            saves: 1,
            assists: 1.5,
            demosInflicted: 0.5,
            demosTaken: -0.5,
            sprocketRating: 0.1,
            gameWin: 10,
            gameLoss: 0,
          },
          waiverSchedule: [
            { day: "Wednesday", time: "03:00" },
            { day: "Sunday", time: "03:00" },
          ],
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching season settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch season settings" },
      { status: 500 }
    );
  }
}

// POST /api/admin/settings - Create or update season settings
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      season,
      currentWeek,
      playoffStartWeek,
      tradeCutoffWeek,
      lineupLockTime,
      weekDates,
      scoringRules,
      waiverSchedule,
    } = body;

    // Validate required fields
    if (!season || !currentWeek || !weekDates || !scoringRules) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate week ranges
    if (currentWeek < 1 || currentWeek > 10) {
      return NextResponse.json(
        { error: "Current week must be between 1 and 10" },
        { status: 400 }
      );
    }

    // Validate week dates array
    if (!Array.isArray(weekDates) || weekDates.length !== 10) {
      return NextResponse.json(
        { error: "Week dates must be an array of 10 weeks" },
        { status: 400 }
      );
    }

    // Upsert the settings (create or update if exists)
    const settings = await prisma.seasonSettings.upsert({
      where: {
        season: parseInt(season),
      },
      update: {
        currentWeek: parseInt(currentWeek),
        playoffStartWeek: parseInt(playoffStartWeek),
        tradeCutoffWeek: parseInt(tradeCutoffWeek),
        lineupLockTime,
        weekDates,
        scoringRules,
        waiverSchedule: waiverSchedule || [],
      },
      create: {
        season: parseInt(season),
        currentWeek: parseInt(currentWeek),
        playoffStartWeek: parseInt(playoffStartWeek),
        tradeCutoffWeek: parseInt(tradeCutoffWeek),
        lineupLockTime,
        weekDates,
        scoringRules,
        waiverSchedule: waiverSchedule || [],
      },
    });

    return NextResponse.json({ settings, success: true });
  } catch (error) {
    console.error("Error saving season settings:", error);
    return NextResponse.json(
      { error: "Failed to save season settings" },
      { status: 500 }
    );
  }
}
