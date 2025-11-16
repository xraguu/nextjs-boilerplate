"use client";

export default function TransactionsPage() {
  return (
    <>
      {/* Page Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="page-heading" style={{ fontSize: "2.5rem", color: "var(--accent)", fontWeight: 700, margin: 0 }}>
          Transactions
        </h1>
        <p className="page-subtitle" style={{ marginTop: "0.5rem", color: "var(--text-muted)" }}>
          View your transaction history
        </p>
      </div>

      {/* Placeholder for future content */}
      <section className="card">
        <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
          <p>Transaction history will appear here.</p>
        </div>
      </section>
    </>
  );
}
