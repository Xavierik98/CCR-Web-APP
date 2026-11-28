"use client";

import { CheckedField } from "@ccr/ui/src/checked-field";
import { FormSuccess, SiteForm } from "../../../_components/site-form";

const field =
  "mt-1 w-full rounded-xl border border-ccr-ink/15 bg-ccr-cream/60 px-3 py-2.5 text-sm outline-none transition sm:px-4 sm:py-3 focus:border-ccr-gold focus:bg-white focus:ring-2 focus:ring-ccr-gold/30";

export function PledgeForm({ id, mensuel, nom }: { id: string; mensuel: boolean; nom: string }) {
  return (
    <SiteForm
      endpoint={`/api/engagement/${id}`}
      className="grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-4"
      build={(fd) => ({
        lastName: fd.get("nom"),
        firstName: fd.get("prenom"),
        phone: fd.get("telephone"),
        email: fd.get("email"),
        amount: fd.get("montant"),
        message: fd.get("message"),
        site_web: fd.get("site_web"),
      })}
      success={
        <FormSuccess
          title="Merci pour votre engagement !"
          text={`Votre engagement pour « ${nom} » est bien enregistré. La trésorerie de l'église pourra vous contacter sur WhatsApp${mensuel ? " chaque mois" : ""}.`}
        />
      }
    >
      <CheckedField kind="name" label="Nom(s)" name="nom" autoComplete="family-name" inputClassName={field} />
      <CheckedField kind="name" label="Prénom(s)" name="prenom" autoComplete="given-name" inputClassName={field} />
      <CheckedField kind="phone" label="Téléphone (WhatsApp)" name="telephone" autoComplete="tel" inputClassName={field} />
      <CheckedField kind="email" label="E-mail" name="email" autoComplete="email" required={false} hint="Facultatif" inputClassName={field} />
      <label className="col-span-full block">
        <span className="text-sm font-semibold">
          Montant de votre engagement {mensuel ? "par mois" : ""} <span className="font-normal text-ccr-ink/50">(en dirhams, facultatif)</span>
        </span>
        <div className="relative">
          <input name="montant" inputMode="decimal" placeholder="Ex. 200" className={`${field} pr-16`} />
          <span className="pointer-events-none absolute right-4 top-1/2 mt-0.5 -translate-y-1/2 text-sm font-semibold text-ccr-ink/50">MAD</span>
        </div>
        <span className="mt-1 block text-xs text-ccr-ink/50">Laissez vide si vous préférez en parler avec la trésorerie.</span>
      </label>
      <label className="col-span-full block">
        <span className="text-sm font-semibold">Message (facultatif)</span>
        <textarea name="message" rows={2} className={field} />
      </label>
    </SiteForm>
  );
}
