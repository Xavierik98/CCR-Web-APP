"use client";

import { CheckedField } from "@ccr/ui/src/checked-field";
import { useSearchParams } from "next/navigation";
import type { Departement } from "../../_data/departements";

export function BesoinForm({ departements }: { departements: Departement[] }) {
  const searchParams = useSearchParams();
  const preselection = searchParams.get("departement");

  return (
    <form className="mt-10 flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <CheckedField kind="name" label="Nom(s)" name="nom" id="nom" autoComplete="family-name" hint="Exemple : KIFILA" inputClassName="mt-1 w-full rounded-lg border border-ccr-ink/20 bg-white px-3 py-2 text-sm" />
        <CheckedField kind="name" label="Prénom(s)" name="prenom" id="prenom" autoComplete="given-name" hint="Exemple : Arsène" inputClassName="mt-1 w-full rounded-lg border border-ccr-ink/20 bg-white px-3 py-2 text-sm" />
        <CheckedField kind="phone" label="Téléphone" name="telephone" id="telephone" autoComplete="tel" inputClassName="mt-1 w-full rounded-lg border border-ccr-ink/20 bg-white px-3 py-2 text-sm" />
        <CheckedField kind="email" label="E-mail" name="email" id="email" autoComplete="email" inputClassName="mt-1 w-full rounded-lg border border-ccr-ink/20 bg-white px-3 py-2 text-sm" />
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
