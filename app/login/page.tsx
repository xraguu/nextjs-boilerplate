"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: "500px",
          width: "100%",
          padding: "3rem 2.5rem",
          textAlign: "center",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: "2rem" }}>
          <Image
            src="/mle-logo.png"
            alt="MLE Logo"
            width={120}
            height={120}
            style={{ display: "inline-block" }}
          />
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 900,
            marginBottom: "0.5rem",
            background: "linear-gradient(90deg, var(--mle-gold), #ffd700)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "0.02em",
          }}
        >
          MINOR LEAGUE ESPORTS
        </h1>
        <p
          style={{
            fontSize: "1.5rem",
            fontFamily: "var(--font-zuume)",
            color: "var(--text-muted)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            fontWeight: 600,
            marginBottom: "2.5rem",
          }}
        >
          RL Fantasy
        </p>

        {/* Description */}
        <p
          style={{
            fontSize: "1rem",
            color: "var(--text-muted)",
            marginBottom: "2rem",
            lineHeight: "1.6",
          }}
        >
          Sign in with Discord to access your fantasy league
        </p>

        {/* Discord Sign In Button */}
        <button
          onClick={() => signIn("discord")}
          type="button"
            style={{
              width: "100%",
              padding: "1rem 2rem",
              fontSize: "1.1rem",
              fontWeight: 700,
              background: "#5865F2",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              transition: "background 0.2s ease",
              boxShadow: "0 4px 12px rgba(88, 101, 242, 0.4)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#4752C4")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#5865F2")}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            Sign in with Discord
        </button>

        {/* Footer */}
        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--text-muted)",
            marginTop: "2rem",
            lineHeight: "1.5",
          }}
        >
          By signing in, you agree to our terms of service and privacy policy
        </p>
      </div>
    </div>
  );
}
