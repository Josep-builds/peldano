"use client";

import { useFormStatus } from "react-dom";

export function Submit({ children, pending: pendingText = "Guardando…", className = "btn-primary" }: {
  children: React.ReactNode;
  pending?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}
