// components/Tabs.tsx
"use client";
import { useState } from "react";

type Tab = { id: string; label: string; content: React.ReactNode };
export default function Tabs({ tabs, defaultId }: { tabs: Tab[]; defaultId?: string }) {
  const [active, setActive] = useState(defaultId ?? tabs[0]?.id);
  return (
    <div>
      <div className="tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`tab ${active === t.id ? "active" : ""}`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div>{tabs.find(t => t.id === active)?.content}</div>
    </div>
  );
}


// import Tabs from "@/components/Tabs";

// <Tabs
//   tabs={[
//     { id: "wk", label: "This Week", content: <div className="card card-solid">…</div> },
//     { id: "szn", label: "Season", content: <div className="card">…</div> },
//   ]}
// />
