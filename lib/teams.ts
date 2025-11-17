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
  teamPrimaryColor: string; // team's primary color
  teamSecondaryColor: string; // team's secondary color
  gameRecord: string; // "10-15" (wins-losses in MLE)
  fantasyRank: number; // 1-32 (or 1-16 for smaller leagues)
}

/** Team franchise primary colors */
const TEAM_PRIMARY_COLORS: Record<string, string> = {
  "Aviators": "#006847",
  "Bears": "#62b6fe",
  "Blizzard": "#385470",
  "Bulls": "#c30000",
  "Comets": "#2db4e3",
  "Demolition": "#148c32",
  "Dodgers": "#041e42",
  "Ducks": "#00788c",
  "Eclipse": "#261447",
  "Elite": "#572a84",
  "Express": "#00254c",
  "Flames": "#c92a06",
  "Foxes": "#ea6409",
  "Hawks": "#c30000",
  "Hive": "#ffa000",
  "Hurricanes": "#005030",
  "Jets": "#0a2b58",
  "Knights": "#b20000",
  "Lightning": "#002868",
  "Outlaws": "#981821",
  "Pandas": "#006100",
  "Pirates": "#333739",
  "Puffins": "#ec2c0d",
  "Rhinos": "#7d7d7d",
  "Sabres": "#f36a22",
  "Shadow": "#333739",
  "Sharks": "#329393",
  "Spartans": "#7b1515",
  "Spectre": "#58427c",
  "Tyrants": "#98012e",
  "Wizards": "#0066b2",
  "Wolves": "#8ebae3",
};

/** Team franchise secondary colors */
const TEAM_SECONDARY_COLORS: Record<string, string> = {
  "Aviators": "#b7b7b7",
  "Bears": "#a3bad2",
  "Blizzard": "#a3bad2",
  "Bulls": "#111111",
  "Comets": "#f6518d",
  "Demolition": "#fdc622",
  "Dodgers": "#e7e9ea",
  "Ducks": "#ffd100",
  "Eclipse": "#ff6c11",
  "Elite": "#ea9300",
  "Express": "#eeb311",
  "Flames": "#f6c432",
  "Foxes": "#ffffff",
  "Hawks": "#0199b5",
  "Hive": "#111111",
  "Hurricanes": "#f47321",
  "Jets": "#c7102e",
  "Knights": "#8e8e8e",
  "Lightning": "#ffffff",
  "Outlaws": "#231c09",
  "Pandas": "#111111",
  "Pirates": "#ffffff",
  "Puffins": "#9bf9ff",
  "Rhinos": "#d9d9d9",
  "Sabres": "#111111",
  "Shadow": "#d3bc8d",
  "Sharks": "#f36a24",
  "Spartans": "#ffb612",
  "Spectre": "#4dcf74",
  "Tyrants": "#c4a87d",
  "Wizards": "#fdb927",
  "Wolves": "#221c35",
};

/** League colors for headers */
export const LEAGUE_COLORS: Record<LeagueId, string> = {
  "FL": "#4ebeec",
  "AL": "#0085fa",
  "CL": "#7e55ce",
  "ML": "#d10057",
  "PL": "#e2b22d",
};

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
    "Aviators",
    "Bears",
    "Blizzard",
    "Bulls",
    "Express",
    "Hive",
    "Hurricanes",
    "Jets",
    "Knights",
    "Lightning",
    "Outlaws",
    "Pandas",
    "Rhinos",
    "Shadow",
    "Spartans",
    "Wolves",
  ],
  ML: [
    // 32 Master orgs
    "Aviators",
    "Bears",
    "Blizzard",
    "Bulls",
    "Comets",
    "Demolition",
    "Dodgers",
    "Ducks",
    "Eclipse",
    "Elite",
    "Express",
    "Flames",
    "Foxes",
    "Hawks",
    "Hive",
    "Hurricanes",
    "Jets",
    "Knights",
    "Lightning",
    "Outlaws",
    "Pandas",
    "Pirates",
    "Puffins",
    "Rhinos",
    "Sabres",
    "Shadow",
    "Sharks",
    "Spartans",
    "Spectre",
    "Tyrants",
    "Wizards",
    "Wolves",
  ],
  CL: [
    // 32 Champion orgs
    "Aviators",
    "Bears",
    "Blizzard",
    "Bulls",
    "Comets",
    "Demolition",
    "Dodgers",
    "Ducks",
    "Eclipse",
    "Elite",
    "Express",
    "Flames",
    "Foxes",
    "Hawks",
    "Hive",
    "Hurricanes",
    "Jets",
    "Knights",
    "Lightning",
    "Outlaws",
    "Pandas",
    "Pirates",
    "Puffins",
    "Rhinos",
    "Sabres",
    "Shadow",
    "Sharks",
    "Spartans",
    "Spectre",
    "Tyrants",
    "Wizards",
    "Wolves",
  ],
  AL: [
    // 32 Academy orgs
    "Aviators",
    "Bears",
    "Blizzard",
    "Bulls",
    "Comets",
    "Demolition",
    "Dodgers",
    "Ducks",
    "Eclipse",
    "Elite",
    "Express",
    "Flames",
    "Foxes",
    "Hawks",
    "Hive",
    "Hurricanes",
    "Jets",
    "Knights",
    "Lightning",
    "Outlaws",
    "Pandas",
    "Pirates",
    "Puffins",
    "Rhinos",
    "Sabres",
    "Shadow",
    "Sharks",
    "Spartans",
    "Spectre",
    "Tyrants",
    "Wizards",
    "Wolves",
  ],
  FL: [
    // 16 Foundation orgs
    "Comets",
    "Demolition",
    "Dodgers",
    "Ducks",
    "Eclipse",
    "Elite",
    "Flames",
    "Foxes",
    "Hawks",
    "Pirates",
    "Puffins",
    "Sabres",
    "Sharks",
    "Spectre",
    "Tyrants",
    "Wizards",
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
  return LEAGUE_TEAM_NAMES[leagueId].map((name, index) => {
    const id = buildTeamId(leagueId, name); // "ALbulls"
    const slug = buildTeamSlug(leagueId, name); // "AL-bulls"
    const logoPath = buildLogoPath(leagueId, name);

    // Generate mock game record (wins-losses, realistic spread)
    const wins = Math.max(0, 12 - index);
    const losses = Math.min(25, 3 + index * 2);
    const gameRecord = `${wins}-${losses}`;

    // Fantasy rank is position in the league (1-indexed)
    const fantasyRank = index + 1;

    return {
      id,
      name,
      leagueId,
      slug,
      logoPath,
      primaryColor: leagueMeta.colorHex,
      secondaryColor: leagueMeta.colorHextwo,
      teamPrimaryColor: TEAM_PRIMARY_COLORS[name] || "#ffffff",
      teamSecondaryColor: TEAM_SECONDARY_COLORS[name] || "#ffffff",
      gameRecord,
      fantasyRank,
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
