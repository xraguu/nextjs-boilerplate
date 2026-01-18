import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { parseColumnBasedCSV, validateCSVStructure } from "@/lib/csvParser";
import { validateImportData, executeImport } from "@/lib/draftImportService";

/**
 * POST /api/admin/leagues/[leagueId]/import-draft
 * Import draft results from CSV file
 *
 * Request (multipart/form-data):
 * - csvFile: File
 * - preview: "true" | "false" (default: "false")
 * - createRosterSlots: "true" | "false" (default: "true")
 *
 * Response for preview=true:
 * {
 *   valid: boolean,
 *   errors: ValidationError[],
 *   warnings: ValidationError[],
 *   preview: { ... }
 * }
 *
 * Response for preview=false:
 * {
 *   success: boolean,
 *   result: ImportResult,
 *   errors: ValidationError[]
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ leagueId: string }> }
) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leagueId } = await params;

    // Parse form data
    const formData = await request.formData();
    const csvFile = formData.get("csvFile") as File | null;
    const preview = formData.get("preview") === "true";
    const createRosterSlots = formData.get("createRosterSlots") !== "false"; // default true

    // Validate file exists
    if (!csvFile) {
      return NextResponse.json(
        { error: "CSV file is required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!csvFile.name.endsWith(".csv") && csvFile.type !== "text/csv") {
      return NextResponse.json(
        { error: "File must be a CSV (.csv)" },
        { status: 400 }
      );
    }

    // Read file content
    const csvContent = await csvFile.text();

    // Early validation
    const structureErrors = validateCSVStructure(csvContent);
    if (structureErrors.length > 0) {
      return NextResponse.json(
        {
          valid: false,
          errors: structureErrors,
          warnings: [],
          preview: { totalTeams: 0, totalPicks: 0, teams: [] }
        },
        { status: 400 }
      );
    }

    // Parse CSV
    const { columns, errors: parseErrors } = parseColumnBasedCSV(csvContent);

    if (parseErrors.length > 0) {
      console.error('CSV Parse Errors:', parseErrors);
      return NextResponse.json(
        {
          valid: false,
          errors: parseErrors,
          warnings: [],
          preview: { totalTeams: 0, totalPicks: 0, teams: [] }
        },
        { status: 400 }
      );
    }

    console.log('CSV parsed successfully:', columns.length, 'teams');

    // Validate import data
    console.log('Starting validation for league:', leagueId);
    const validation = await validateImportData(columns, leagueId);
    console.log('Validation complete. Valid:', validation.valid, 'Errors:', validation.errors.length);

    // If preview mode, return validation results
    if (preview) {
      return NextResponse.json(validation);
    }

    // If not valid, don't proceed with import
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          errors: validation.errors,
          result: null
        },
        { status: 400 }
      );
    }

    // Execute import
    try {
      const result = await executeImport(columns, leagueId, createRosterSlots);

      return NextResponse.json(
        {
          success: true,
          result,
          errors: []
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error executing draft import:", error);

      return NextResponse.json(
        {
          success: false,
          errors: [
            {
              type: 'error' as const,
              message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          result: null
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Error processing draft import:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      {
        error: "Failed to process draft import",
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
