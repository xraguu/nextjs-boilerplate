// app/leagues/[leagueId]/layout.tsx
import Link from "next/link";
import { ReactNode } from "react";

export default function LeagueLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { leagueId: string };
}) {
  const { leagueId } = params;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 border-b flex items-center justify-between px-6">
        {/* Left: title that goes back to Home */}
        <Link href="/" className="text-2xl font-bold">
          RL Fantasy
        </Link>

        {/* Middle: league nav */}
        <nav className="flex gap-4">
          <Link href={`/leagues/${leagueId}`}>My Team</Link>
          <Link href={`/leagues/${leagueId}/scoreboard`}>Scoreboard</Link>
          <Link href={`/leagues/${leagueId}/draft`}>Draft</Link>
          <Link href={`/leagues/${leagueId}/teams`}>Teams</Link>
        </nav>

        {/* Right: placeholder for profile / logout */}
        <div>
          {/* User icon / menu */}
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
