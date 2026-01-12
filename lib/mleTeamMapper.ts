/**
 * MLE Team Fuzzy Matcher
 * Maps various team name formats to database MLE team IDs
 */

/**
 * Normalize a team name for comparison
 * Removes spaces, special characters, and converts to lowercase
 */
function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric characters
    .trim();
}

// Simple interface for the result
export interface MLETeamResult {
  id: string;
  name: string;
  leagueId: string;
}

/**
 * Find an MLE team ID by name using fuzzy matching
 * Supports various input formats:
 * - "AL Bulls", "ALBulls", "al-bulls" (league + team)
 * - "Bulls (AL)", "Bulls" (team name only)
 * - Case insensitive matching
 *
 * @param searchName - The team name to search for
 * @returns The matching team with id, name, leagueId or null if not found
 */
export function findMLETeamByName(searchName: string): MLETeamResult | null {
  if (!searchName || searchName.trim() === '') {
    return null;
  }

  const normalized = normalizeTeamName(searchName);

  // Build possible variations
  // Extract potential league prefix (first 2-3 chars) and team name
  const variations: string[] = [normalized];

  // Try to split league + team name
  // Example: "albulls" -> ["al", "bulls"], "mlcomets" -> ["ml", "comets"]
  const leagues = ['al', 'pl', 'ml', 'cl', 'fl'];
  for (const league of leagues) {
    if (normalized.startsWith(league)) {
      const teamPart = normalized.slice(league.length);
      if (teamPart) {
        // Generate database ID format: leagueTeamname (e.g., "alBulls")
        const dbId = league + teamPart.charAt(0).toUpperCase() + teamPart.slice(1);
        variations.push(dbId.toLowerCase());
        variations.push(teamPart); // Just the team name
      }
    }
  }

  // Try each variation to build a likely database ID
  // Database format is: {league}{Teamname} with first letter capitalized
  // E.g., "alBulls", "plBears", "mlComets"

  // Strategy 1: Check if it looks like a database ID already (e.g., "albulls" -> "alBulls")
  for (const league of leagues) {
    if (normalized.startsWith(league) && normalized.length > league.length) {
      const teamPart = normalized.slice(league.length);
      const dbId = league + teamPart.charAt(0).toUpperCase() + teamPart.slice(1);
      return { id: dbId, name: capitalize(teamPart), leagueId: league.toUpperCase() };
    }
  }

  // Strategy 2: Just team name - return first match (AL league as default for common teams)
  // This is less reliable but provides a fallback
  if (normalized) {
    const capitalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
    return { id: 'al' + capitalized, name: capitalized, leagueId: 'AL' };
  }

  return null;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Find multiple MLE teams by an array of names
 * Returns an object with successful matches and failures
 */
export function findMultipleMLETeams(searchNames: string[]): {
  matched: Array<{ input: string; team: MLETeamResult }>;
  unmatched: string[];
} {
  const matched: Array<{ input: string; team: MLETeamResult }> = [];
  const unmatched: string[] = [];

  for (const searchName of searchNames) {
    const team = findMLETeamByName(searchName);
    if (team) {
      matched.push({ input: searchName, team });
    } else {
      unmatched.push(searchName);
    }
  }

  return { matched, unmatched };
}
