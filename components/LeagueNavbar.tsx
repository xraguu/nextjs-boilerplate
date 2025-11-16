"use client";

import Link from "next/link";
import Image from "next/image";
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
          <Image
            src="/mle_fantasy_logo.png"
            alt="MLE Fantasy Logo"
            width={50}
            height={50}
            priority
            style={{ cursor: "pointer" }}
          />
        </Link>

        {/* Right: links */}
        <nav className="nav-links flex items-center gap-4">
          {/* Draft Button */}
          <Link
            href={`/leagues/${leagueId}/draft`}
            style={{
              background: "linear-gradient(135deg, #d4af37 0%, #f2b632 100%)",
              color: "#ffffff",
              padding: "0.5rem 1.5rem",
              borderRadius: "20px",
              fontWeight: 700,
              fontSize: "0.9rem",
              textDecoration: "none",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              boxShadow: "0 4px 10px rgba(212, 175, 55, 0.3)",
              transition: "all 0.2s ease",
              border: "none",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 15px rgba(212, 175, 55, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 10px rgba(212, 175, 55, 0.3)";
            }}
          >
            Draft
          </Link>
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
