import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActualiteMedia } from "../../_components/actualite-media";
import { getCampagne, periode } from "../../_data/engagements";
import { PledgeForm } from "./_components/pledge-form";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const c = await getCampagne((await params).id);
  return { title: c ? `Engagement : ${c.nom}` : "Engagement", robots: { index: false } };
}

// Formulaire d'engagement d'une campagne, envoyé par la trésorerie (lien ou QR code).
export default async function EngagementPage({ params }: { params: Promise<{ id: string }> }) {
  const c = await getCampagne((await params).id);
  if (!c) notFound();
  const media = c.image || c.video;

  return (
    <main className="bg-ccr-cream">
      <section className="bg-ccr-ink px-5 pb-20 pt-12 text-ccr-cream sm:px-6">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ccr-gold-light">
            {c.mensuel ? "Engagement mensuel" : "Prendre un engagement"}
          </p>
          <h1 className="mt-2 font-display text-3xl font-black sm:text-5xl">{c.nom}</h1>
          <p className="mt-2 text-sm text-ccr-cream/70">{periode(c)}</p>
          {c.description ? <p className="mt-3 whitespace-pre-line text-sm text-ccr-cream/80 sm:text-base">{c.description}</p> : null}
        </div>
      </section>
      <div className="mx-auto -mt-12 max-w-2xl space-y-5 px-4 pb-16 sm:px-6">
        {media ? (
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-ccr-ink shadow-xl">
            <ActualiteMedia article={{ slug: c.id, titre: c.nom, texte: "", date: c.debut, image: c.image, video: c.video, portrait: Boolean(c.image && !c.video) }} sizes="(min-width: 768px) 672px, 100vw" />
          </div>
        ) : null}
        <div className="rounded-3xl border border-white/70 bg-white p-5 shadow-[0_20px_60px_-30px_rgba(32,28,22,0.35)] sm:p-8">
          <h2 className="font-display text-xl font-bold">Mon engagement</h2>
          <p className="mt-1 text-sm text-ccr-ink/60">
            {c.mensuel
              ? "Indiquez le montant que vous souhaitez donner chaque mois. La trésorerie vous enverra un petit rappel mensuel sur WhatsApp."
              : "Indiquez vos coordonnées et le montant que vous souhaitez donner."}
          </p>
          <div className="mt-5">
            <PledgeForm id={c.id} mensuel={c.mensuel} nom={c.nom} />
          </div>
        </div>
        <p className="text-center text-xs text-ccr-ink/50">
          <Link href="/engagement" className="font-semibold text-ccr-magenta hover:underline">Voir toutes les campagnes</Link>
        </p>
      </div>
    </main>
  );
}
