// components/Tip.tsx
export default function Tip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <span className="tip">
      {children}
      <span className="tiptext">{text}</span>
    </span>
  );
}

// import Tip from "@/components/Tip";

// <Tip text="Top-6 scoring gives an extra W">
//   <span className="pill">2–0 / 1–1 / 0–2</span>
// </Tip>
