/**
 * Draft Import Service
 * Business logic for validating and executing draft imports
 */

import { randomUUID } from "crypto";
import { prisma } from "./prisma";
import { findMLETeamByName } from "./mleTeamMapper";
import { ColumnData, ValidationError } from "./csvParser";
import { generateFantasyTeamId, generateRosterSlotId } from "./id-generator";
import type { User, FantasyLeague, FantasyTeam } from "@prisma/client";

export interface TeamPreview {
  discordId: string;
  displayName: string;
  draftPosition: number;
  picks: string[];
  userExists: boolean;
  teamExists: boolean;
  validPicks: number;
  invalidPicks: string[];
  userId?: string;
}

export interface ImportValidation {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  preview: {
    totalTeams: number;
    totalPicks: number;
    teams: TeamPreview[];
  };
}

export interface ImportResult {
  usersCreated: number;
  usersFound: number;
  teamsCreated: number;
  teamsUpdated: number;
  draftPicksCreated: number;
  rosterSlotsCreated: number;
}

/**
 * Generate a 3-character short code from a team name
 * Takes first 3 letters or first letters of each word
 */
function generateShortCode(teamName: string): string {
  const cleaned = teamName.trim().toUpperCase().replace(/[^A-Z0-9\s]/g, '');

  // If team name has multiple words, use first letter of each word
  const words = cleaned.split(/\s+/).filter(w => w.length > 0);
  if (words.length >= 3) {
    return words.slice(0, 3).map(w => w[0]).join('');
  } else if (words.length === 2) {
    // Two words: first letter of first word + first two of second
    return (words[0][0] + words[1].slice(0, 2)).slice(0, 3);
  }

  // Single word or fallback: just take first 3 characters
  const singleWord = words.join('');
  return singleWord.slice(0, 3).padEnd(3, 'X');
}

/**
 * Validate import data before executing
 */
export async function validateImportData(
  columns: ColumnData[],
  leagueId: string
): Promise<ImportValidation> {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const teams: TeamPreview[] = [];

  try {
    // Fetch league
    const league = await prisma.fantasyLeague.findUnique({
      where: { id: leagueId },
      include: {
        fantasyTeams: {
          include: {
            owner: true
          }
        },
        draftPicks: true
      }
    });

    if (!league) {
      errors.push({
        type: 'error',
        message: `League "${leagueId}" not found`
      });
      return {
        valid: false,
        errors,
        warnings,
        preview: { totalTeams: 0, totalPicks: 0, teams: [] }
      };
    }

    // Check if league capacity will be exceeded
    if (columns.length > league.maxTeams) {
      errors.push({
        type: 'error',
        message: `League only has space for ${league.maxTeams} teams, but CSV has ${columns.length} teams`
      });
    }

    // Warn if league already has draft picks
    if (league.draftPicks.length > 0) {
      warnings.push({
        type: 'warning',
        message: `League already has ${league.draftPicks.length} draft picks. Import will replace them.`
      });
    }

    // Check if draft is in progress
    if (league.draftStatus === 'in_progress') {
      errors.push({
        type: 'error',
        message: 'Cannot import draft while draft is in progress. Please complete or cancel existing draft first.'
      });
    }

    // Validate each team
    for (const column of columns) {
      const invalidPicks: string[] = [];
      let validPicks = 0;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { discordId: column.discordId }
      });

      // Check if team exists in league
      const existingTeam = league.fantasyTeams.find(
        t => t.ownerUserId === existingUser?.id
      );

      // Validate MLE team names
      for (const pick of column.picks) {
        if (pick && pick.trim() !== '') {
          const mleTeam = findMLETeamByName(pick);
          if (mleTeam) {
            validPicks++;
          } else {
            invalidPicks.push(pick);
            errors.push({
              type: 'error',
              column: column.columnIndex,
              field: 'picks',
              message: `Could not find MLE team "${pick}". Valid formats: "AL Bulls", "ALBulls", "Bulls"`
            });
          }
        }
      }

      // Warn if user will be created
      if (!existingUser) {
        warnings.push({
          type: 'warning',
          column: column.columnIndex,
          field: 'discordId',
          message: `User with Discord ID "${column.discordId}" will be created`
        });
      }

      // Warn if team exists and will be updated
      if (existingTeam) {
        warnings.push({
          type: 'warning',
          column: column.columnIndex,
          field: 'team',
          message: `Team "${existingTeam.displayName}" already exists and will be updated`
        });
      }

      teams.push({
        discordId: column.discordId,
        displayName: column.teamName,
        draftPosition: column.draftPosition,
        picks: column.picks,
        userExists: !!existingUser,
        teamExists: !!existingTeam,
        validPicks,
        invalidPicks,
        userId: existingUser?.id
      });
    }

    // Check for duplicate team names in CSV
    const teamNames = columns.map(c => c.teamName.toLowerCase());
    const duplicateNames = teamNames.filter((name, index) => teamNames.indexOf(name) !== index);
    const uniqueDuplicateNames = [...new Set(duplicateNames)];

    uniqueDuplicateNames.forEach(dupName => {
      warnings.push({
        type: 'warning',
        field: 'teamName',
        message: `Team name "${dupName}" appears multiple times`
      });
    });

    const totalPicks = columns.reduce((sum, c) => sum + c.picks.filter(p => p !== '').length, 0);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      preview: {
        totalTeams: columns.length,
        totalPicks,
        teams
      }
    };

  } catch (error) {
    errors.push({
      type: 'error',
      message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });

    return {
      valid: false,
      errors,
      warnings,
      preview: { totalTeams: 0, totalPicks: 0, teams: [] }
    };
  }
}

/**
 * Execute the draft import in a transaction
 */
export async function executeImport(
  columns: ColumnData[],
  leagueId: string,
  createRosterSlots: boolean = true
): Promise<ImportResult> {
  const result: ImportResult = {
    usersCreated: 0,
    usersFound: 0,
    teamsCreated: 0,
    teamsUpdated: 0,
    draftPicksCreated: 0,
    rosterSlotsCreated: 0
  };

  await prisma.$transaction(async (tx) => {
    // Fetch league first
    const league = await tx.fantasyLeague.findUnique({
      where: { id: leagueId }
    });

    if (!league) {
      throw new Error(`League "${leagueId}" not found`);
    }

    // Step 1: Create/find all users
    const userMap = new Map<string, User>();

    for (const column of columns) {
      const existingUser = await tx.user.findUnique({
        where: { discordId: column.discordId }
      });

      if (existingUser) {
        userMap.set(column.discordId, existingUser);
        result.usersFound++;
      } else {
        const newUser = await tx.user.create({
          data: {
            id: randomUUID(),
            discordId: column.discordId,
            displayName: column.teamName || `User-${column.discordId}`,
            role: 'user',
            status: 'active'
          }
        });
        userMap.set(column.discordId, newUser);
        result.usersCreated++;
      }
    }

    // Step 2: Upsert all fantasy teams
    const teamMap = new Map<string, FantasyTeam>();

    for (const column of columns) {
      const user = userMap.get(column.discordId)!;
      const teamId = generateFantasyTeamId(leagueId, user.id);

      // Check if team exists
      const existingTeam = await tx.fantasyTeam.findUnique({
        where: {
          fantasyLeagueId_ownerUserId: {
            fantasyLeagueId: leagueId,
            ownerUserId: user.id
          }
        }
      });

      const shortCode = generateShortCode(column.teamName);

      if (existingTeam) {
        // Update existing team
        const updatedTeam = await tx.fantasyTeam.update({
          where: {
            id: existingTeam.id
          },
          data: {
            displayName: column.teamName,
            shortCode,
            draftPosition: column.draftPosition
          }
        });
        teamMap.set(column.discordId, updatedTeam);
        result.teamsUpdated++;
      } else {
        // Create new team
        const newTeam = await tx.fantasyTeam.create({
          data: {
            id: teamId,
            fantasyLeagueId: leagueId,
            ownerUserId: user.id,
            displayName: column.teamName,
            shortCode,
            draftPosition: column.draftPosition,
            faabRemaining: league.waiverSystem === 'faab' ? league.faabBudget : null,
            waiverPriority: league.waiverSystem !== 'faab' ? column.draftPosition : null
          }
        });
        teamMap.set(column.discordId, newTeam);
        result.teamsCreated++;
      }
    }

    // Step 3: Delete existing draft picks for league
    await tx.draftPick.deleteMany({
      where: { fantasyLeagueId: leagueId }
    });

    // Step 4: Create draft picks in snake order
    const numTeams = columns.length;
    const numRounds = 8;
    let overallPick = 1;

    for (let round = 1; round <= numRounds; round++) {
      const isEvenRound = round % 2 === 0;
      const shouldReverse = league.draftType === 'snake' && isEvenRound;

      // Order teams for this round
      const orderedColumns = shouldReverse ? [...columns].reverse() : columns;

      for (let i = 0; i < orderedColumns.length; i++) {
        const column = orderedColumns[i];
        const fantasyTeam = teamMap.get(column.discordId)!;
        const pickIndex = round - 1; // 0-indexed
        const mleTeamName = column.picks[pickIndex];
        const mleTeam = mleTeamName ? findMLETeamByName(mleTeamName) : null;

        await tx.draftPick.create({
          data: {
            fantasyLeagueId: leagueId,
            round,
            pickNumber: i + 1,
            overallPick,
            fantasyTeamId: fantasyTeam.id,
            mleTeamId: mleTeam?.id || null,
            pickedAt: new Date()
          }
        });

        result.draftPicksCreated++;
        overallPick++;
      }
    }

    // Step 5: Optionally create roster slots for week 1
    if (createRosterSlots) {
      // Get roster configuration
      const rosterConfig = league.rosterConfig as any || { "2s": 2, "3s": 2, "flx": 1, "be": 3 };

      for (const column of columns) {
        const fantasyTeam = teamMap.get(column.discordId)!;

        // Delete existing week 1 slots for this team
        await tx.rosterSlot.deleteMany({
          where: {
            fantasyTeamId: fantasyTeam.id,
            week: 1
          }
        });

        // Distribute picks across roster positions
        let pickIndex = 0;
        const positions: Array<{ position: string; count: number }> = [
          { position: '2s', count: rosterConfig['2s'] || 0 },
          { position: '3s', count: rosterConfig['3s'] || 0 },
          { position: 'flx', count: rosterConfig.flx || 0 },
          { position: 'be', count: rosterConfig.be || 0 }
        ];

        for (const posConfig of positions) {
          for (let slotIndex = 0; slotIndex < posConfig.count; slotIndex++) {
            const mleTeamName = column.picks[pickIndex];

            // If we have a team for this pick
            if (mleTeamName && mleTeamName.trim() !== '') {
              const mleTeam = findMLETeamByName(mleTeamName);
              if (mleTeam) {
                // Check if MLE team exists in database
                const mleTeamExists = await tx.mLETeam.findUnique({
                  where: { id: mleTeam.id }
                });

                if (mleTeamExists) {
                  await tx.rosterSlot.create({
                    data: {
                      id: generateRosterSlotId(fantasyTeam.id, 1, posConfig.position, slotIndex),
                      fantasyTeamId: fantasyTeam.id,
                      mleTeamId: mleTeam.id,
                      week: 1,
                      position: posConfig.position,
                      slotIndex: slotIndex,
                      isLocked: false
                    }
                  });
                  result.rosterSlotsCreated++;
                }
              }
            }

            pickIndex++;
            if (pickIndex >= column.picks.length) break;
          }
          if (pickIndex >= column.picks.length) break;
        }
      }
    }

    // Step 6: Update league draft status
    await tx.fantasyLeague.update({
      where: { id: leagueId },
      data: {
        draftStatus: 'completed',
        draftPickDeadline: null
      }
    });
  }, {
    maxWait: 30000, // 30 seconds max wait time
    timeout: 60000  // 60 seconds timeout
  });

  return result;
}
