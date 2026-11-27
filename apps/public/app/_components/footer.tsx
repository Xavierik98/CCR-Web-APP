import Link from "next/link";
import { FooterMap } from "./footer-map";
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

const NAV = [
  { href: "/a-propos", label: "À propos" },
  { href: "/cultes-et-programmes", label: "Cultes et programmes" },
  { href: "/departements", label: "Départements" },
  { href: "/actualites", label: "Actualités" },
  { href: "/galerie", label: "Galerie" },
  { href: "/#soutenir", label: "Faire un don" },
  { href: "/contact", label: "Contact" },
];

// Fond plus profond que les sections sombres du site et liseré doré en haut :
// le pied de page se distingue toujours du contenu qui le précède.
export function Footer() {
  return (
    <footer className="relative bg-[#13100c] text-ccr-cream">
      <div
        aria-hidden="true"
        className="h-[3px] bg-gradient-to-r from-ccr-magenta via-ccr-gold-light to-ccr-blue"
      />
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 sm:px-6 md:grid-cols-2 md:gap-9 md:py-12 lg:grid-cols-[1.1fr_0.9fr_1.6fr]">
        <div>
          <p className="font-display text-xl font-bold">CCR Famille</p>
          <p className="mt-1 text-sm text-ccr-cream/70">Centre Chrétien de Restauration, Casablanca</p>
          <p className="mt-4 hidden gap-4 text-xs font-semibold uppercase tracking-[0.2em] md:flex">
            <span className="text-ccr-gold-light">Rassembler</span>
            <span className="text-ccr-magenta">Former</span>
            <span className="text-[#6f9fe0]">Envoyer</span>
          </p>
          <div className="mt-4 flex items-center gap-2 md:mt-5">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.href ?? "/contact"}
                target={social.href ? "_blank" : undefined}
                rel={social.href ? "noopener noreferrer" : undefined}
                aria-label={social.label}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-ccr-cream/20 text-ccr-cream/80 transition-colors hover:border-ccr-gold-light hover:text-ccr-gold-light"
              >
                <Icon name={social.name} className="h-4 w-4" />
              </a>
            ))}
            <a
              href={WHATSAPP_URL ?? "/contact"}
              target={WHATSAPP_URL ? "_blank" : undefined}
              rel={WHATSAPP_URL ? "noopener noreferrer" : undefined}
              aria-label="WhatsApp"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-ccr-cream/20 text-ccr-cream/80 transition-colors hover:border-ccr-gold-light hover:text-ccr-gold-light"
            >
              <Icon name="whatsapp" className="h-4 w-4" />
            </a>
          </div>
          <a
            href={INTRANET_URL}
            className="mt-6 hidden text-sm font-semibold text-ccr-gold-light hover:underline md:inline-block"
          >
            Espace membres &rarr;
          </a>
        </div>

        <nav>
          <p className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-ccr-gold-light md:block">
            Navigation
          </p>
          <ul className="grid grid-cols-3 gap-x-3 gap-y-2 text-[13px] text-ccr-cream/80 md:mt-3 md:grid-cols-2 md:gap-x-6 md:gap-y-2.5 md:text-sm lg:grid-cols-1 lg:gap-y-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-ccr-gold-light">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-2 lg:col-span-1">
          <p className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-ccr-gold-light md:block">
            Nous trouver
          </p>
          <p className="flex items-start gap-2 text-[13px] text-ccr-cream/80 md:mt-3 md:text-sm">
            <Icon name="map" className="mt-0.5 h-4 w-4 shrink-0 text-ccr-gold-light" />
            {ADRESSE}
          </p>
          <p className="mt-1 hidden pl-6 text-xs text-ccr-cream/50 md:block">Téléphone et e-mail à venir</p>
          {/* Carte masquée sur téléphone : elle est sur la page Contact. */}
          <div className="hidden md:block">
            <FooterMap src={MAPS_EMBED_SRC} title={`Localisation CCR Famille - ${ADRESSE}`} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-ccr-cream/10 px-5 py-3.5 text-xs text-ccr-cream/50 md:justify-center md:px-6 md:py-4">
        <span>© {new Date().getFullYear()} CCR Famille Casablanca</span>
        <a href={INTRANET_URL} className="font-semibold text-ccr-gold-light md:hidden">
          Espace membres &rarr;
        </a>
      </div>
    </footer>
  );
}
