import Link from "next/link";

// Coordonnees volontairement generiques : adresse, telephone et horaires reels
// a fournir (section 10 du cahier des charges), pas d'information inventee ici.
export function Footer() {
  return (
    <footer className="border-t border-ccr-ink/10 bg-ccr-ink text-ccr-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-xl font-bold">CCR Famille</p>
          <p className="mt-2 text-sm text-ccr-cream/70">Casablanca, Maroc</p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-ccr-gold-light">
            Navigation
          </p>
          <ul className="mt-3 space-y-2 text-sm text-ccr-cream/80">
            <li>
              <Link href="/qui-sommes-nous">Qui sommes-nous</Link>
            </li>
            <li>
              <Link href="/cultes-et-programmes">Cultes et programmes</Link>
            </li>
            <li>
              <Link href="/departements">Departements</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-ccr-gold-light">
            Nous contacter
          </p>
          <p className="mt-3 text-sm text-ccr-cream/80">
            Coordonnees a venir.
          </p>
        </div>
      </div>

      <div className="border-t border-ccr-cream/10 px-6 py-4 text-center text-xs text-ccr-cream/60">
        © {new Date().getFullYear()} CCR Famille Casablanca
      </div>
    </footer>
  );
}
