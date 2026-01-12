/**
 * Utility functions for generating readable, meaningful IDs
 */

/**
 * Generate a random alphanumeric code
 * @param letterCount - Number of random letters
 * @param numberCount - Number of random numbers
 * @returns Random code like "ABC12"
 */
export function generateRandomCode(letterCount: number, numberCount: number): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';

  let code = '';

  // Add random letters
  for (let i = 0; i < letterCount; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  // Add random numbers
  for (let i = 0; i < numberCount; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  return code;
}

/**
 * Sanitize a string to be used in an ID
 * - Remove special characters
 * - Replace spaces with nothing
 * - Convert to lowercase (except where specified)
 */
function sanitizeForId(str: string, options?: { preserveCase?: boolean }): string {
  let sanitized = str
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, ''); // Remove spaces

  if (!options?.preserveCase) {
    sanitized = sanitized.toLowerCase();
  }

  return sanitized;
}

/**
 * Generate a Fantasy League ID
 * Format: [Season][LeagueName]-[3RandomLetters][2RandomNumbers]
 * Example: "2025Alpha-ABC12"
 *
 * @param season - The season year
 * @param leagueName - The league name
 * @returns Formatted league ID
 */
export function generateFantasyLeagueId(season: number, leagueName: string): string {
  const sanitizedName = sanitizeForId(leagueName, { preserveCase: true });
  const randomCode = generateRandomCode(3, 2);

  return `${season}${sanitizedName}-${randomCode}`;
}

/**
 * Extract the league code from a Fantasy League ID
 * Example: "2025Alpha-ABC12" -> "ABC12"
 */
export function extractLeagueCode(fantasyLeagueId: string): string {
  const parts = fantasyLeagueId.split('-');
  return parts[parts.length - 1]; // Get the last part (the random code)
}

/**
 * Generate a Fantasy Team ID
 * Format: [FantasyLeagueID]-[UserID]
 * Example: "2025Alpha-ABC12-uuid-string"
 *
 * @param fantasyLeagueId - The fantasy league ID
 * @param userId - The owner's user ID (UUID string)
 * @returns Formatted team ID
 */
export function generateFantasyTeamId(
  fantasyLeagueId: string,
  userId: string
): string {
  return `${fantasyLeagueId}-${userId}`;
}

/**
 * User IDs are UUIDs
 * This function is kept for compatibility but is not used
 * Use randomUUID() from crypto module to generate user IDs
 */
export function generateUserId(): string {
  throw new Error("User IDs are now UUIDs. Use randomUUID() from crypto module instead.");
}

/**
 * Validate a Fantasy League ID format
 */
export function isValidFantasyLeagueId(id: string): boolean {
  // Format: [Season][LeagueName]-[3Letters][2Numbers]
  const pattern = /^\d{4}[a-zA-Z]+-[A-Z]{3}\d{2}$/;
  return pattern.test(id);
}

/**
 * Validate a Fantasy Team ID format
 */
export function isValidFantasyTeamId(id: string): boolean {
  // Format: [FantasyLeagueID]-[UserID]
  // FantasyLeagueID: [Season][LeagueName]-[3Letters][2Numbers]
  // UserID: 1 or more digits
  const pattern = /^\d{4}[a-zA-Z]+-[A-Z]{3}\d{2}-\d+$/;
  return pattern.test(id);
}

/**
 * Generate a Roster Slot ID
 * Format: [FantasyTeamID]-W[Week]-[Position]-[SlotIndex]
 * Example: "2025Alpha-ABC12-1-W1-starter-0"
 *
 * @param fantasyTeamId - The fantasy team ID
 * @param week - The week number
 * @param position - The position (e.g., "starter", "bench")
 * @param slotIndex - The slot index within the position
 * @returns Formatted roster slot ID
 */
export function generateRosterSlotId(
  fantasyTeamId: string,
  week: number,
  position: string,
  slotIndex: number
): string {
  return `${fantasyTeamId}-W${week}-${position}-${slotIndex}`;
}

/**
 * Validate a Roster Slot ID format
 */
export function isValidRosterSlotId(id: string): boolean {
  // Format: [FantasyTeamID]-W[Week]-[Position]-[SlotIndex]
  const pattern = /^\d{4}[a-zA-Z]+-[A-Z]{3}\d{2}-\d+-W\d+-[a-zA-Z]+-\d+$/;
  return pattern.test(id);
}
