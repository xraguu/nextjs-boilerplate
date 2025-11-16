"use client";

import { useState } from "react";
import { TEAMS } from "@/lib/teams";
import Image from "next/image";

// Mock waiver claims data
const mockWaiverClaims = [
  { id: "w1", priority: 1, manager: "Nick", teamName: "Nick's Bumps", addTeam: TEAMS[5], dropTeam: TEAMS[12], status: "pending", submitted: "2025-11-15 3:45 AM", faabBid: null },
  { id: "w2", priority: 2, manager: "Rover", teamName: "Rover's Rockets", addTeam: TEAMS[8], dropTeam: TEAMS[15], status: "pending", submitted: "2025-11-15 4:12 AM", faabBid: 25 },
  { id: "w3", priority: 3, manager: "FlipReset", teamName: "Ceiling Shot Squad", addTeam: TEAMS[2], dropTeam: TEAMS[18], status: "pending", submitted: "2025-11-15 5:20 AM", faabBid: null },
  { id: "w4", priority: 4, manager: "AirDribbler", teamName: "Musty Flick Masters", addTeam: TEAMS[11], dropTeam: TEAMS[22], status: "pending", submitted: "2025-11-15 6:15 AM", faabBid: 18 },
  { id: "w5", priority: 5, manager: "SpeedDemon", teamName: "Boost Stealers", addTeam: TEAMS[14], dropTeam: TEAMS[25], status: "pending", submitted: "2025-11-15 7:30 AM", faabBid: null },
  { id: "w6", priority: 6, manager: "MustyCrew", teamName: "Demo Kings", addTeam: TEAMS[6], dropTeam: TEAMS[28], status: "pending", submitted: "2025-11-15 8:45 AM", faabBid: 12 },
  { id: "w7", priority: 7, manager: "CeilingShotz", teamName: "Aerial Aces", addTeam: TEAMS[3], dropTeam: TEAMS[31], status: "pending", submitted: "2025-11-15 10:00 AM", faabBid: null },
  { id: "w8", priority: 8, manager: "WaveDash", teamName: "Speed Flip Squad", addTeam: TEAMS[9], dropTeam: TEAMS[34], status: "pending", submitted: "2025-11-15 11:20 AM", faabBid: 30 },
];

const mockProcessedWaivers = [
  { id: "pw1", manager: "BoostBoy", teamName: "Kickoff Kings", addTeam: TEAMS[4], dropTeam: TEAMS[10], status: "approved", processed: "2025-11-14 3:00 AM", reason: null },
  { id: "pw2", manager: "DemoLord", teamName: "Bumper Cars", addTeam: TEAMS[7], dropTeam: TEAMS[13], status: "approved", processed: "2025-11-14 3:00 AM", reason: null },
  { id: "pw3", manager: "SaveGod", teamName: "Wall Warriors", addTeam: TEAMS[1], dropTeam: TEAMS[16], status: "denied", processed: "2025-11-14 3:00 AM", reason: "Lower priority" },
  { id: "pw4", manager: "FlipMaster", teamName: "Reset Rookies", addTeam: TEAMS[20], dropTeam: TEAMS[23], status: "failed", processed: "2025-11-14 3:00 AM", reason: "Team already rostered" },
  { id: "pw5", manager: "Nick", teamName: "Nick's Bumps", addTeam: TEAMS[0], dropTeam: TEAMS[19], status: "approved", processed: "2025-11-14 3:00 AM", reason: null },
];

export default function ProcessWaiversPage() {
  const [claims, setClaims] = useState(mockWaiverClaims);
  const [processed, setProcessed] = useState(mockProcessedWaivers);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const processAllWaivers = () => {
    const newProcessed = claims.map((claim) => ({
      ...claim,
      status: "approved" as const,
      processed: new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      reason: null,
    }));

    setProcessed([...newProcessed, ...processed]);
    setClaims([]);
    setShowConfirmModal(false);
    alert(`Successfully processed ${newProcessed.length} waiver claims!`);
  };

  const approveClaim = (id: string) => {
    const claim = claims.find((c) => c.id === id);
    if (claim) {
      setProcessed([
        {
          ...claim,
          status: "approved",
          processed: new Date().toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
          reason: null,
        },
        ...processed,
      ]);
      setClaims(claims.filter((c) => c.id !== id));
      alert("Waiver claim approved!");
    }
  };

  const denyClaim = (id: string) => {
    const claim = claims.find((c) => c.id === id);
    if (claim) {
      setProcessed([
        {
          ...claim,
          status: "denied",
          processed: new Date().toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
          reason: "Manually denied by admin",
        },
        ...processed,
      ]);
      setClaims(claims.filter((c) => c.id !== id));
      alert("Waiver claim denied!");
    }
  };

  return (
    <div>
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <>
          <div
            className="modal-backdrop"
            onClick={() => setShowConfirmModal(false)}
          />
          <div
            className="modal"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
              maxWidth: "500px",
              width: "90%",
            }}
          >
            <div className="card" style={{ padding: "2rem" }}>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  marginBottom: "1rem",
                  color: "var(--accent)",
                }}
              >
                Process All Waivers
              </h2>
              <p
                style={{
                  fontSize: "1rem",
                  color: "var(--text-muted)",
                  marginBottom: "2rem",
                  lineHeight: 1.6,
                }}
              >
                Are you sure you want to process all {claims.length} pending waiver
                claims? This action cannot be undone.
              </p>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  className="btn btn-ghost"
                  style={{ flex: 1 }}
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={processAllWaivers}
                >
                  Process All
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Header with Process All Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.9rem",
              color: "var(--text-muted)",
              marginBottom: "0.25rem",
            }}
          >
            Waiver Period Status
          </div>
          <div
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--accent)",
            }}
          >
            {claims.length} Pending Claims
          </div>
        </div>
        <button
          className="btn btn-primary"
          style={{ padding: "0.75rem 2rem", fontSize: "1.05rem" }}
          onClick={() => setShowConfirmModal(true)}
          disabled={claims.length === 0}
        >
          📋 Process All Waivers
        </button>
      </div>

      {/* Pending Waivers */}
      <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
            color: "var(--text-main)",
          }}
        >
          Pending Waiver Claims
        </h2>
        {claims.length === 0 ? (
          <div
            style={{
              padding: "3rem 2rem",
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            <p style={{ fontSize: "1.1rem" }}>No pending waiver claims</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
                <th
                  style={{
                    padding: "0.75rem 0.5rem",
                    textAlign: "center",
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                    width: "60px",
                  }}
                >
                  #
                </th>
                <th
                  style={{
                    padding: "0.75rem 0.5rem",
                    textAlign: "left",
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                  }}
                >
                  Manager
                </th>
                <th
                  style={{
                    padding: "0.75rem 0.5rem",
                    textAlign: "left",
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                  }}
                >
                  Add Team
                </th>
                <th
                  style={{
                    padding: "0.75rem 0.5rem",
                    textAlign: "left",
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                  }}
                >
                  Drop Team
                </th>
                <th
                  style={{
                    padding: "0.75rem 0.5rem",
                    textAlign: "center",
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                  }}
                >
                  FAAB Bid
                </th>
                <th
                  style={{
                    padding: "0.75rem 0.5rem",
                    textAlign: "left",
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                  }}
                >
                  Submitted
                </th>
                <th
                  style={{
                    padding: "0.75rem 0.5rem",
                    textAlign: "right",
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr
                  key={claim.id}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <td
                    style={{
                      padding: "0.75rem 0.5rem",
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      color: "var(--accent)",
                    }}
                  >
                    {claim.priority}
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem" }}>
                    <div style={{ fontWeight: 600 }}>{claim.manager}</div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {claim.teamName}
                    </div>
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Image
                        src={claim.addTeam.logoPath}
                        alt={claim.addTeam.name}
                        width={24}
                        height={24}
                        style={{ borderRadius: "4px" }}
                      />
                      <span style={{ fontWeight: 600 }}>
                        {claim.addTeam.leagueId} {claim.addTeam.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Image
                        src={claim.dropTeam.logoPath}
                        alt={claim.dropTeam.name}
                        width={24}
                        height={24}
                        style={{ borderRadius: "4px" }}
                      />
                      <span style={{ fontWeight: 600 }}>
                        {claim.dropTeam.leagueId} {claim.dropTeam.name}
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "0.75rem 0.5rem",
                      textAlign: "center",
                      fontWeight: 600,
                      color: claim.faabBid ? "var(--accent)" : "var(--text-muted)",
                    }}
                  >
                    {claim.faabBid ? `$${claim.faabBid}` : "-"}
                  </td>
                  <td
                    style={{
                      padding: "0.75rem 0.5rem",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    {claim.submitted}
                  </td>
                  <td
                    style={{
                      padding: "0.75rem 0.5rem",
                      textAlign: "right",
                    }}
                  >
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <button
                        className="btn btn-primary"
                        style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}
                        onClick={() => approveClaim(claim.id)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}
                        onClick={() => denyClaim(claim.id)}
                      >
                        Deny
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Processed Waivers History */}
      <div className="card" style={{ padding: "1.5rem" }}>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
            color: "var(--text-main)",
          }}
        >
          Recently Processed Waivers
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
              <th
                style={{
                  padding: "0.75rem 0.5rem",
                  textAlign: "left",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Manager
              </th>
              <th
                style={{
                  padding: "0.75rem 0.5rem",
                  textAlign: "left",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Add Team
              </th>
              <th
                style={{
                  padding: "0.75rem 0.5rem",
                  textAlign: "left",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Drop Team
              </th>
              <th
                style={{
                  padding: "0.75rem 0.5rem",
                  textAlign: "center",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Status
              </th>
              <th
                style={{
                  padding: "0.75rem 0.5rem",
                  textAlign: "left",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Processed
              </th>
            </tr>
          </thead>
          <tbody>
            {processed.map((claim) => (
              <tr
                key={claim.id}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <td style={{ padding: "0.75rem 0.5rem" }}>
                  <div style={{ fontWeight: 600 }}>{claim.manager}</div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    {claim.teamName}
                  </div>
                </td>
                <td style={{ padding: "0.75rem 0.5rem" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Image
                      src={claim.addTeam.logoPath}
                      alt={claim.addTeam.name}
                      width={24}
                      height={24}
                      style={{ borderRadius: "4px" }}
                    />
                    <span style={{ fontWeight: 600 }}>
                      {claim.addTeam.leagueId} {claim.addTeam.name}
                    </span>
                  </div>
                </td>
                <td style={{ padding: "0.75rem 0.5rem" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Image
                      src={claim.dropTeam.logoPath}
                      alt={claim.dropTeam.name}
                      width={24}
                      height={24}
                      style={{ borderRadius: "4px" }}
                    />
                    <span style={{ fontWeight: 600 }}>
                      {claim.dropTeam.leagueId} {claim.dropTeam.name}
                    </span>
                  </div>
                </td>
                <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                  <span
                    style={{
                      padding: "0.4rem 1rem",
                      borderRadius: "20px",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      background:
                        claim.status === "approved"
                          ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                          : claim.status === "denied"
                          ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                          : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                      color: "white",
                    }}
                  >
                    {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                  </span>
                </td>
                <td
                  style={{
                    padding: "0.75rem 0.5rem",
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                  }}
                >
                  <div>{claim.processed}</div>
                  {claim.reason && (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        fontStyle: "italic",
                        marginTop: "0.25rem",
                      }}
                    >
                      {claim.reason}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
