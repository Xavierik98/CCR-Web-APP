import type { Metadata } from "next";
import Link from "next/link";
import { getCampagnes, periode } from "../_data/engagements";

export const metadata: Metadata = {
  title: "Prendre un engagement",
  description: "Campagnes de l'église CCR Famille Casablanca auxquelles vous pouvez vous engager.",
};

export default async function EngagementsPage() {
  const campagnes = await getCampagnes();
  return (
    <main className="bg-ccr-cream">
      <section className="bg-ccr-ink px-5 pb-16 pt-12 text-ccr-cream sm:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ccr-gold-light">Soutenir l&rsquo;œuvre</p>
          <h1 className="mt-2 font-display text-3xl font-black sm:text-5xl">Prendre un engagement</h1>
          <p className="mt-3 text-sm text-ccr-cream/75 sm:text-base">Choisissez la campagne que vous souhaitez soutenir.</p>
        </div>
      </section>
      <div className="mx-auto -mt-8 max-w-3xl px-4 pb-16 sm:px-6">
        {campagnes.length === 0 ? (
          <p className="rounded-3xl bg-white p-6 text-center text-sm text-ccr-ink/60">Aucune campagne ouverte pour le moment.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {campagnes.map((c) => (
              <Link key={c.id} href={`/engagement/${c.id}`} className="group overflow-hidden rounded-3xl border border-ccr-ink/10 bg-white transition-transform hover:-translate-y-0.5">
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image} alt="" className="aspect-[16/9] w-full object-cover" />
                ) : (
                  <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-ccr-gold to-ccr-magenta p-4 text-center font-display text-xl font-black text-white">
                    {c.nom}
                  </div>
                )}
                <div className="p-4">
                  {c.mensuel ? <span className="rounded-full bg-ccr-gold/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">Mensuel</span> : null}
                  <p className="mt-1 font-display text-lg font-bold">{c.nom}</p>
                  <p className="text-xs text-ccr-ink/60">{periode(c)}</p>
                  <p className="mt-2 text-sm font-semibold text-ccr-magenta group-hover:underline">Je m&rsquo;engage &rarr;</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
