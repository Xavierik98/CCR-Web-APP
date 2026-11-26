"use client";

import { useSearchParams } from "next/navigation";
import type { Departement } from "../../_data/departements";

export function BesoinForm({ departements }: { departements: Departement[] }) {
  const searchParams = useSearchParams();
  const preselection = searchParams.get("departement");

  return (
    <form className="mt-10 flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nom" className="text-sm font-semibold">
            Nom(s) *
          </label>
          <input
            id="nom"
            name="nom"
            type="text"
            required
            autoComplete="family-name"
            className="mt-1 w-full rounded-lg border border-ccr-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="prenom" className="text-sm font-semibold">
            Prénom(s) *
          </label>
          <input
            id="prenom"
            name="prenom"
            type="text"
            required
            autoComplete="given-name"
            className="mt-1 w-full rounded-lg border border-ccr-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="telephone" className="text-sm font-semibold">
            Téléphone *
          </label>
          <input
            id="telephone"
            name="telephone"
            type="tel"
            required
            autoComplete="tel"
            className="mt-1 w-full rounded-lg border border-ccr-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-semibold">
            E-mail *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-ccr-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label htmlFor="departement" className="text-sm font-semibold">
          Département concerné
        </label>
        <select
          id="departement"
          name="departement"
          defaultValue={preselection ?? undefined}
          className="mt-1 w-full rounded-lg border border-ccr-ink/20 bg-white px-3 py-2 text-sm"
        >
          {departements.map((pole) => (
            <option key={pole.nom}>{pole.nom}</option>
          ))}
          <option>Autre / proposition générale</option>
        </select>
      </div>
      <div>
        <label htmlFor="message" className="text-sm font-semibold">
          Votre proposition
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="Votre savoir-faire, votre disponibilité ou la solution que vous proposez..."
          className="mt-1 w-full rounded-lg border border-ccr-ink/20 bg-white px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        className="mt-2 rounded-full bg-ccr-gold px-6 py-3 text-sm font-semibold text-ccr-ink transition-colors hover:bg-ccr-gold-light"
      >
        Envoyer
      </button>
    </form>
  );
}
