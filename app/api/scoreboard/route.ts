// app/api/scoreboard/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // TODO: pull week + matches from your DB
  return NextResponse.json({
    ok: true,
    now: new Date().toISOString(),
    games: [],
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  // TODO: accept filters/pagination in body
  return NextResponse.json({ ok: true, received: body });
}
