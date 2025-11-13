export default function HomePage() {
  return (
    <>
      <div style={{ marginBottom: "1.25rem" }}>
        <h1 className="page-heading">MLE Rocket League Fantasy</h1>
        <p className="page-subtitle">
          It’s like fantasy football, but for Rocket League
        </p>
      </div>

      <div className="grid">
        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">This Week</h2>
              <p className="card-subtitle">
                Manage your lineup and track your team’s weekly progress.
              </p>
            </div>
            <span className="card-pill">Week 1</span>
          </div>

          <ul style={{ paddingLeft: "1.1rem", margin: 0, marginTop: "0.5rem" }}>
            <li>Review league <strong>standings</strong> and total points.</li>
            <li>Update your <strong>roster</strong> lineup before lock.</li>
            <li>Submit <strong>waiver claims</strong> for unowned teams.</li>
            <li>Negotiate <strong>trades</strong> with other managers.</li>
          </ul>
        </section>

        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Sections</h2>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: "0.5rem" }}>
              <strong>Standings</strong>
              <div className="card-subtitle">
                League table, records, and fantasy points.
              </div>
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <strong>My Roster</strong>
              <div className="card-subtitle">
                Your roster with weekly fantasy totals.
              </div>
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <strong>Waivers</strong>
              <div className="card-subtitle">
                Claim unowned teams; processed by waiver priority.
              </div>
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <strong>Trades</strong>
              <div className="card-subtitle">
                Propose and respond to trade offers.
              </div>
            </li>
            <li>
              <strong>Admin</strong>
              <div className="card-subtitle">
                Tools for recomputing scores and managing weeks.
              </div>
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
