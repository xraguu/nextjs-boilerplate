/**
 * CSV Parser for Draft Import
 * Parses column-based CSV format from Google Sheets
 */

import { parse } from "csv-parse/sync";

export interface ColumnData {
  columnIndex: number;      // 0-based (A=0, B=1, etc.)
  discordId: string;
  teamName: string;
  picks: string[];          // 8 picks (may have fewer if CSV is incomplete)
  draftPosition: number;    // columnIndex + 1
}

export interface ValidationError {
  type: 'error' | 'warning';
  column?: number;          // Column index (0-based)
  row?: number;             // Row index (0-based)
  field?: string;           // Field name
  message: string;
}

export interface ParsedDraftData {
  columns: ColumnData[];
  errors: ValidationError[];
}

/**
 * Parse column-based CSV content
 * Expected format:
 * - Row 0: Discord IDs
 * - Row 1: Team Names
 * - Rows 2-9: Draft picks (8 rounds)
 *
 * @param csvContent - Raw CSV file content as string
 * @returns Parsed draft data with validation errors
 */
export function parseColumnBasedCSV(csvContent: string): ParsedDraftData {
  const errors: ValidationError[] = [];
  const columns: ColumnData[] = [];

  try {
    // Remove BOM if present (UTF-8 BOM from Excel/Google Sheets)
    const cleanContent = csvContent.replace(/^\uFEFF/, '');

    // Parse CSV into rows
    const rows: string[][] = parse(cleanContent, {
      skip_empty_lines: false,
      relax_column_count: true, // Allow rows with different column counts
      trim: true,
    });

    // Validate minimum structure
    if (rows.length === 0) {
      errors.push({
        type: 'error',
        message: 'CSV file is empty'
      });
      return { columns, errors };
    }

    if (rows.length < 2) {
      errors.push({
        type: 'error',
        message: 'CSV must have at least 2 rows (Discord ID and Team Name)'
      });
      return { columns, errors };
    }

    // Determine number of columns (teams)
    const numColumns = Math.max(...rows.map(row => row.length));

    if (numColumns === 0) {
      errors.push({
        type: 'error',
        message: 'No columns found in CSV'
      });
      return { columns, errors };
    }

    // Transpose rows to columns and extract data
    for (let colIdx = 0; colIdx < numColumns; colIdx++) {
      const discordId = rows[0]?.[colIdx]?.trim() || '';

      // Stop at first empty Discord ID (indicates end of data)
      if (!discordId) {
        break;
      }

      const teamName = rows[1]?.[colIdx]?.trim() || '';
      const picks: string[] = [];

      // Extract picks from rows 2-9 (8 rounds)
      for (let pickIdx = 2; pickIdx <= 9; pickIdx++) {
        const pick = rows[pickIdx]?.[colIdx]?.trim() || '';
        picks.push(pick);
      }

      // Validate Discord ID format (18-19 digits)
      if (!/^\d{17,20}$/.test(discordId)) {
        errors.push({
          type: 'error',
          column: colIdx,
          row: 0,
          field: 'discordId',
          message: `Invalid Discord ID format: "${discordId}". Expected 18-19 digit number.`
        });
      }

      // Validate team name
      if (!teamName) {
        errors.push({
          type: 'error',
          column: colIdx,
          row: 1,
          field: 'teamName',
          message: `Team name is required for column ${colIdx + 1}`
        });
      }

      // Warn if less than 8 picks
      const validPicks = picks.filter(p => p !== '').length;
      if (validPicks < 8) {
        errors.push({
          type: 'warning',
          column: colIdx,
          field: 'picks',
          message: `Team "${teamName}" has only ${validPicks} picks (expected 8)`
        });
      }

      columns.push({
        columnIndex: colIdx,
        discordId,
        teamName,
        picks,
        draftPosition: colIdx + 1
      });
    }

    // Check for duplicate Discord IDs
    const discordIds = columns.map(c => c.discordId);
    const duplicates = discordIds.filter((id, index) => discordIds.indexOf(id) !== index);
    const uniqueDuplicates = [...new Set(duplicates)];

    uniqueDuplicates.forEach(dupId => {
      const indices = columns
        .map((c, i) => c.discordId === dupId ? i : -1)
        .filter(i => i !== -1);

      errors.push({
        type: 'error',
        field: 'discordId',
        message: `Discord ID "${dupId}" appears multiple times in columns: ${indices.map(i => i + 1).join(', ')}`
      });
    });

    // Validate we have at least one team
    if (columns.length === 0) {
      errors.push({
        type: 'error',
        message: 'No teams found in CSV. Make sure Discord IDs are in the first row.'
      });
    }

  } catch (error) {
    errors.push({
      type: 'error',
      message: `Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }

  return { columns, errors };
}

/**
 * Validate CSV structure before parsing
 * Returns early validation errors
 */
export function validateCSVStructure(csvContent: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!csvContent || csvContent.trim() === '') {
    errors.push({
      type: 'error',
      message: 'CSV content is empty'
    });
    return errors;
  }

  // Check file size (max 1MB for safety)
  const sizeInBytes = new Blob([csvContent]).size;
  if (sizeInBytes > 1024 * 1024) {
    errors.push({
      type: 'error',
      message: 'CSV file is too large (max 1MB)'
    });
  }

  return errors;
}

/**
 * Format column letter from index (0=A, 1=B, etc.)
 */
export function getColumnLetter(index: number): string {
  let letter = '';
  let num = index;

  while (num >= 0) {
    letter = String.fromCharCode(65 + (num % 26)) + letter;
    num = Math.floor(num / 26) - 1;
  }

  return letter;
}

/**
 * Get human-readable position from column index
 */
export function getColumnPosition(index: number): string {
  return `${getColumnLetter(index)}${index + 1}`;
}
