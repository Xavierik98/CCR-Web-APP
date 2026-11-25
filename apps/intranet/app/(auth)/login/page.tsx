import Image from "next/image";

// Section 2.A du cahier des charges. Formulaire affiché seulement : la vérification
// des identifiants, la gestion de session et le verrouillage après échecs répétés
// restent à câbler avec Supabase Auth (décision du 25/11, section 7).

const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_PUBLIC_SITE_URL ?? "https://ccr-famille-public.vercel.app";

export default function LoginPage() {
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
            Connectez-vous pour accéder à l&rsquo;intranet CCR Famille.
          </p>
        </div>

        <form className="mt-8 flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="text-sm font-semibold text-ccr-ink">
              Identifiant ou e-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              className="mt-1 w-full rounded-lg border border-ccr-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-ccr-gold focus:ring-2 focus:ring-ccr-gold/30"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-semibold text-ccr-ink">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-ccr-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-ccr-gold focus:ring-2 focus:ring-ccr-gold/30"
            />
          </div>
          <button
            type="submit"
            className="mt-2 rounded-full bg-ccr-gold px-6 py-3 text-sm font-semibold text-ccr-ink transition-colors hover:bg-ccr-gold-light"
          >
            Se connecter
          </button>
        </form>
      </div>
    </main>
  );
}
