import Link from "next/link";
import { Icon } from "./icon";
import { ADRESSE, MAPS_EMBED_SRC } from "../_data/contact";
import { SOCIAL_LINKS } from "../_data/social";
import { buildWhatsAppLink } from "../_data/whatsapp";

const WHATSAPP_URL = buildWhatsAppLink("Bonjour, je vous contacte depuis le site de CCR Famille.");

// Coordonnées volontairement génériques : téléphone et e-mail réels à fournir
// (section 10 du cahier des charges), pas d'information inventée ici.
const INTRANET_URL =
  process.env.NEXT_PUBLIC_INTRANET_URL ??
  "https://ccr-famille-intranet.vercel.app";

export function Footer() {
  return (
    <footer className="border-t border-ccr-ink/10 bg-ccr-ink text-ccr-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-8 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold">CCR Famille</p>
          <p className="mt-1 text-xs text-ccr-cream/70">
            Centre Chrétien de Restauration
          </p>
          <p className="text-xs text-ccr-cream/70">Casablanca, Maroc</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ccr-gold-light">
            Rassembler &middot; Former &middot; Envoyer
          </p>
          <div className="mt-4 flex items-center gap-2">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.href ?? "/contact"}
                target={social.href ? "_blank" : undefined}
                rel={social.href ? "noopener noreferrer" : undefined}
                aria-label={social.label}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-ccr-cream/20 text-ccr-cream/80 transition-colors hover:border-ccr-gold-light hover:text-ccr-gold-light"
              >
                <Icon name={social.name} className="h-3.5 w-3.5" />
              </a>
            ))}
            <a
              href={WHATSAPP_URL ?? "/contact"}
              target={WHATSAPP_URL ? "_blank" : undefined}
              rel={WHATSAPP_URL ? "noopener noreferrer" : undefined}
              aria-label="WhatsApp"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-ccr-cream/20 text-ccr-cream/80 transition-colors hover:border-ccr-gold-light hover:text-ccr-gold-light"
            >
              <Icon name="whatsapp" className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ccr-gold-light">
            Navigation
          </p>
          <ul className="mt-2 space-y-1.5 text-xs text-ccr-cream/80">
            <li>
              <Link href="/a-propos">À propos</Link>
            </li>
            <li>
              <Link href="/cultes-et-programmes">Cultes et programmes</Link>
            </li>
            <li>
              <Link href="/departements">Départements</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ccr-gold-light">
            Nous contacter
          </p>
          <p className="mt-2 text-xs text-ccr-cream/80">
            {ADRESSE}
            <br />
            Téléphone et e-mail à venir
          </p>
          <div className="mt-3 aspect-[16/9] w-full max-w-[180px] overflow-hidden rounded-lg border border-ccr-cream/10 grayscale transition-all hover:grayscale-0">
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
            className="mt-3 inline-block text-xs font-semibold text-ccr-gold-light hover:underline"
          >
            Espace membres &rarr;
          </a>
        </div>
      </div>

      <div className="border-t border-ccr-cream/10 px-6 py-3 text-center text-xs text-ccr-cream/60">
        © {new Date().getFullYear()} CCR Famille Casablanca
      </div>
    </footer>
  );
}
