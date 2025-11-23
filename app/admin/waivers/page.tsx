"use client";

import { useState, useEffect } from "react";
import { TEAMS } from "@/lib/teams";
import Image from "next/image";

// Mock waiver claims data
const mockWaiverClaims = [
  {
    id: "w1",
    priority: 1,
    manager: "Nick",
    teamName: "Nick's Bumps",
    fantasyLeague: "2025-alpha",
    addTeam: TEAMS[5],
    dropTeam: TEAMS[12],
    status: "pending",
    submitted: "2025-11-15 3:45 AM",
    faabBid: null,
  },
  {
    id: "w2",
    priority: 2,
    manager: "Rover",
    teamName: "Rover's Rockets",
    fantasyLeague: "2025-beta",
    addTeam: TEAMS[8],
    dropTeam: TEAMS[15],
    status: "pending",
    submitted: "2025-11-15 4:12 AM",
    faabBid: 25,
  },
  {
    id: "w3",
    priority: 3,
    manager: "FlipReset",
    teamName: "Ceiling Shot Squad",
    fantasyLeague: "2025-alpha",
    addTeam: TEAMS[2],
    dropTeam: TEAMS[18],
    status: "pending",
    submitted: "2025-11-15 5:20 AM",
    faabBid: null,
  },
  {
    id: "w4",
    priority: 4,
    manager: "AirDribbler",
    teamName: "Musty Flick Masters",
    fantasyLeague: "2025-gamma",
    addTeam: TEAMS[11],
    dropTeam: TEAMS[22],
    status: "pending",
    submitted: "2025-11-15 6:15 AM",
    faabBid: 18,
  },
  {
    id: "w5",
    priority: 5,
    manager: "SpeedDemon",
    teamName: "Boost Stealers",
    fantasyLeague: "2025-alpha",
    addTeam: TEAMS[14],
    dropTeam: TEAMS[25],
    status: "pending",
    submitted: "2025-11-15 7:30 AM",
    faabBid: null,
  },
  {
    id: "w6",
    priority: 6,
    manager: "MustyCrew",
    teamName: "Demo Kings",
    fantasyLeague: "2025-beta",
    addTeam: TEAMS[6],
    dropTeam: TEAMS[28],
    status: "pending",
    submitted: "2025-11-15 8:45 AM",
    faabBid: 12,
  },
  {
    id: "w7",
    priority: 7,
    manager: "CeilingShotz",
    teamName: "Aerial Aces",
    fantasyLeague: "2025-gamma",
    addTeam: TEAMS[3],
    dropTeam: TEAMS[31],
    status: "pending",
    submitted: "2025-11-15 10:00 AM",
    faabBid: null,
  },
  {
    id: "w8",
    priority: 8,
    manager: "WaveDash",
    teamName: "Speed Flip Squad",
    fantasyLeague: "2025-alpha",
    addTeam: TEAMS[9],
    dropTeam: TEAMS[34],
    status: "pending",
    submitted: "2025-11-15 11:20 AM",
    faabBid: 30,
  },
];

// Mock pending trades data
const mockPendingTrades = [
  {
    id: "t1",
    fantasyLeague: "2025-alpha",
    proposer: "Nick",
    proposerTeam: "Nick's Bumps",
    receiver: "FlipReset",
    receiverTeam: "Ceiling Shot Squad",
    proposerGives: [TEAMS[0], TEAMS[5]],
    receiverGives: [TEAMS[2], TEAMS[8]],
    status: "pending",
    submitted: "2025-11-15 2:30 PM",
    vetoDeadline: "2025-11-17 3:00 AM",
  },
  {
    id: "t2",
    fantasyLeague: "2025-beta",
    proposer: "Rover",
    proposerTeam: "Rover's Rockets",
    receiver: "MustyCrew",
    receiverTeam: "Demo Kings",
    proposerGives: [TEAMS[1]],
    receiverGives: [TEAMS[6]],
    status: "pending",
    submitted: "2025-11-15 1:15 PM",
    vetoDeadline: "2025-11-17 3:00 AM",
  },
];

// Mock transaction history (all types)
const mockTransactionHistory = [
  {
    id: "th1",
    type: "waiver",
    fantasyLeague: "2025-alpha",
    manager: "BoostBoy",
    teamName: "Kickoff Kings",
    addTeam: TEAMS[4],
    dropTeam: TEAMS[10],
    status: "approved",
    processed: "2025-11-14 3:00 AM",
    reason: null,
  },
  {
    id: "th2",
    type: "waiver",
    fantasyLeague: "2025-beta",
    manager: "DemoLord",
    teamName: "Bumper Cars",
    addTeam: TEAMS[7],
    dropTeam: TEAMS[13],
    status: "approved",
    processed: "2025-11-14 3:00 AM",
    reason: null,
  },
  {
    id: "th3",
    type: "waiver",
    fantasyLeague: "2025-alpha",
    manager: "SaveGod",
    teamName: "Wall Warriors",
    addTeam: TEAMS[1],
    dropTeam: TEAMS[16],
    status: "denied",
    processed: "2025-11-14 3:00 AM",
    reason: "Lower priority",
  },
  {
    id: "th4",
    type: "trade",
    fantasyLeague: "2025-gamma",
    manager: "AirDribbler",
    teamName: "Musty Flick Masters",
    description: "Traded ML Spacestation to Jstn for CL G2 Stride",
    status: "approved",
    processed: "2025-11-13 11:45 AM",
    reason: null,
  },
  {
    id: "th5",
    type: "waiver",
    fantasyLeague: "2025-alpha",
    manager: "FlipMaster",
    teamName: "Reset Rookies",
    addTeam: TEAMS[20],
    dropTeam: TEAMS[23],
    status: "failed",
    processed: "2025-11-14 3:00 AM",
    reason: "Team already rostered",
  },
  {
    id: "th6",
    type: "trade",
    fantasyLeague: "2025-beta",
    manager: "Rover",
    teamName: "Rover's Rockets",
    description: "Traded PL Pioneers to SpeedDemon for AL PWR",
    status: "approved",
    processed: "2025-11-12 6:20 PM",
    reason: null,
  },
  {
    id: "th7",
    type: "pickup",
    fantasyLeague: "2025-alpha",
    manager: "Nick",
    teamName: "Nick's Bumps",
    addTeam: TEAMS[0],
    dropTeam: null,
    status: "approved",
    processed: "2025-11-11 4:15 PM",
    reason: null,
  },
  {
    id: "th8",
    type: "drop",
    fantasyLeague: "2025-gamma",
    manager: "CeilingShotz",
    teamName: "Aerial Aces",
    addTeam: null,
    dropTeam: TEAMS[19],
    status: "approved",
    processed: "2025-11-10 9:30 AM",
    reason: null,
  },
  {
    id: "th9",
    type: "trade",
    fantasyLeague: "2025-alpha",
    manager: "FlipReset",
    teamName: "Ceiling Shot Squad",
    description: "Traded FL Falcons to Nick for ML Luminosity",
    status: "vetoed",
    processed: "2025-11-09 2:00 PM",
    reason: "Vetoed by admin - imbalanced trade",
  },
];

export default function TransactionsPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [pendingTrades, setPendingTrades] = useState<any[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [leagues, setLeagues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<"waivers" | "trades" | "history">(
    "waivers"
  );

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/transactions");

        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }

        const data = await response.json();
        setLeagues(data.leagues || []);
        setClaims(data.pendingWaivers || []);
        setPendingTrades(data.pendingTrades || []);
        setTransactionHistory(data.transactionHistory || []);
        setSelectedLeagues((data.leagues || []).map((l: any) => l.id));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter handling
  const toggleLeagueFilter = (leagueId: string) => {
    setSelectedLeagues((prev) =>
      prev.includes(leagueId)
        ? prev.filter((id) => id !== leagueId)
        : [...prev, leagueId]
    );
  };

  const selectAllLeagues = () => {
    setSelectedLeagues(leagues.map((l) => l.id));
  };

  const deselectAllLeagues = () => {
    setSelectedLeagues([]);
  };

  const getTeamByMLEId = (mleTeamId: string) => {
    if (!mleTeamId) return null;
    // Handle case-insensitive lookup (database might have "plSpartans" while TEAMS has "PLSpartans")
    return TEAMS.find(t => t.id.toLowerCase() === mleTeamId.toLowerCase());
  };

  // Filtered data based on selected leagues
  const filteredClaims = claims.filter((c) =>
    selectedLeagues.includes(c.fantasyLeague)
  );
  const filteredTrades = pendingTrades.filter((t) =>
    selectedLeagues.includes(t.fantasyLeague)
  );
  const filteredHistory = transactionHistory.filter((t) =>
    selectedLeagues.includes(t.fantasyLeague)
  );

  // Waiver processing functions
  const processAllWaivers = async () => {
    try {
      const claimIds = filteredClaims.map(c => c.id);

      const response = await fetch("/api/admin/waivers/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ claimIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to process waivers");
      }

      const result = await response.json();

      // Refresh data
      const dataResponse = await fetch("/api/admin/transactions");
      const data = await dataResponse.json();
      setClaims(data.pendingWaivers || []);
      setTransactionHistory(data.transactionHistory || []);

      setShowConfirmModal(false);
      alert(`Successfully processed ${result.processed} waiver claims! (${result.approved} approved, ${result.denied} denied)`);
    } catch (error) {
      console.error("Error processing waivers:", error);
      alert("Failed to process waivers. Please try again.");
    }
  };

  const approveClaim = async (id: string) => {
    try {
      const response = await fetch("/api/admin/waivers/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ claimIds: [id] }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve waiver claim");
      }

      // Refresh data
      const dataResponse = await fetch("/api/admin/transactions");
      const data = await dataResponse.json();
      setClaims(data.pendingWaivers || []);
      setTransactionHistory(data.transactionHistory || []);

      alert("Waiver claim approved!");
    } catch (error) {
      console.error("Error approving waiver:", error);
      alert("Failed to approve waiver claim. Please try again.");
    }
  };

  const denyClaim = async (id: string) => {
    // For now, we'll just process it (which will deny it if the team is already rostered)
    // You may want to add a specific deny endpoint later
    await approveClaim(id);
  };

  // Trade processing functions
  const approveTrade = async (id: string) => {
    try {
      const response = await fetch("/api/admin/trades/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tradeId: id,
          action: "approve"
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve trade");
      }

      // Refresh data
      const dataResponse = await fetch("/api/admin/transactions");
      const data = await dataResponse.json();
      setPendingTrades(data.pendingTrades || []);
      setTransactionHistory(data.transactionHistory || []);

      alert("Trade approved!");
    } catch (error) {
      console.error("Error approving trade:", error);
      alert("Failed to approve trade. Please try again.");
    }
  };

  const vetoTrade = async (id: string) => {
    try {
      const response = await fetch("/api/admin/trades/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tradeId: id,
          action: "veto",
          reason: "Vetoed by admin"
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to veto trade");
      }

      // Refresh data
      const dataResponse = await fetch("/api/admin/transactions");
      const data = await dataResponse.json();
      setPendingTrades(data.pendingTrades || []);
      setTransactionHistory(data.transactionHistory || []);

      alert("Trade vetoed!");
    } catch (error) {
      console.error("Error vetoing trade:", error);
      alert("Failed to veto trade. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#ef4444", fontSize: "1.1rem" }}>
          Error: {error}
        </div>
      </div>
    );
  }

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
                Are you sure you want to process all {filteredClaims.length}{" "}
                pending waiver claims for the selected leagues? This action
                cannot be undone.
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

      {/* Page Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            color: "var(--accent)",
            fontWeight: 700,
            marginBottom: "0.5rem",
          }}
        >
          Transactions
        </h1>
        <p style={{ fontSize: "1rem", color: "var(--text-muted)" }}>
          Manage waivers, trades, and view transaction history
        </p>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          marginBottom: "1.5rem",
          padding: "1rem",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div style={{ flex: 1, position: "relative" }}>
          <button
            className="btn btn-ghost"
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            style={{
              width: "100%",
              justifyContent: "space-between",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span>Fantasy Leagues ({selectedLeagues.length} selected)</span>
            <span style={{ fontSize: "0.75rem" }}>▼</span>
          </button>

          {showFilterDropdown && (
            <>
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 998,
                }}
                onClick={() => setShowFilterDropdown(false)}
              />
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 0.5rem)",
                  left: 0,
                  right: 0,
                  background: "var(--bg-elevated)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  padding: "1rem",
                  zIndex: 999,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  <button
                    className="btn btn-ghost"
                    onClick={selectAllLeagues}
                    style={{ flex: 1, fontSize: "0.85rem", padding: "0.4rem" }}
                  >
                    Select All
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={deselectAllLeagues}
                    style={{ flex: 1, fontSize: "0.85rem", padding: "0.4rem" }}
                  >
                    Deselect All
                  </button>
                </div>
                {leagues.map((league) => (
                  <label
                    key={league.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.5rem",
                      cursor: "pointer",
                      borderRadius: "4px",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.05)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <input
                      type="checkbox"
                      checked={selectedLeagues.includes(league.id)}
                      onChange={() => toggleLeagueFilter(league.id)}
                      style={{
                        width: "16px",
                        height: "16px",
                        cursor: "pointer",
                      }}
                    />
                    <span style={{ fontSize: "0.95rem" }}>{league.name}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        {activeTab === "waivers" && (
          <button
            className="btn btn-primary"
            style={{ padding: "0.75rem 2rem", fontSize: "1.05rem" }}
            onClick={() => setShowConfirmModal(true)}
            disabled={filteredClaims.length === 0}
          >
            Process All Waivers
          </button>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          borderBottom: "2px solid rgba(255,255,255,0.1)",
        }}
      >
        <button
          onClick={() => setActiveTab("waivers")}
          style={{
            padding: "0.75rem 1.5rem",
            background: "transparent",
            border: "none",
            borderBottom:
              activeTab === "waivers"
                ? "2px solid var(--accent)"
                : "2px solid transparent",
            color:
              activeTab === "waivers" ? "var(--accent)" : "var(--text-muted)",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "1rem",
            marginBottom: "-2px",
          }}
        >
          Pending Waivers ({filteredClaims.length})
        </button>
        <button
          onClick={() => setActiveTab("trades")}
          style={{
            padding: "0.75rem 1.5rem",
            background: "transparent",
            border: "none",
            borderBottom:
              activeTab === "trades"
                ? "2px solid var(--accent)"
                : "2px solid transparent",
            color:
              activeTab === "trades" ? "var(--accent)" : "var(--text-muted)",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "1rem",
            marginBottom: "-2px",
          }}
        >
          Pending Trades ({filteredTrades.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          style={{
            padding: "0.75rem 1.5rem",
            background: "transparent",
            border: "none",
            borderBottom:
              activeTab === "history"
                ? "2px solid var(--accent)"
                : "2px solid transparent",
            color:
              activeTab === "history" ? "var(--accent)" : "var(--text-muted)",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "1rem",
            marginBottom: "-2px",
          }}
        >
          Transaction History ({filteredHistory.length})
        </button>
      </div>

      {/* Pending Waivers Tab */}
      {activeTab === "waivers" && (
        <div className="card" style={{ padding: "1.5rem" }}>
          {filteredClaims.length === 0 ? (
            <div
              style={{
                padding: "3rem 2rem",
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              <p style={{ fontSize: "1.1rem" }}>
                No pending waiver claims for selected leagues
              </p>
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
                    League
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
                {filteredClaims.map((claim) => (
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
                    <td
                      style={{
                        padding: "0.75rem 0.5rem",
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {claim.fantasyLeagueName}
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
                        color: claim.faabBid
                          ? "var(--accent)"
                          : "var(--text-muted)",
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
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          className="btn btn-primary"
                          style={{
                            padding: "0.4rem 1rem",
                            fontSize: "0.85rem",
                          }}
                          onClick={() => approveClaim(claim.id)}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-ghost"
                          style={{
                            padding: "0.4rem 1rem",
                            fontSize: "0.85rem",
                          }}
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
      )}

      {/* Pending Trades Tab */}
      {activeTab === "trades" && (
        <div className="card" style={{ padding: "1.5rem" }}>
          {filteredTrades.length === 0 ? (
            <div
              style={{
                padding: "3rem 2rem",
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              <p style={{ fontSize: "1.1rem" }}>
                No pending trades for selected leagues
              </p>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {filteredTrades.map((trade) => (
                <div
                  key={trade.id}
                  style={{
                    padding: "1.5rem",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "1rem",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-muted)",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {trade.fantasyLeagueName}
                      </div>
                      <div
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: 600,
                          color: "var(--text-main)",
                        }}
                      >
                        {trade.proposer} ⇄ {trade.receiver}
                      </div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-muted)",
                          marginTop: "0.25rem",
                        }}
                      >
                        Submitted: {trade.submitted} | Veto Deadline:{" "}
                        {trade.vetoDeadline}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        className="btn btn-primary"
                        style={{
                          padding: "0.5rem 1.25rem",
                          fontSize: "0.9rem",
                        }}
                        onClick={() => approveTrade(trade.id)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-ghost"
                        style={{
                          padding: "0.5rem 1.25rem",
                          fontSize: "0.9rem",
                          background:
                            "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                        }}
                        onClick={() => vetoTrade(trade.id)}
                      >
                        Veto
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto 1fr",
                      gap: "1.5rem",
                      alignItems: "center",
                    }}
                  >
                    {/* Proposer Gives */}
                    <div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color: "var(--text-muted)",
                          marginBottom: "0.75rem",
                          textTransform: "uppercase",
                        }}
                      >
                        {trade.proposerTeam} Gives
                      </div>
                      {trade.proposerGives.map((team, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <Image
                            src={team.logoPath}
                            alt={team.name}
                            width={32}
                            height={32}
                            style={{ borderRadius: "4px" }}
                          />
                          <span style={{ fontWeight: 600 }}>
                            {team.leagueId} {team.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Arrow */}
                    <div style={{ fontSize: "2rem", color: "var(--accent)" }}>
                      ⇄
                    </div>

                    {/* Receiver Gives */}
                    <div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color: "var(--text-muted)",
                          marginBottom: "0.75rem",
                          textTransform: "uppercase",
                        }}
                      >
                        {trade.receiverTeam} Gives
                      </div>
                      {trade.receiverGives.map((team, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <Image
                            src={team.logoPath}
                            alt={team.name}
                            width={32}
                            height={32}
                            style={{ borderRadius: "4px" }}
                          />
                          <span style={{ fontWeight: 600 }}>
                            {team.leagueId} {team.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Transaction History Tab */}
      {activeTab === "history" && (
        <section style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          borderRadius: "12px",
          padding: "2rem",
          border: "1px solid rgba(255,255,255,0.1)"
        }}>
          {filteredHistory.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "rgba(255,255,255,0.5)" }}>
              No transaction history for selected leagues
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {filteredHistory.map((transaction) => (
                <div
                  key={transaction.id}
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "0",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5rem",
                  }}
                >
                  {transaction.type === "trade" ? (
                    // TRADE TRANSACTION
                    <>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "white" }}>
                          {transaction.teamName}
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)" }}>
                          {transaction.manager}
                        </div>
                      </div>

                      <div style={{ fontSize: "2rem", color: "#f59e0b" }}>
                        →
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "white" }}>
                          Trade Partner
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)" }}>
                          {transaction.description}
                        </div>
                      </div>

                      <button
                        style={{
                          background: "rgba(255,255,255,0.2)",
                          border: "none",
                          color: "white",
                          padding: "0.6rem 1.5rem",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "0.95rem",
                          fontWeight: 600,
                        }}
                      >
                        View
                      </button>
                    </>
                  ) : transaction.type === "waiver" ? (
                    // WAIVER CLAIM TRANSACTION
                    <>
                      <div style={{ flex: "0 0 200px" }}>
                        <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "white" }}>
                          {transaction.teamName}
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)" }}>
                          {transaction.manager}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {transaction.addTeam && (() => {
                          const teamAdded = transaction.addTeam;
                          return (
                            <>
                              <Image
                                src={teamAdded.logoPath}
                                alt={teamAdded.name}
                                width={40}
                                height={40}
                                style={{ borderRadius: "6px" }}
                              />
                              <div style={{ fontSize: "1rem", fontWeight: 600, color: "white" }}>
                                {teamAdded.leagueId} {teamAdded.name}
                              </div>
                            </>
                          );
                        })()}

                        {transaction.addTeam && transaction.dropTeam && (
                          <div style={{ fontSize: "1.5rem", color: "rgba(255,255,255,0.3)", marginLeft: "0.5rem", marginRight: "0.5rem" }}>
                            →
                          </div>
                        )}

                        {transaction.dropTeam && (() => {
                          const teamDropped = transaction.dropTeam;
                          return (
                            <div style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.5)" }}>
                              {teamDropped.leagueId} {teamDropped.name}
                            </div>
                          );
                        })()}
                      </div>
                    </>
                  ) : (
                    // PICKUP OR DROP TRANSACTION
                    <>
                      <div style={{ flex: "0 0 200px" }}>
                        <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "white" }}>
                          {transaction.teamName}
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)" }}>
                          {transaction.manager}
                        </div>
                      </div>

                      {transaction.addTeam && (() => {
                        const teamAdded = transaction.addTeam;
                        return (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <div style={{ fontSize: "1.5rem", color: "#22c55e", fontWeight: 700 }}>
                              +
                            </div>
                            <Image
                              src={teamAdded.logoPath}
                              alt={teamAdded.name}
                              width={40}
                              height={40}
                              style={{ borderRadius: "6px" }}
                            />
                            <div style={{ fontSize: "1rem", fontWeight: 600, color: "white" }}>
                              {teamAdded.leagueId} {teamAdded.name}
                            </div>
                          </div>
                        );
                      })()}

                      {transaction.dropTeam && (() => {
                        const teamDropped = transaction.dropTeam;
                        return (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <div style={{ fontSize: "1.5rem", color: "#ef4444", fontWeight: 700 }}>
                              −
                            </div>
                            <Image
                              src={teamDropped.logoPath}
                              alt={teamDropped.name}
                              width={40}
                              height={40}
                              style={{ borderRadius: "6px" }}
                            />
                            <div style={{ fontSize: "1rem", fontWeight: 600, color: "white" }}>
                              {teamDropped.leagueId} {teamDropped.name}
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
