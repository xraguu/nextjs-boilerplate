// components/Modal.tsx
// Generic Modal Component
//
// This is a basic modal component for general use. For team-specific modals with
// detailed stats and styling, use TeamModal.tsx instead.
//
// Currently not in use - TeamModal.tsx is the standard for all team detail views.
// This component is kept for potential future use cases requiring a simple modal.

"use client";
export default function Modal({
  open, onClose, title, children,
}: { open: boolean; onClose: () => void; title?: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {title && <div className="card-header"><h2 className="card-title">{title}</h2></div>}
        {children}
      </div>
    </div>
  );
}

// "use client";
// import { useState } from "react";
// import Modal from "@/components/Modal";
// import Button from "@/components/Button";

// function Example() {
//   const [open, setOpen] = useState(false);
//   return (
//     <>
//       <Button onClick={() => setOpen(true)}>Open Modal</Button>
//       <Modal open={open} onClose={() => setOpen(false)} title="Confirm Waiver">
//         <p className="card-subtitle">Are you sure you want to claim Skyhawks?</p>
//         <div style={{ display: "flex", gap: ".5rem", marginTop: ".8rem" }}>
//           <Button onClick={() => setOpen(false)}>Yes</Button>
//           <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
//         </div>
//       </Modal>
//     </>
//   );
// }
