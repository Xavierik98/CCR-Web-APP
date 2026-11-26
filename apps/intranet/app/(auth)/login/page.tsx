import Image from "next/image";
import { supabaseEnv } from "@/lib/supabase";
import { sendMagicLink } from "./actions";

// Section 2.A du cahier des charges. Connexion sans mot de passe : Supabase
// Auth envoie un lien à usage unique aux adresses enregistrées dans la table
// User (verrouillage et anti-abus gérés par Supabase).

const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_PUBLIC_SITE_URL ?? "https://ccr-famille-public.vercel.app";

const MESSAGES: Record<string, string> = {
  acces: "Votre adresse n'a pas encore accès à l'intranet. Demandez à un administrateur de l'ajouter.",
  lien: "Ce lien de connexion a expiré ou a déjà servi. Demandez-en un nouveau.",
  email: "Indiquez votre adresse e-mail.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ envoye?: string; erreur?: string }>;
}) {
  const { envoye, erreur } = await searchParams;
  const configured = supabaseEnv() !== null;

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-ccr-ink px-6 py-12">
      <a
        href={PUBLIC_SITE_URL}
        className="absolute left-6 top-6 inline-flex items-center gap-2 text-sm font-semibold text-ccr-cream/70 transition-colors hover:text-ccr-cream"
      >
        <span aria-hidden="true">&larr;</span> Retour au site
      </a>

      <div className="w-full max-w-sm rounded-2xl bg-ccr-cream p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/logo-ccr-famille.png"
            alt="CCR Famille"
            width={72}
            height={128}
            className="h-16 w-auto object-contain"
            priority
          />
          <h1 className="mt-4 font-display text-2xl font-black text-ccr-ink">
            Espace membres
          </h1>
          <p className="mt-1 text-sm text-ccr-ink/60">
            Recevez un lien de connexion sur votre adresse e-mail.
          </p>
        </div>

        {!configured ? (
          <p className="mt-8 rounded-lg bg-ccr-magenta/10 p-4 text-sm text-ccr-magenta">
            La base de données n&rsquo;est pas encore reliée à ce site.
            L&rsquo;administrateur technique doit connecter Supabase au projet
            Vercel de l&rsquo;intranet.
          </p>
        ) : envoye ? (
          <p className="mt-8 rounded-lg bg-ccr-gold/15 p-4 text-sm text-ccr-ink">
            Si cette adresse a accès à l&rsquo;intranet, un lien de connexion
            vient de lui être envoyé. Ouvrez-le dans ce même navigateur.
          </p>
        ) : (
          <form action={sendMagicLink} className="mt-8 flex flex-col gap-4">
            {erreur && MESSAGES[erreur] ? (
              <p className="rounded-lg bg-ccr-magenta/10 p-3 text-sm text-ccr-magenta">
                {MESSAGES[erreur]}
              </p>
            ) : null}
            <div>
              <label htmlFor="email" className="text-sm font-semibold text-ccr-ink">
                Adresse e-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1 w-full rounded-lg border border-ccr-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-ccr-gold focus:ring-2 focus:ring-ccr-gold/30"
              />
            </div>
            <button
              type="submit"
              className="mt-2 rounded-full bg-ccr-gold px-6 py-3 text-sm font-semibold text-ccr-ink transition-colors hover:bg-ccr-gold-light"
            >
              Recevoir mon lien de connexion
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
