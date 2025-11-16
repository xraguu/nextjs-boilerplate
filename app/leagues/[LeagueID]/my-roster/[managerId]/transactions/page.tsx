"use client";

import { useState } from "react";
import Image from "next/image";
import { TEAMS } from "@/lib/teams";

// Mock transaction data
const mockTransactions = [
  {
    id: 1,
    type: "trade",
    teamFrom: "Fantastic Ballers",
    managerFrom: "xenn",
    recordFrom: "2 - 1",
    placeFrom: "3rd",
    teamTo: "Pixies",
    managerTo: "Crazy",
    recordTo: "0 - 3",
    placeTo: "9th",
    status: "Accepted",
    timestamp: "Nov 15, 2025 2:30 PM",
  },
  {
    id: 2,
    type: "trade",
    teamFrom: "Pixies",
    managerFrom: "Crazy",
    recordFrom: "0 - 3",
    placeFrom: "9th",
    teamTo: "Fantastic Ballers",
    managerTo: "xenn",
    recordTo: "2 - 1",
    placeTo: "3rd",
    status: "Accepted",
    timestamp: "Nov 15, 2025 2:30 PM",
  },
  {
    id: 3,
    type: "trade",
    teamFrom: "Fantastic Ballers",
    managerFrom: "xenn",
    recordFrom: "2 - 1",
    placeFrom: "3rd",
    teamTo: "Whiffers",
    managerTo: "Crazy",
    recordTo: "0 - 3",
    placeTo: "9th",
    status: "Denied",
    timestamp: "Nov 14, 2025 9:15 AM",
  },
  {
    id: 4,
    type: "waiver",
    teamAdded: TEAMS.find(t => t.name === "Bulls") || TEAMS[0],
    rankAdded: "4th",
    teamDropped: TEAMS.find(t => t.name === "Comets") || TEAMS[1],
    rankDropped: "(9th)",
    status: "Successful",
    timestamp: "Nov 13, 2025 3:45 AM",
  },
  {
    id: 5,
    type: "waiver",
    teamAdded: TEAMS.find(t => t.name === "Bulls") || TEAMS[0],
    rankAdded: "4th",
    teamDropped: TEAMS.find(t => t.name === "Comets") || TEAMS[2],
    rankDropped: "(9th)",
    status: "Failed - Lower Priority",
    timestamp: "Nov 10, 2025 3:45 AM",
  },
  {
    id: 6,
    type: "fa-pickup",
    teamAdded: TEAMS.find(t => t.name === "Storm") || TEAMS[3],
    rankAdded: "2nd",
    teamDropped: TEAMS.find(t => t.name === "Phoenix") || TEAMS[4],
    rankDropped: "(12th)",
    status: "Successful",
    timestamp: "Nov 8, 2025 11:20 PM",
  },
];

export default function TransactionsPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");

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
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {mockTransactions
            .filter((transaction) => {
              if (selectedFilter === "All") return true;
              if (selectedFilter === "Trade") return transaction.type === "trade";
              if (selectedFilter === "Waiver Claim") return transaction.type === "waiver";
              if (selectedFilter === "FA Pick up") return transaction.type === "fa-pickup";
              return true;
            })
            .map((transaction) => (
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
                        {transaction.teamFrom}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {transaction.managerFrom}  {transaction.recordFrom}  {transaction.placeFrom}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div style={{ fontSize: "1.5rem", color: "var(--accent)", fontWeight: 700 }}>
                      →
                    </div>

                    {/* Team To */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.25rem" }}>
                        {transaction.teamTo}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {transaction.managerTo}  {transaction.recordTo}  {transaction.placeTo}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Team Added */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                      <Image
                        src={transaction.teamAdded.logoPath}
                        alt={transaction.teamAdded.name}
                        width={48}
                        height={48}
                        style={{ borderRadius: "6px" }}
                      />
                      <div>
                        <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-main)" }}>
                          {transaction.teamAdded.leagueId} {transaction.teamAdded.name}
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                          {transaction.rankAdded}
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div style={{ fontSize: "1.5rem", color: "var(--accent)", fontWeight: 700 }}>
                      →
                    </div>

                    {/* Team Dropped */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                      <Image
                        src={transaction.teamDropped.logoPath}
                        alt={transaction.teamDropped.name}
                        width={48}
                        height={48}
                        style={{ borderRadius: "6px" }}
                      />
                      <div>
                        <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-main)" }}>
                          {transaction.teamDropped.leagueId} {transaction.teamDropped.name}
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                          {transaction.rankDropped}
                        </div>
                      </div>
                    </div>
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
                  {transaction.timestamp}
                </div>

                {/* Status Badge */}
                <div
                  style={{
                    background:
                      transaction.status === "Accepted" || transaction.status === "Successful"
                        ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                        : transaction.status === "Denied"
                        ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
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
                        : "0 4px 12px rgba(239, 68, 68, 0.3)",
                  }}
                >
                  {transaction.status}
                </div>
              </div>
            ))}
        </div>
      </section>
    </>
  );
}
