export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="2" y="20" width="10" height="10" rx="1.5" fill="#2e6a52" />
      <rect x="11" y="11" width="10" height="10" rx="1.5" fill="#245a45" />
      <rect x="20" y="2" width="10" height="10" rx="1.5" fill="#1f4a3a" />
      <rect x="11" y="20" width="10" height="10" rx="1.5" fill="#1f4a3a" opacity=".85" />
      <rect x="20" y="11" width="10" height="10" rx="1.5" fill="#163628" opacity=".9" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="text-2xl font-bold tracking-tight text-pine">Peldaño</span>
    </span>
  );
}
