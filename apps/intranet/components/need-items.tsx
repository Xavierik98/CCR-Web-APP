"use client";

import { useState } from "react";

type Row = { label: string; quantity: string; unit: string; unitPrice: string };
const empty = (): Row => ({ label: "", quantity: "1", unit: "", unitPrice: "" });
const num = (v: string) => Number(v.replace(",", ".").replace(/\s/g, "")) || 0;

// Lignes de l'état de besoin (désignation, quantité, unité, prix unitaire
// estimé) avec le total calculé en direct. Envoyées en JSON dans « items ».
export function NeedItems({ initial }: { initial?: { label: string; quantity: number; unit: string | null; unitPrice: number | null }[] }) {
  const [rows, setRows] = useState<Row[]>(
    initial?.length
      ? initial.map((i) => ({ label: i.label, quantity: String(i.quantity), unit: i.unit ?? "", unitPrice: i.unitPrice === null ? "" : String(i.unitPrice) }))
      : [empty(), empty(), empty()],
  );
  const set = (i: number, k: keyof Row, v: string) => setRows((r) => r.map((row, j) => (j === i ? { ...row, [k]: v } : row)));
  const filled = rows.filter((r) => r.label.trim());
  const total = filled.reduce((s, r) => s + num(r.quantity) * num(r.unitPrice), 0);
  const input = "w-full rounded-lg border border-ccr-ink/15 bg-white px-2 py-2 text-sm outline-none focus:border-ccr-gold";

  return (
    <div>
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(filled.map((r) => ({ label: r.label.trim(), quantity: num(r.quantity) || 1, unit: r.unit.trim() || null, unitPrice: r.unitPrice.trim() ? num(r.unitPrice) : null })))}
      />
      <div className="hidden grid-cols-[3fr_1fr_1fr_1.2fr_auto] gap-2 px-1 text-xs font-semibold text-ccr-ink/50 sm:grid">
        <span>Désignation</span>
        <span>Quantité</span>
        <span>Unité</span>
        <span>Prix unitaire (MAD)</span>
        <span className="w-6" />
      </div>
      <div className="mt-1 space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 rounded-xl border border-ccr-ink/10 p-2 sm:grid-cols-[3fr_1fr_1fr_1.2fr_auto] sm:border-0 sm:p-0">
            <input value={r.label} onChange={(e) => set(i, "label", e.target.value)} placeholder="Ex. câble micro, rame de papier" className={`${input} col-span-4 sm:col-span-1`} />
            <input value={r.quantity} onChange={(e) => set(i, "quantity", e.target.value)} inputMode="decimal" placeholder="Qté" className={input} />
            <input value={r.unit} onChange={(e) => set(i, "unit", e.target.value)} placeholder="pièce" className={input} />
            <input value={r.unitPrice} onChange={(e) => set(i, "unitPrice", e.target.value)} inputMode="decimal" placeholder="Prix estimé" className={input} />
            <button type="button" onClick={() => setRows((x) => (x.length > 1 ? x.filter((_, j) => j !== i) : [empty()]))} className="w-6 text-lg leading-none text-ccr-ink/40 hover:text-ccr-magenta" aria-label="Retirer la ligne">
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => setRows((x) => [...x, empty()])} className="text-sm font-semibold text-ccr-blue hover:underline">
          + Ajouter une ligne
        </button>
        <p className="text-sm">
          Total estimé : <b className="font-display text-lg">{total.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} MAD</b>
        </p>
      </div>
    </div>
  );
}
