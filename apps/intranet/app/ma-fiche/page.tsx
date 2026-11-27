import { prisma } from "@ccr/database";
import type { Metadata } from "next";
import { CheckedField } from "@ccr/ui/src/checked-field";
import Image from "next/image";
import { CHURCH_FUNCTIONS } from "@/lib/members";
import { submitFiche } from "./actions";

export const metadata: Metadata = {
  title: "Ma fiche membre | CCR Famille",
  description: "Mettez à jour vos informations de membre de CCR Famille Casablanca.",
};

export const dynamic = "force-dynamic";

const ERREURS: Record<string, string> = {
  nom: "Le nom ou le prénom n'est pas conforme : au moins 2 lettres, sans chiffres ni symboles.",
  telephone: "Le numéro de téléphone n'est pas conforme. Ex. : +212 6XX XX XX XX",
  email: "L'adresse e-mail n'est pas conforme. Exemple : prenom.nom@gmail.com",
  consentement: "Merci de cocher la case d'accord pour envoyer votre fiche.",
};

const field =
  "mt-1 w-full rounded-xl border border-ccr-ink/15 bg-white px-4 py-3 text-sm outline-none focus:border-ccr-gold focus:ring-2 focus:ring-ccr-gold/30";

// Page publique (sans connexion) : chaque membre remplit sa propre fiche.
export default async function MaFichePage({
  searchParams,
}: {
  searchParams: Promise<{ merci?: string; erreur?: string }>;
}) {
  const { merci, erreur } = await searchParams;
  const departments = merci ? [] : await prisma.department.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="min-h-screen bg-ccr-cream">
      <div className="bg-ccr-ink px-6 pb-20 pt-10 text-ccr-cream">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <Image src="/logo-ccr-famille.png" alt="CCR Famille" width={40} height={70} className="h-14 w-auto" />
          <div>
            <h1 className="font-display text-3xl font-black">Ma fiche membre</h1>
            <p className="text-sm text-ccr-cream/70">CCR Famille Casablanca</p>
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-12 max-w-2xl px-6 pb-16">
        <div className="rounded-3xl bg-white p-8 shadow-[0_20px_50px_-25px_rgba(32,28,22,0.35)]">
          {merci ? (
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold">Merci !</h2>
              <p className="mt-2 text-ccr-ink/70">
                Votre fiche a bien été envoyée. Elle sera vérifiée par l&rsquo;équipe avant
                d&rsquo;être enregistrée.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-ccr-ink/70">
                Remplissez ou mettez à jour vos informations. Elles remplaceront celles que
                l&rsquo;église a déjà, après vérification par l&rsquo;équipe.
              </p>
              {erreur && ERREURS[erreur] ? (
                <p className="mt-4 rounded-lg bg-ccr-magenta/10 p-3 text-sm text-ccr-magenta">{ERREURS[erreur]}</p>
              ) : null}

              <form action={submitFiche} className="mt-6 space-y-7">
                <input type="text" name="site_web" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

                <fieldset className="space-y-4">
                  <legend className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-ccr-gold">1. Vous</legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <CheckedField kind="name" label="Nom(s)" name="lastName" autoComplete="family-name" hint="Exemple : KIFILA" inputClassName={field} />
                    <CheckedField kind="name" label="Prénom(s)" name="firstName" autoComplete="given-name" hint="Exemple : Arsène" inputClassName={field} />
                    <CheckedField kind="phone" label="Téléphone (WhatsApp)" name="phone" autoComplete="tel" inputClassName={field} />
                    <CheckedField kind="email" label="E-mail" name="email" autoComplete="email" inputClassName={field} />
                  </div>

                  <div>
                    <span className="text-sm font-semibold">Je suis</span>
                    <div className="mt-2 grid grid-cols-3 gap-2" role="radiogroup">
                      {(["WOMAN", "MAN", "CHILD"] as const).map((v) => (
                        <label key={v} className="cursor-pointer">
                          <input type="radio" name="category" value={v} className="peer sr-only" />
                          <span className="block rounded-xl border border-ccr-ink/15 px-3 py-2.5 text-center text-sm font-semibold transition-colors hover:border-ccr-gold peer-checked:border-ccr-gold peer-checked:bg-ccr-gold peer-checked:text-ccr-ink peer-focus-visible:ring-2 peer-focus-visible:ring-ccr-gold/40">
                            {v === "WOMAN" ? "Une femme" : v === "MAN" ? "Un homme" : "Un enfant"}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-semibold">Quartier</span>
                      <input name="neighborhood" className={field} placeholder="Ex. Maarif" />
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold">Date de naissance <span className="font-normal text-ccr-ink/50">(facultatif)</span></span>
                      <input name="birthDate" type="date" className={field} />
                    </label>
                  </div>
                </fieldset>

                <fieldset className="space-y-4">
                  <legend className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-ccr-gold">2. Votre service</legend>
                  <label className="block">
                    <span className="text-sm font-semibold">Ma fonction dans l&rsquo;église</span>
                    <select name="function" className={field} defaultValue="">
                      <option value="">Aucune pour l&rsquo;instant</option>
                      {CHURCH_FUNCTIONS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-semibold">Le département où je sers</span>
                      <select name="departmentId" className={field} defaultValue="">
                        <option value="">Aucun pour l&rsquo;instant</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold">Mon rôle dans ce département</span>
                      <input name="departmentRole" className={field} placeholder="Ex. choriste, technicien" />
                    </label>
                  </div>
                </fieldset>

                <label className="flex items-start gap-3 rounded-xl bg-ccr-cream p-4 text-sm text-ccr-ink/70">
                  <input type="checkbox" name="consentement" required className="mt-0.5 h-5 w-5 shrink-0 accent-ccr-gold" />
                  <span>
                    J&rsquo;accepte que ces informations soient conservées par CCR Famille pour la vie et
                    l&rsquo;organisation de l&rsquo;église. <span className="text-red-600">*</span>
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full rounded-full bg-ccr-gold px-6 py-3.5 text-sm font-semibold text-ccr-ink transition-colors hover:bg-ccr-gold-light"
                >
                  Envoyer ma fiche
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
