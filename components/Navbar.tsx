"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MANAGERS } from "@/lib/managers";

const links = [
  { href: "/", label: "Home" },
  { href: "/my-roster", label: "Roster" },
  { href: "/league", label: "League" },
  { href: "/team-portal", label: "Teams" },
  { href: "/scoreboard", label: "Scoreboard" },
  { href: "/standings", label: "Standings" },
  { href: "/opponents", label: "Opponents", dropdown: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="navbar">
      <div className="nav-inner flex items-center justify-between px-4 py-2">
        <Link href="/" className="flex items-center gap-3">
          <div className="leading-tight">
            <div className="nav-title text-xl font-bold">RL Fantasy</div>
            <div className="nav-subtitle text-sm opacity-80">Minor League Esports</div>
          </div>
        </Link>

        {/* Right: links */}
        <nav className="nav-links flex items-center gap-4">
          {links.map((link) => {
            if (link.dropdown) {
              const active = isActive(link.href);
              return (
                <div
                  key={link.href}
                  className={`nav-item dropdown relative ${active ? "nav-link-active" : ""}`}
                >
                  <span className="nav-link nav-link-button cursor-pointer">Opponents ▾</span>
                  <div className="dropdown-menu absolute hidden group-hover:block">
                    {MANAGERS.map((m) => (
                      <Link key={m.slug} href={`/opponents/${m.slug}`} className="dropdown-item">
                        <span className="mgr-name">{m.name}</span>
                        <span className="mgr-team">{m.team}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${isActive(link.href) ? "nav-link-active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <Image
            src="/mle-logo.png"
            alt="MLE Logo"
            width={50}
            height={50}
            priority
          />
      </div>
    </header>
  );
}
