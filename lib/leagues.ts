export type LeagueId = "PL" | "ML" | "CL" | "AL" | "FL";

export interface League {
  id: LeagueId;
  name: string;
  colorHex: string; // for outlines/badges
  shortName: string; // "Premier", "Academy" etc.
  colorHextwo: string;
}

export const LEAGUES: League[] = [
  {
    id: "PL",
    name: "Premier League",
    shortName: "Premier",
    colorHex: "#e2b22d",
    colorHextwo: "#e3cd8f",
  },
  {
    id: "ML",
    name: "Master League",
    shortName: "Master",
    colorHex: "#d10057",
    colorHextwo: "#c97799",
  },
  {
    id: "CL",
    name: "Champion League",
    shortName: "Champion",
    colorHex: "#7e55ce",
    colorHextwo: "#a999c9",
  },
  {
    id: "AL",
    name: "Academy League",
    shortName: "Academy",
    colorHex: "#0085fa",
    colorHextwo: "#73bdff",
  },
  {
    id: "FL",
    name: "Foundation League",
    shortName: "Foundation",
    colorHex: "#4ebfecff",
    colorHextwo: "#b0e1f5",
  },
];

export const LEAGUE_SUFFIX: Record<LeagueId, string> = {
  PL: "PL",
  ML: "ML",
  CL: "CL",
  AL: "AL",
  FL: "FL",
};

export function getLeagueById(id: LeagueId): League {
  const league = LEAGUES.find((l) => l.id === id);
  if (!league) throw new Error(`Unknown league: ${id}`);
  return league;
}
