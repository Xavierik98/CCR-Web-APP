import Link from "next/link";
import { ADRESSE, MAPS_EMBED_SRC } from "../_data/contact";

// Coordonnees volontairement generiques : telephone et e-mail reels a fournir
// (section 10 du cahier des charges), pas d'information inventee ici.
const INTRANET_URL =
  process.env.NEXT_PUBLIC_INTRANET_URL ??
  "https://ccr-famille-intranet.vercel.app";

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
              <Link href="/a-propos">A propos</Link>
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
            {ADRESSE}
            <br />
            Telephone et e-mail a venir
          </p>
          <div className="mt-4 aspect-[16/10] w-full max-w-xs overflow-hidden rounded-xl border border-ccr-cream/10 grayscale transition-all hover:grayscale-0">
            <iframe
              title={`Localisation CCR Famille - ${ADRESSE}`}
              src={MAPS_EMBED_SRC}
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a
            href={INTRANET_URL}
            className="mt-4 inline-block text-sm font-semibold text-ccr-gold-light hover:underline"
          >
            Espace membres &rarr;
          </a>
        </div>
      </div>

      <div className="border-t border-ccr-cream/10 px-6 py-4 text-center text-xs text-ccr-cream/60">
        © {new Date().getFullYear()} CCR Famille Casablanca
      </div>
    </footer>
  );
}
