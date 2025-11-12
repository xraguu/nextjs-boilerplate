// components/Button.tsx
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "warning";
};
export default function Button({ variant="primary", className="", ...props }: Props) {
  return <button {...props} className={`btn btn-${variant} ${className}`} />;
}

// import Button from "@/components/Button";

// <Button>Save</Button>
// <Button variant="ghost">Cancel</Button>
// <Button variant="warning">Reset Week</Button>
