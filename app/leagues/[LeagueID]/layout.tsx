// app/leagues/[LeagueID]/layout.tsx
import type { ReactNode } from "react";
import LeagueNavbar from "@/components/LeagueNavbar";
import "@/app/globals.css";

export default function LeagueLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <LeagueNavbar />
      <main>{children}</main>
    </>
  );
}
