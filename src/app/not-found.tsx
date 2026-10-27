import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4 pt-6">
      <h1 className="h1">No encontramos esta página</h1>
      <Link href="/" className="font-semibold text-pine underline">Ir al inicio</Link>
    </div>
  );
}
