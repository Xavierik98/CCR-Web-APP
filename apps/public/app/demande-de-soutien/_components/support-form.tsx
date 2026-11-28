"use client";

import { CheckedField } from "@ccr/ui/src/checked-field";
import { QuartierField } from "@ccr/ui/src/quartier-field";
import { useState } from "react";

const BESOINS = ["Spaghetti", "Tomate (concentré)", "Semoule", "Farine", "Sucre", "Huile", "Riz", "Lait"];

const field =
  "mt-1 w-full rounded-xl border border-ccr-ink/15 bg-ccr-cream/60 px-4 py-3 text-sm outline-none transition focus:border-ccr-gold focus:bg-white focus:ring-2 focus:ring-ccr-gold/30";

// Formulaire de demande de soutien alimentaire : la demande arrive
// directement dans l'intranet, rubrique Accompagnement social.
export function SupportForm({ endpoint }: { endpoint: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  if (state === "done") {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-[0_20px_50px_-25px_rgba(32,28,22,0.35)]">
        <p className="font-display text-2xl font-bold">Demande bien reçue</p>
        <p className="mt-2 text-sm text-ccr-ink/70">
          L&rsquo;équipe sociale de l&rsquo;église vous recontactera rapidement au numéro indiqué. Que Dieu vous bénisse.
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-5 rounded-3xl border-2 border-ccr-gold/40 bg-white p-5 shadow-[0_20px_50px_-25px_rgba(32,28,22,0.35)] sm:p-8"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setState("sending");
        setError("");
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lastName: fd.get("lastName"),
              firstName: fd.get("firstName"),
              phone: fd.get("phone"),
              email: fd.get("email"),
              neighborhood: fd.get("neighborhood"),
              householdSize: fd.get("householdSize"),
              needs: [...fd.getAll("needs"), ...String(fd.get("autre") ?? "").split(",").map((s) => s.trim()).filter(Boolean)],
              message: fd.get("message"),
              site_web: fd.get("site_web"),
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok && data.ok) setState("done");
          else {
            setState("error");
            setError(data.erreur ?? "L'envoi n'a pas abouti. Réessayez dans un instant.");
          }
        } catch {
          setState("error");
          setError("L'envoi n'a pas abouti. Vérifiez votre connexion et réessayez.");
        }
      }}
    >
      <input type="text" name="site_web" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-4">
        <CheckedField kind="name" label="Nom(s)" name="lastName" autoComplete="family-name" inputClassName={field} />
        <CheckedField kind="name" label="Prénom(s)" name="firstName" autoComplete="given-name" inputClassName={field} />
        <CheckedField kind="phone" label="Téléphone (WhatsApp)" name="phone" autoComplete="tel" inputClassName={field} />
        <CheckedField kind="email" label="E-mail" name="email" autoComplete="email" required={false} hint="Facultatif" inputClassName={field} />
        <label className="block">
          <span className="text-sm font-semibold">Quartier</span>
          <QuartierField className={field} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">
            Personnes au foyer <span className="font-normal text-ccr-ink/50">(facultatif)</span>
          </span>
          <select name="householdSize" className={field} defaultValue="">
            <option value="">Je préfère ne pas le dire</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <option key={n} value={n}>
                {n} personne{n > 1 ? "s" : ""}
              </option>
            ))}
            <option value="10">10 personnes ou plus</option>
          </select>
        </label>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold">De quoi avez-vous besoin ?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {BESOINS.map((b) => (
            <label key={b} className="cursor-pointer">
              <input type="checkbox" name="needs" value={b} className="peer sr-only" />
              <span className="block rounded-full border border-ccr-ink/15 px-3.5 py-1.5 text-sm transition-colors peer-checked:border-ccr-gold peer-checked:bg-ccr-gold peer-checked:font-semibold">
                {b}
              </span>
            </label>
          ))}
        </div>
        <input name="autre" placeholder="Autre besoin (facultatif)" className={`${field} mt-3`} />
      </fieldset>

      <label className="block">
        <span className="text-sm font-semibold">Message (facultatif)</span>
        <textarea name="message" rows={3} className={field} />
      </label>

      {state === "error" ? <p className="rounded-xl bg-ccr-magenta/10 p-3 text-sm text-ccr-magenta">{error}</p> : null}

      <button
        type="submit"
        disabled={state === "sending"}
        className="w-full rounded-2xl bg-ccr-gold px-6 py-3.5 text-sm font-semibold text-ccr-ink transition-colors hover:bg-ccr-gold-light disabled:opacity-60"
      >
        {state === "sending" ? "Envoi…" : "Envoyer ma demande"}
      </button>
      <p className="text-center text-xs text-ccr-ink/50">Votre demande est traitée en toute discrétion par l&rsquo;équipe sociale.</p>
    </form>
  );
}
