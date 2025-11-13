import Image from "next/image";
import type { Team } from "@/lib/teams";

export function TeamBadge({ team }: { team: Team }) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg border-2 px-3 py-2"
      style={{ borderColor: team.primaryColor }}
    >
      <Image
        src={team.logoPath}
        alt={`${team.name} Logo`}
        width={32}
        height={32}
      />
      <div className="flex flex-col leading-tight">
        <span className="font-semibold">{team.name}</span>
        <span className="text-xs opacity-70">{team.leagueId}</span>
      </div>
    </div>
  );
}
