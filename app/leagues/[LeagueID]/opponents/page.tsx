import Link from "next/link";

// Mock opponents data
const mockOpponents = [
  { id: 1, name: "Rover", team: "Air Dribble Demons", rank: 2, record: { wins: 6, losses: 2 } },
  { id: 2, name: "FlipReset", team: "Ceiling Shot Squad", rank: 1, record: { wins: 7, losses: 1 } },
  { id: 3, name: "AirDribbler", team: "Musty Flick Masters", rank: 3, record: { wins: 5, losses: 3 } },
  { id: 4, name: "SpeedDemon", team: "Boost Stealers", rank: 4, record: { wins: 5, losses: 3 } },
  { id: 5, name: "Kuxir", team: "Pinch Masters", rank: 5, record: { wins: 4, losses: 4 } },
  { id: 6, name: "Squishy", team: "Double Tap Dynasty", rank: 6, record: { wins: 4, losses: 4 } },
  { id: 7, name: "Jstn", team: "Zero Second Goals", rank: 7, record: { wins: 3, losses: 5 } },
  { id: 8, name: "Garrett", team: "Flip Reset Kings", rank: 9, record: { wins: 2, losses: 6 } },
  { id: 9, name: "Turbo", team: "Demo Destroyers", rank: 10, record: { wins: 1, losses: 7 } },
];

export default function OpponentsPage() {
  return (
    <>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="page-heading">Opponents</h1>
        <p className="page-subtitle">View your league opponents</p>
      </div>

      <section className="card">
        <div className="card-header">
          <h2 className="card-title">League Opponents</h2>
          <span className="card-subtitle">{mockOpponents.length} opponents</span>
        </div>

        <div style={{ marginTop: "1rem", display: "grid", gap: "0.75rem" }}>
          {mockOpponents.map((opponent) => (
            <Link
              key={opponent.id}
              href={`opponents/${opponent.id}`}
              className="card card-outline"
              style={{
                textDecoration: "none",
                transition: "all 0.2s ease",
                cursor: "pointer"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                    {opponent.name}
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    {opponent.team}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                      Rank
                    </div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent)" }}>
                      #{opponent.rank}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                      Record
                    </div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                      <span style={{ color: "#22c55e" }}>{opponent.record.wins}</span>-<span style={{ color: "#ef4444" }}>{opponent.record.losses}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
