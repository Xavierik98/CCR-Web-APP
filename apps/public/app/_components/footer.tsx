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
      {/* Même structure que sur ordinateur (marque, navigation, adresse), en
          plus petit sur téléphone : marque et navigation côte à côte. */}
      <div className="mx-auto grid max-w-6xl grid-cols-[1.2fr_1fr] gap-x-5 gap-y-5 px-5 py-7 sm:px-6 md:grid-cols-2 md:gap-9 md:py-12 lg:grid-cols-[1.1fr_0.9fr_1.6fr]">
        <div>
          <p className="font-display text-base font-bold md:text-xl">CCR Famille</p>
          <p className="mt-0.5 text-[11px] leading-snug text-ccr-cream/65 md:mt-1 md:text-sm">
            Centre Chrétien de Restauration
            <br />
            Casablanca, Maroc
          </p>
          <p className="mt-2.5 flex flex-wrap gap-x-2.5 gap-y-1 text-[9px] font-semibold uppercase tracking-[0.15em] md:mt-4 md:gap-4 md:text-xs md:tracking-[0.2em]">
            <span className="text-ccr-gold-light">Rassembler</span>
            <span className="text-ccr-magenta">Former</span>
            <span className="text-[#6f9fe0]">Envoyer</span>
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-1.5 md:mt-5 md:gap-2">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.href ?? "/contact"}
                target={social.href ? "_blank" : undefined}
                rel={social.href ? "noopener noreferrer" : undefined}
                aria-label={social.label}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-ccr-cream/20 text-ccr-cream/80 transition-colors hover:border-ccr-gold-light hover:text-ccr-gold-light md:h-8 md:w-8"
              >
                <Icon name={social.name} className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </a>
            ))}
            <a
              href={WHATSAPP_URL ?? "/contact"}
              target={WHATSAPP_URL ? "_blank" : undefined}
              rel={WHATSAPP_URL ? "noopener noreferrer" : undefined}
              aria-label="WhatsApp"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-ccr-cream/20 text-ccr-cream/80 transition-colors hover:border-ccr-gold-light hover:text-ccr-gold-light md:h-8 md:w-8"
            >
              <Icon name="whatsapp" className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </a>
          </div>
          <a href={INTRANET_URL} className="mt-3 inline-block text-xs font-semibold text-ccr-gold-light hover:underline md:mt-6 md:text-sm">
            Espace membres &rarr;
          </a>
        </div>

        <nav>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ccr-gold-light md:text-xs">Navigation</p>
          <ul className="mt-2 space-y-1.5 text-xs text-ccr-cream/80 md:mt-3 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-2.5 md:space-y-0 md:text-sm lg:grid-cols-1 lg:gap-y-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-ccr-gold-light">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-2 border-t border-ccr-cream/10 pt-4 md:col-span-2 md:border-0 md:pt-0 lg:col-span-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ccr-gold-light md:text-xs">Nous trouver</p>
          <p className="mt-2 flex items-start gap-2 text-xs text-ccr-cream/80 md:mt-3 md:text-sm">
            <Icon name="map" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ccr-gold-light md:h-4 md:w-4" />
            {ADRESSE}
          </p>
          <p className="mt-1 pl-5 text-[10px] text-ccr-cream/50 md:pl-6 md:text-xs">Téléphone et e-mail à venir</p>
          {/* Carte masquée sur téléphone : elle est sur la page Contact. */}
          <div className="hidden md:block">
            <FooterMap src={MAPS_EMBED_SRC} title={`Localisation CCR Famille - ${ADRESSE}`} />
          </div>
        </div>
      </div>

      <div className="border-t border-ccr-cream/10 px-5 py-3 text-center text-[10px] text-ccr-cream/50 md:px-6 md:py-4 md:text-xs">
        © {new Date().getFullYear()} CCR Famille Casablanca
      </div>
    </footer>
  );
}
