"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/my-roster", label: "Roster" },
  { href: "/league", label: "League" },
  { href: "/team-portal", label: "Teams" },
  { href: "/scoreboard", label: "Scoreboard" },
  { href: "/standings", label: "Standings" },
  { href: "/opponents", label: "Opponents", dropdown: true },
];

// Mock managers data (11 other managers besides yourself)
const otherManagers = [
  { id: "manager-1", name: "Mike", teamName: "Thunder Strikers" },
  { id: "manager-2", name: "Sarah", teamName: "Ice Warriors" },
  { id: "manager-3", name: "Jake", teamName: "Fire Dragons" },
  { id: "manager-4", name: "Emma", teamName: "Sky Hunters" },
  { id: "manager-5", name: "Crazy", teamName: "Pixies" },
  { id: "manager-6", name: "Alex", teamName: "Storm Chasers" },
  { id: "manager-7", name: "Jordan", teamName: "Lightning Bolts" },
  { id: "manager-8", name: "Taylor", teamName: "Phoenix Rising" },
  { id: "manager-9", name: "Casey", teamName: "Thunder Wolves" },
  { id: "manager-10", name: "Morgan", teamName: "Ice Breakers" },
  { id: "manager-11", name: "Riley", teamName: "Fire Hawks" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [opponentsOpen, setOpponentsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpponentsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            if (link.dropdown) {
              return (
                <div key={link.href} ref={dropdownRef} style={{ position: "relative" }}>
                  <button
                    onClick={() => setOpponentsOpen(!opponentsOpen)}
                    className={`nav-link ${
                      isActive(link.href) ? "nav-link-active" : ""
                    }`}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem"
                    }}
                  >
                    {link.label} {opponentsOpen ? "▲" : "▼"}
                  </button>

                  {opponentsOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        right: 0,
                        marginTop: "0.5rem",
                        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                        borderRadius: "8px",
                        padding: "0.5rem 0",
                        minWidth: "220px",
                        maxHeight: "400px",
                        overflowY: "auto",
                        border: "1px solid rgba(255,255,255,0.1)",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                        zIndex: 1000
                      }}
                    >
                      {otherManagers.map((manager) => (
                        <Link
                          key={manager.id}
                          href={`/leagues/2025-alpha/my-roster/${manager.id}`}
                          onClick={() => setOpponentsOpen(false)}
                          style={{
                            display: "block",
                            padding: "0.75rem 1rem",
                            color: "#ffffff",
                            textDecoration: "none",
                            transition: "background 0.2s ease"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                            {manager.name}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
                            {manager.teamName}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

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
