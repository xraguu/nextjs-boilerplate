"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

export default function LeagueNavbar() {
  const pathname = usePathname();
  const params = useParams();
  const leagueId = params?.LeagueID as string;

  const links = [
    { href: `/leagues/${leagueId}`, label: "My Roster" },
    { href: `/leagues/${leagueId}/team-portal`, label: "MLE Teams" },
    { href: `/leagues/${leagueId}/scoreboard`, label: "Scoreboard" },
    { href: `/leagues/${leagueId}/standings`, label: "Standings" },
    { href: `/leagues/${leagueId}/opponents`, label: "Opponents" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="navbar">
      <div className="nav-inner flex items-center justify-between px-4 py-2">
        <Link href="/" className="flex items-center gap-3">
          <div className="leading-tight">
            <div className="nav-title text-xl font-bold">RL Fantasy</div>
            <div className="nav-subtitle text-sm opacity-80">
              Minor League Esports
            </div>
          </div>
        </Link>

        {/* Right: links */}
        <nav className="nav-links flex items-center gap-4">
          {links.map((link) => {
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${
                  isActive(link.href) ? "nav-link-active" : ""
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
