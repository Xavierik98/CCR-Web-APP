import { prisma } from "@ccr/database";
import type { Metadata } from "next";
import Image from "next/image";
import { CATEGORY_LABELS, PROFESSIONAL_LABELS } from "@/lib/labels";
import { CHURCH_FUNCTIONS } from "@/lib/members";
import { submitFiche } from "./actions";

export const metadata: Metadata = {
  title: "Ma fiche membre | CCR Famille",
  description: "Mettez à jour vos informations de membre de CCR Famille Casablanca.",
};

export const dynamic = "force-dynamic";

const ERREURS: Record<string, string> = {
  nom: "Merci d'indiquer votre prénom et votre nom.",
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

              <form action={submitFiche} className="mt-6 space-y-6">
                <input type="text" name="site_web" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold">Prénom(s) *</span>
                    <input name="firstName" required className={field} />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold">Nom *</span>
                    <input name="lastName" required className={field} />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold">Téléphone (WhatsApp)</span>
                    <input name="phone" inputMode="tel" placeholder="06 00 00 00 00" className={field} />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold">E-mail</span>
                    <input name="email" type="email" className={field} />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold">Date de naissance</span>
                    <input name="birthDate" type="date" className={field} />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold">Quartier</span>
                    <input name="neighborhood" className={field} />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold">Je suis</span>
                    <select name="category" className={field} defaultValue="">
                      <option value="">Choisir…</option>
                      {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>
                          {v === "CHILD" ? "Un enfant (fiche remplie par un parent)" : l}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold">Situation professionnelle</span>
                    <select name="professionalStatus" className={field} defaultValue="">
                      <option value="">Choisir…</option>
                      {Object.entries(PROFESSIONAL_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <fieldset>
                  <legend className="text-sm font-semibold">Mes fonctions dans l&rsquo;église</legend>
                  <div className="mt-2 grid gap-1 sm:grid-cols-2">
                    {CHURCH_FUNCTIONS.map((f) => (
                      <label key={f} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" name="functions" value={f} className="h-4 w-4 accent-ccr-gold" />
                        {f}
                      </label>
                    ))}
                  </div>
                  <input name="functionsOther" placeholder="Autre fonction (facultatif)" className={`${field} mt-3`} />
                </fieldset>

                <fieldset>
                  <legend className="text-sm font-semibold">Les départements où je sers</legend>
                  <div className="mt-2 space-y-2">
                    {departments.map((d) => (
                      <div key={d.id} className="grid items-center gap-2 sm:grid-cols-[1fr_1fr]">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" name="departments" value={d.id} className="h-4 w-4 accent-ccr-gold" />
                          {d.name}
                        </label>
                        <input
                          name={`role_${d.id}`}
                          placeholder="Ma fonction (ex. choriste)"
                          className="rounded-lg border border-ccr-ink/15 px-3 py-1.5 text-sm outline-none focus:border-ccr-gold"
                        />
                      </div>
                    ))}
                  </div>
                </fieldset>

                <label className="block">
                  <span className="text-sm font-semibold">Remarques</span>
                  <textarea name="message" rows={3} className={field} />
                </label>

                <label className="flex items-start gap-2 text-sm text-ccr-ink/70">
                  <input type="checkbox" name="consentement" required className="mt-1 h-4 w-4 accent-ccr-gold" />
                  J&rsquo;accepte que ces informations soient conservées par CCR Famille pour la vie et
                  l&rsquo;organisation de l&rsquo;église.
                </label>

                <button
                  type="submit"
                  className="w-full rounded-full bg-ccr-gold px-6 py-3 text-sm font-semibold text-ccr-ink transition-colors hover:bg-ccr-gold-light"
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
