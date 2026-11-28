import type { Metadata } from "next";
import { SupportForm } from "./_components/support-form";

export const metadata: Metadata = {
  title: "Demande de soutien",
  description: "Demander un soutien alimentaire à l'équipe sociale de CCR Famille Casablanca.",
};

const INTRANET_URL = process.env.NEXT_PUBLIC_INTRANET_URL ?? "https://ccr-famille-intranet.vercel.app";

export default function DemandeDeSoutienPage() {
  return (
    <main className="bg-ccr-cream">
      <section className="bg-ccr-ink px-5 pb-20 pt-12 text-ccr-cream sm:px-6">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ccr-gold-light">Entraide</p>
          <h1 className="mt-2 font-display text-3xl font-black sm:text-5xl">Demande de soutien</h1>
          <p className="mt-3 text-sm text-ccr-cream/75 sm:text-base">
            Vous traversez une période difficile ? L&rsquo;équipe sociale de l&rsquo;église peut vous aider avec des
            denrées alimentaires. Remplissez ce formulaire, nous vous recontactons.
          </p>
        </div>
      </section>
      <div className="mx-auto -mt-12 max-w-2xl px-4 pb-16 sm:px-6">
        <SupportForm endpoint={`${INTRANET_URL}/api/soutien`} />
      </div>
    </main>
  );
}
