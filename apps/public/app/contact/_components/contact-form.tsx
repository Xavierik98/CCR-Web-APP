"use client";

import { CheckedField } from "@ccr/ui/src/checked-field";
import { FormSuccess, SiteForm } from "../../_components/site-form";

const fieldClass =
  "mt-1 w-full rounded-xl border border-ccr-ink/15 bg-ccr-cream/60 px-3 py-2.5 text-sm outline-none transition sm:px-4 sm:py-3 focus:border-ccr-gold focus:bg-white focus:ring-2 focus:ring-ccr-gold/30";

export function ContactForm({ sujets }: { sujets: string[] }) {
  return (
    <SiteForm
      endpoint="/api/message"
      className="mt-3 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4"
      build={(fd) => ({
        kind: "CONTACT",
        lastName: fd.get("nom"),
        firstName: fd.get("prenom"),
        phone: fd.get("telephone"),
        email: fd.get("email"),
        subject: fd.get("sujet"),
        message: fd.get("message"),
        site_web: fd.get("site_web"),
      })}
      success={<FormSuccess title="Message envoyé" text="Merci ! L'équipe vous répondra rapidement." />}
    >
      <CheckedField kind="name" label="Nom(s)" name="nom" autoComplete="family-name" hint="Exemple : KIFILA" inputClassName={fieldClass} />
      <CheckedField kind="name" label="Prénom(s)" name="prenom" autoComplete="given-name" hint="Exemple : Arsène" inputClassName={fieldClass} />
      <CheckedField kind="phone" label="Téléphone" name="telephone" autoComplete="tel" inputClassName={fieldClass} />
      <CheckedField kind="email" label="Adresse e-mail" name="email" autoComplete="email" inputClassName={fieldClass} />
      <label className="block col-span-full">
        <span className="text-sm font-semibold">Sujet</span>
        <select name="sujet" className={fieldClass}>
          {sujets.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label className="block col-span-full">
        <span className="text-sm font-semibold">
          Votre message<span className="ml-0.5 text-red-600">*</span>
        </span>
        <textarea name="message" rows={5} required placeholder="Dites-nous comment nous pouvons vous aider ou vous accueillir" className={fieldClass} />
      </label>
    </SiteForm>
  );
}
