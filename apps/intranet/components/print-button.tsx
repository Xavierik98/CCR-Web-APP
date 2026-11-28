"use client";

export function PrintButton({ label = "Imprimer ou enregistrer en PDF" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="rounded-full bg-ccr-gold px-5 py-2 text-sm font-semibold text-ccr-ink hover:bg-ccr-gold-light">
      {label}
    </button>
  );
}
