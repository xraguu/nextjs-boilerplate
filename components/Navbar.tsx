"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/my-team", label: "My Team" },
  { href: "/league", label: "League" },
  { href: "/players", label: "Players" },
  { href: "/fantasycast", label: "FantasyCast" },
  { href: "/scoreboard", label: "Scoreboard" },
  { href: "/standings", label: "Standings" },
  { href: "/opponents", label: "Opposing Teams" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="navbar">
      <div className="nav-inner">
        <div className="nav-brand">
          <span className="nav-title">MLE Fantasy</span>
          <span className="nav-subtitle">Minor League Esports</span>
        </div>

        <nav className="nav-links">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${isActive ? "nav-link-active" : ""}`}
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
