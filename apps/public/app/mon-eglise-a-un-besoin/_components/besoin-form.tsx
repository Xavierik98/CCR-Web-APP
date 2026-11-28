"use client";

import { CheckedField } from "@ccr/ui/src/checked-field";
import { useSearchParams } from "next/navigation";
import type { Departement } from "../../_data/departements";
import { FormSuccess, SiteForm } from "../../_components/site-form";

const cls = "mt-1 w-full rounded-lg border border-ccr-ink/20 bg-white px-3 py-2 text-sm";

// La proposition arrive dans l'intranet, rubrique « Messages du site ».
export function BesoinForm({ departements }: { departements: Departement[] }) {
  const searchParams = useSearchParams();
  const preselection = searchParams.get("departement");

  return (
    <SiteForm
      endpoint="/api/message"
      className="mt-10 grid gap-4 sm:grid-cols-2"
      build={(fd) => ({
        kind: "BESOIN",
        lastName: fd.get("nom"),
        firstName: fd.get("prenom"),
        phone: fd.get("telephone"),
        email: fd.get("email"),
        department: fd.get("departement"),
        message: fd.get("message"),
        site_web: fd.get("site_web"),
      })}
      success={<FormSuccess title="Proposition envoyée" text="Merci ! Un responsable vous recontactera." />}
    >
      <CheckedField kind="name" label="Nom(s)" name="nom" id="nom" autoComplete="family-name" hint="Exemple : KIFILA" inputClassName={cls} />
      <CheckedField kind="name" label="Prénom(s)" name="prenom" id="prenom" autoComplete="given-name" hint="Exemple : Arsène" inputClassName={cls} />
      <CheckedField kind="phone" label="Téléphone" name="telephone" id="telephone" autoComplete="tel" inputClassName={cls} />
      <CheckedField kind="email" label="E-mail" name="email" id="email" autoComplete="email" inputClassName={cls} />
      <label className="block sm:col-span-2">
        <span className="text-sm font-semibold">Département concerné</span>
        <select name="departement" defaultValue={preselection ?? undefined} className={cls}>
          {departements.map((pole) => (
            <option key={pole.nom}>{pole.nom}</option>
          ))}
          <option>Autre / proposition générale</option>
        </select>
      </label>
      <label className="block sm:col-span-2">
        <span className="text-sm font-semibold">
          Votre proposition<span className="ml-0.5 text-red-600">*</span>
        </span>
        <textarea
          name="message"
          rows={5}
          required
          placeholder="Votre savoir-faire, votre disponibilité ou la solution que vous proposez..."
          className={cls}
        />
      </label>
    </SiteForm>
  );
}
