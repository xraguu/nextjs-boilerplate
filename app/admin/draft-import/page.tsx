"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface League {
  id: string;
  name: string;
  season: number;
  maxTeams: number;
  draftStatus: string;
  _count: {
    fantasyTeams: number;
    draftPicks: number;
  };
}

interface TeamPreview {
  discordId: string;
  displayName: string;
  draftPosition: number;
  picks: string[];
  userExists: boolean;
  teamExists: boolean;
  validPicks: number;
  invalidPicks: string[];
}

interface ValidationError {
  type: 'error' | 'warning';
  column?: number;
  row?: number;
  field?: string;
  message: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  preview: {
    totalTeams: number;
    totalPicks: number;
    teams: TeamPreview[];
  };
}

interface ImportResult {
  usersCreated: number;
  usersFound: number;
  teamsCreated: number;
  teamsUpdated: number;
  draftPicksCreated: number;
  rosterSlotsCreated: number;
}

export default function DraftImportPage() {
  const router = useRouter();
  const [step, setStep] = useState<'select' | 'upload' | 'preview' | 'results'>('select');
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [createRosterSlots, setCreateRosterSlots] = useState(true);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Fetch leagues on mount
  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    try {
      const response = await fetch('/api/admin/leagues');
      if (!response.ok) throw new Error('Failed to fetch leagues');
      const data = await response.json();
      setLeagues(data.leagues || []);
    } catch (err) {
      console.error('Error fetching leagues:', err);
      alert('Failed to load leagues');
    }
  };

  const handleLeagueSelect = (leagueId: string) => {
    const league = leagues.find(l => l.id === leagueId);
    setSelectedLeague(league || null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCsvFile(file);
    setError('');
  };

  const handlePreview = async () => {
    if (!selectedLeague || !csvFile) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('csvFile', csvFile);
      formData.append('preview', 'true');
      formData.append('createRosterSlots', createRosterSlots.toString());

      const response = await fetch(
        `/api/admin/leagues/${selectedLeague.id}/import-draft`,
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Preview failed');
      }

      setValidation(data);
      setStep('preview');
    } catch (err) {
      console.error('Error previewing import:', err);
      setError(err instanceof Error ? err.message : 'Failed to preview import');
      alert('Failed to preview import: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!selectedLeague || !csvFile || !validation) return;

    if (!validation.valid) {
      alert('Cannot import: validation errors present');
      return;
    }

    // Confirmation dialog
    const confirmMsg = validation.warnings.length > 0
      ? `There are ${validation.warnings.length} warnings. Continue with import?`
      : `Import ${validation.preview.totalTeams} teams with ${validation.preview.totalPicks} draft picks?`;

    if (!confirm(confirmMsg)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('csvFile', csvFile);
      formData.append('preview', 'false');
      formData.append('createRosterSlots', createRosterSlots.toString());

      const response = await fetch(
        `/api/admin/leagues/${selectedLeague.id}/import-draft`,
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Import failed');
      }

      setImportResult(data.result);
      setStep('results');
    } catch (err) {
      console.error('Error importing draft:', err);
      setError(err instanceof Error ? err.message : 'Failed to import draft');
      alert('Import failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('select');
    setSelectedLeague(null);
    setCsvFile(null);
    setValidation(null);
    setImportResult(null);
    setError('');
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "2rem" }}>
        Draft Import Tool
      </h1>

      {/* Step 1: Select League */}
      {step === 'select' && (
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            Step 1: Select League
          </h2>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Fantasy League
            </label>
            <select
              value={selectedLeague?.id || ''}
              onChange={(e) => handleLeagueSelect(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "6px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(0,0,0,0.3)",
                color: "var(--text-main)",
                fontSize: "1rem"
              }}
            >
              <option value="">-- Select a league --</option>
              {leagues.map(league => (
                <option key={league.id} value={league.id}>
                  {league.name} ({league.season}) - {league._count.fantasyTeams}/{league.maxTeams} teams
                </option>
              ))}
            </select>
          </div>

          {selectedLeague && (
            <div style={{
              padding: "1rem",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "6px",
              marginBottom: "1.5rem"
            }}>
              <p><strong>League:</strong> {selectedLeague.name}</p>
              <p><strong>Season:</strong> {selectedLeague.season}</p>
              <p><strong>Current Teams:</strong> {selectedLeague._count.fantasyTeams} / {selectedLeague.maxTeams}</p>
              <p><strong>Draft Status:</strong> {selectedLeague.draftStatus || 'not_started'}</p>
              {selectedLeague._count.draftPicks > 0 && (
                <p style={{ color: "var(--warning)", marginTop: "0.5rem" }}>
                  ⚠️ League has {selectedLeague._count.draftPicks} existing draft picks (will be replaced)
                </p>
              )}
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={() => setStep('upload')}
            disabled={!selectedLeague}
            style={{ opacity: selectedLeague ? 1 : 0.5 }}
          >
            Next: Upload CSV
          </button>
        </div>
      )}

      {/* Step 2: Upload CSV */}
      {step === 'upload' && (
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            Step 2: Upload CSV
          </h2>

          <div style={{
            padding: "1rem",
            background: "rgba(0,0,0,0.3)",
            borderRadius: "6px",
            marginBottom: "1.5rem",
            fontSize: "0.9rem"
          }}>
            <p style={{ fontWeight: "500", marginBottom: "0.5rem" }}>Expected CSV Format:</p>
            <ul style={{ marginLeft: "1.5rem", lineHeight: "1.6" }}>
              <li>Each column = 1 team</li>
              <li>Row 1: Discord ID (18-19 digits)</li>
              <li>Row 2: Team Name</li>
              <li>Rows 3-10: Draft picks (MLE team names)</li>
              <li>Column order = draft position (A=1st, B=2nd, etc.)</li>
            </ul>
            <p style={{ marginTop: "0.5rem", color: "var(--text-muted)" }}>
              MLE team formats: "AL Bulls", "ALBulls", "Bulls", etc.
            </p>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "6px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(0,0,0,0.3)",
                color: "var(--text-main)"
              }}
            />
            {csvFile && (
              <p style={{ marginTop: "0.5rem", color: "var(--text-muted)" }}>
                Selected: {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={createRosterSlots}
                onChange={(e) => setCreateRosterSlots(e.target.checked)}
                style={{ marginRight: "0.5rem" }}
              />
              <span>Create initial roster slots for week 1 (all on bench)</span>
            </label>
          </div>

          {error && (
            <div style={{
              padding: "1rem",
              background: "rgba(255,0,0,0.1)",
              border: "1px solid rgba(255,0,0,0.3)",
              borderRadius: "6px",
              color: "#ff6b6b",
              marginBottom: "1rem"
            }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              className="btn btn-ghost"
              onClick={() => setStep('select')}
            >
              Back
            </button>
            <button
              className="btn btn-primary"
              onClick={handlePreview}
              disabled={!csvFile || loading}
              style={{ opacity: csvFile && !loading ? 1 : 0.5 }}
            >
              {loading ? 'Loading...' : 'Preview Import'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview & Validation */}
      {step === 'preview' && validation && (
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            Step 3: Preview & Validation
          </h2>

          {/* Summary */}
          <div style={{
            padding: "1rem",
            background: validation.valid ? "rgba(0,255,0,0.1)" : "rgba(255,0,0,0.1)",
            border: `1px solid ${validation.valid ? 'rgba(0,255,0,0.3)' : 'rgba(255,0,0,0.3)'}`,
            borderRadius: "6px",
            marginBottom: "1.5rem"
          }}>
            <p style={{ fontWeight: "500", marginBottom: "0.5rem" }}>
              {validation.valid ? '✅ Validation Passed' : '❌ Validation Failed'}
            </p>
            <p><strong>Teams:</strong> {validation.preview.totalTeams}</p>
            <p><strong>Total Picks:</strong> {validation.preview.totalPicks}</p>
            <p><strong>Errors:</strong> {validation.errors.length}</p>
            <p><strong>Warnings:</strong> {validation.warnings.length}</p>
          </div>

          {/* Errors */}
          {validation.errors.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem", color: "#ff6b6b" }}>
                Errors ({validation.errors.length})
              </h3>
              <div style={{ maxHeight: "200px", overflow: "auto" }}>
                {validation.errors.map((err, idx) => (
                  <div key={idx} style={{
                    padding: "0.5rem",
                    background: "rgba(255,0,0,0.1)",
                    border: "1px solid rgba(255,0,0,0.2)",
                    borderRadius: "4px",
                    marginBottom: "0.5rem",
                    fontSize: "0.9rem"
                  }}>
                    {err.column !== undefined && `Column ${err.column + 1}: `}
                    {err.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {validation.warnings.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem", color: "#ffa500" }}>
                Warnings ({validation.warnings.length})
              </h3>
              <div style={{ maxHeight: "150px", overflow: "auto" }}>
                {validation.warnings.map((warn, idx) => (
                  <div key={idx} style={{
                    padding: "0.5rem",
                    background: "rgba(255,165,0,0.1)",
                    border: "1px solid rgba(255,165,0,0.2)",
                    borderRadius: "4px",
                    marginBottom: "0.5rem",
                    fontSize: "0.9rem"
                  }}>
                    {warn.column !== undefined && `Column ${warn.column + 1}: `}
                    {warn.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Teams Preview */}
          <div style={{ marginBottom: "1.5rem", overflow: "auto" }}>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
              Teams Preview
            </h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.1)" }}>
                  <th style={{ padding: "0.5rem", textAlign: "left" }}>Pos</th>
                  <th style={{ padding: "0.5rem", textAlign: "left" }}>Team Name</th>
                  <th style={{ padding: "0.5rem", textAlign: "left" }}>Discord ID</th>
                  <th style={{ padding: "0.5rem", textAlign: "center" }}>Valid Picks</th>
                  <th style={{ padding: "0.5rem", textAlign: "center" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {validation.preview.teams.map((team, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <td style={{ padding: "0.5rem" }}>{team.draftPosition}</td>
                    <td style={{ padding: "0.5rem" }}>{team.displayName}</td>
                    <td style={{ padding: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {team.discordId}
                    </td>
                    <td style={{ padding: "0.5rem", textAlign: "center" }}>
                      {team.validPicks}/8
                      {team.invalidPicks.length > 0 && (
                        <span style={{ color: "#ff6b6b", marginLeft: "0.5rem" }}>
                          ({team.invalidPicks.length} invalid)
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "0.5rem", textAlign: "center" }}>
                      {team.userExists ? (
                        <span style={{ color: "#90EE90" }}>User Exists</span>
                      ) : (
                        <span style={{ color: "#FFA500" }}>New User</span>
                      )}
                      {team.teamExists && (
                        <span style={{ color: "#FFA500", marginLeft: "0.5rem" }}>(Update)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              className="btn btn-ghost"
              onClick={() => setStep('upload')}
            >
              Back
            </button>
            <button
              className="btn btn-primary"
              onClick={handleConfirmImport}
              disabled={!validation.valid || loading}
              style={{ opacity: validation.valid && !loading ? 1 : 0.5 }}
            >
              {loading ? 'Importing...' : 'Confirm Import'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 'results' && importResult && (
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#90EE90" }}>
            ✅ Import Successful!
          </h2>

          <div style={{
            padding: "1rem",
            background: "rgba(0,255,0,0.1)",
            borderRadius: "6px",
            marginBottom: "1.5rem"
          }}>
            <p><strong>Users Created:</strong> {importResult.usersCreated}</p>
            <p><strong>Users Found:</strong> {importResult.usersFound}</p>
            <p><strong>Teams Created:</strong> {importResult.teamsCreated}</p>
            <p><strong>Teams Updated:</strong> {importResult.teamsUpdated}</p>
            <p><strong>Draft Picks Created:</strong> {importResult.draftPicksCreated}</p>
            <p><strong>Roster Slots Created:</strong> {importResult.rosterSlotsCreated}</p>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              className="btn btn-primary"
              onClick={() => router.push(`/admin/leagues/${selectedLeague?.id}`)}
            >
              View League
            </button>
            <button
              className="btn btn-ghost"
              onClick={handleReset}
            >
              Import Another Draft
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
