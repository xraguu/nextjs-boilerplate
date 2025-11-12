// components/ProgressBar.tsx
export default function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="progress">
      <div className="bar" style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  );
}

// import ProgressBar from "@/components/ProgressBar";

// <ProgressBar pct={68} />
