// components/Alert.tsx
type Props = { tone?: "info" | "warn" | "ok"; children: React.ReactNode };
export default function Alert({ tone="info", children }: Props) {
  const cls = `alert ${tone === "warn" ? "warn" : tone === "ok" ? "ok" : ""}`;
  return <div className={cls}>{children}</div>;
}

// import Alert from "@/components/Alert";

// <Alert>Lineups lock in 2h 14m.</Alert>
// <Alert tone="warn">Trade deadline in 24h.</Alert>
// <Alert tone="ok">Waiver claim submitted.</Alert>
