"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { TEAMS } from "@/lib/teams";

interface Transaction {
  id: string;
  type: "trade" | "waiver" | "fa-pickup";
  // Trade fields
  fromTeam?: string;
  fromManager?: string;
  toTeam?: string;
  toManager?: string;
  givingTeams?: string[];
  receivingTeams?: string[];
  // Waiver/FA fields
  addTeamId?: string;
  dropTeamId?: string;
  faabBid?: number;
  status: string;
  timestamp: string;
}

export default function TransactionsPage() {
  const params = useParams();
  const leagueId = params.LeagueID as string;
  const teamId = params.managerId as string;

  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/leagues/${leagueId}/rosters/${teamId}/transactions`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }

        const data = await response.json();
        setTransactions(data.transactions || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    if (leagueId && teamId) {
      fetchTransactions();
    }
  }, [leagueId, teamId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getTeamByMLEId = (mleTeamId: string) => {
    return TEAMS.find(t => t.id === mleTeamId);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Trade") return transaction.type === "trade";
    if (selectedFilter === "Waiver Claim") return transaction.type === "waiver";
    if (selectedFilter === "FA Pick up") return transaction.type === "fa-pickup";
    return true;
  });

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
    <>
      {/* Page Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="page-heading" style={{ fontSize: "2.5rem", color: "var(--accent)", fontWeight: 700, margin: 0 }}>
          Transactions
        </h1>
      </div>

      <section className="card" style={{ padding: "1.5rem" }}>
        {/* Filter Dropdown */}
        <div style={{ position: "relative", marginBottom: "1.5rem", width: "150px" }}>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "var(--text-main)",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <span>Filter {selectedFilter !== "All" ? `• ${selectedFilter}` : ""}</span>
            <span style={{ marginLeft: "0.5rem" }}>{filterOpen ? "▲" : "▼"}</span>
          </button>

          {filterOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: "0.5rem",
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                borderRadius: "6px",
                padding: "0.5rem 0",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                zIndex: 1000,
                minWidth: "150px",
              }}
            >
              {["All", "Trade", "Waiver Claim", "FA Pick up"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setSelectedFilter(filter);
                    setFilterOpen(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "0.5rem 1rem",
                    background: filter === selectedFilter ? "rgba(255,255,255,0.1)" : "transparent",
                    border: "none",
                    color: "var(--text-main)",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "background 0.2s ease",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    if (filter !== selectedFilter) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            No transactions yet
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                style={{
                  background: "rgba(19, 31, 58, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  padding: "1.25rem 1.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1.5rem",
                }}
              >
                {/* Transaction Content */}
                {transaction.type === "trade" ? (
                  <>
                    {/* Team From */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.25rem" }}>
                        {transaction.fromTeam}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {transaction.fromManager}
                      </div>
                      {transaction.givingTeams && transaction.givingTeams.length > 0 && (
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                          Gave: {transaction.givingTeams.map(id => {
                            const team = getTeamByMLEId(id);
                            return team ? `${team.leagueId} ${team.name}` : id;
                          }).join(", ")}
                        </div>
                      )}
                    </div>

                    {/* Arrow */}
                    <div style={{ fontSize: "1.5rem", color: "var(--accent)", fontWeight: 700 }}>
                      ⇄
                    </div>

                    {/* Team To */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.25rem" }}>
                        {transaction.toTeam}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {transaction.toManager}
                      </div>
                      {transaction.receivingTeams && transaction.receivingTeams.length > 0 && (
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                          Received: {transaction.receivingTeams.map(id => {
                            const team = getTeamByMLEId(id);
                            return team ? `${team.leagueId} ${team.name}` : id;
                          }).join(", ")}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Team Added */}
                    {transaction.addTeamId && (() => {
                      const teamAdded = getTeamByMLEId(transaction.addTeamId);
                      return teamAdded ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                          <Image
                            src={teamAdded.logoPath}
                            alt={teamAdded.name}
                            width={48}
                            height={48}
                            style={{ borderRadius: "6px" }}
                          />
                          <div>
                            <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-main)" }}>
                              {teamAdded.leagueId} {teamAdded.name}
                            </div>
                            <div style={{ fontSize: "0.85rem", color: "#22c55e" }}>
                              Added
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}

                    {/* Arrow */}
                    {transaction.addTeamId && transaction.dropTeamId && (
                      <div style={{ fontSize: "1.5rem", color: "var(--accent)", fontWeight: 700 }}>
                        →
                      </div>
                    )}

                    {/* Team Dropped */}
                    {transaction.dropTeamId && (() => {
                      const teamDropped = getTeamByMLEId(transaction.dropTeamId);
                      return teamDropped ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                          <Image
                            src={teamDropped.logoPath}
                            alt={teamDropped.name}
                            width={48}
                            height={48}
                            style={{ borderRadius: "6px" }}
                          />
                          <div>
                            <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-main)" }}>
                              {teamDropped.leagueId} {teamDropped.name}
                            </div>
                            <div style={{ fontSize: "0.85rem", color: "#ef4444" }}>
                              Dropped
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}

                    {transaction.faabBid !== undefined && transaction.faabBid !== null && (
                      <div style={{ fontSize: "0.9rem", color: "var(--accent)", fontWeight: 600 }}>
                        ${transaction.faabBid}
                      </div>
                    )}
                  </>
                )}

                {/* Timestamp */}
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatDate(transaction.timestamp)}
                </div>

                {/* Status Badge */}
                <div
                  style={{
                    background:
                      transaction.status === "Accepted" || transaction.status === "Successful"
                        ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                        : transaction.status === "Pending"
                        ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                        : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    color: "white",
                    padding: "0.5rem 1.25rem",
                    borderRadius: "20px",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    whiteSpace: "nowrap",
                    boxShadow:
                      transaction.status === "Accepted" || transaction.status === "Successful"
                        ? "0 4px 12px rgba(34, 197, 94, 0.3)"
                        : transaction.status === "Pending"
                        ? "0 4px 12px rgba(245, 158, 11, 0.3)"
                        : "0 4px 12px rgba(239, 68, 68, 0.3)",
                  }}
                >
                  {transaction.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
