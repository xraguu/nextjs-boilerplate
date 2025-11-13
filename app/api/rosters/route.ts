import { NextResponse } from "next/server";

export async function GET() {
  // TODO: fetch roster for the authenticated manager
  return NextResponse.json({ ok: true, roster: [] });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  // TODO: update lineup / submit changes
  return NextResponse.json({ ok: true, received: body });
}
