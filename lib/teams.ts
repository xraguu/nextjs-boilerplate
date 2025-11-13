import { LEAGUES, LeagueId, getLeagueById } from "./leagues";

export type TeamId = string; // e.g. "ALbulls"

export interface Team {
  id: TeamId; // "ALbulls"
  name: string; // "Bulls"
  leagueId: LeagueId; // "AL"
  slug: string; // "AL-bulls"
  logoPath: string; // "/logos/AL-bulls.png"
  primaryColor: string; // from league.colorHex
  secondaryColor: string; // from league.colorHextwo
}

/** Simple kebab-case utility for names like "Bad Wolves" -> "bad-wolves" */
function kebabCase(s: string): string {
  return s
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

/**
 * Map of league -> list of org names that exist in that league.
 * You control the counts here:
 * - PL & FL: 16 names each
 * - ML, CL, AL: 32 names each
 *
 * Each string is the *display name* of the team ("Bulls").
 */
const LEAGUE_TEAM_NAMES: Record<LeagueId, string[]> = {
  PL: [
    // 16 Premier orgs
    "Bulls",
    // ...
  ],
  ML: [
    // 32 Master orgs
    // "Bulls", "Wolves", ...
  ],
  CL: [
    // 32 Champion orgs
  ],
  AL: [
    // 32 Academy orgs
    "Bulls",
    // ...
  ],
  FL: [
    // 16 Foundation orgs
  ],
};

/** Build ID like "ALbulls" */
function buildTeamId(leagueId: LeagueId, baseName: string): TeamId {
  // use lowercased baseName for ID if you want exact "ALbulls" vs "ALBulls"
  const normalized = baseName.replace(/\s+/g, "");
  return `${leagueId}${normalized}`;
}

/** Build slug like "AL-bulls" */
function buildTeamSlug(leagueId: LeagueId, baseName: string): string {
  const team = kebabCase(baseName); // "Bulls" => "bulls"
  return `${leagueId}-${team}`; // "AL-bulls"
}

/** Build logo path like "/logos/AL-bulls.png" */
function buildLogoPath(leagueId: LeagueId, baseName: string): string {
  const slug = buildTeamSlug(leagueId, baseName);
  return `/logos/${slug}.png`; // <-- NO lowercase, uses exact "AL-bulls"
}

/** Generate all teams from LEAGUE_TEAM_NAMES */
export const TEAMS: Team[] = (
  Object.keys(LEAGUE_TEAM_NAMES) as LeagueId[]
).flatMap((leagueId) => {
  const leagueMeta = getLeagueById(leagueId);
  return LEAGUE_TEAM_NAMES[leagueId].map((name) => {
    const id = buildTeamId(leagueId, name); // "ALbulls"
    const slug = buildTeamSlug(leagueId, name); // "AL-bulls"
    const logoPath = buildLogoPath(leagueId, name);

    return {
      id,
      name,
      leagueId,
      slug,
      logoPath,
      primaryColor: leagueMeta.colorHex,
      secondaryColor: leagueMeta.colorHextwo,
    } satisfies Team;
  });
});

/** Look up helpers */
export function getTeamById(id: TeamId): Team | undefined {
  return TEAMS.find((t) => t.id === id);
}

export function getTeamsByLeague(leagueId: LeagueId): Team[] {
  return TEAMS.filter((t) => t.leagueId === leagueId);
}

export function getTeamBySlug(slug: string): Team | undefined {
  return TEAMS.find((t) => t.slug.toLowerCase() === slug.toLowerCase());
}
