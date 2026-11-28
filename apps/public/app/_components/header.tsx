import Image from "next/image";
import Link from "next/link";
import { buildWhatsAppLink } from "../_data/whatsapp";
import { MobileNav } from "./mobile-nav";

// Actualités et Galerie retirées du menu (25/11) : déjà présentes sur
// l'accueil, les pages complètes restent accessibles via "en savoir plus".
const NAV_LINKS = [
  { href: "/a-propos", label: "À propos" },
  { href: "/cultes-et-programmes", label: "Cultes et programmes" },
  { href: "/departements", label: "Départements" },
  { href: "/contact", label: "Contact" },
];

// À remplacer par le domaine définitif une fois réservé (section 10 du cahier
// des charges) ; en attendant, pointe vers l'intranet réellement déployé.
const INTRANET_URL =
  process.env.NEXT_PUBLIC_INTRANET_URL ??
  "https://ccr-famille-intranet.vercel.app";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/50 bg-ccr-cream/75 shadow-[0_8px_30px_-12px_rgba(32,28,22,0.35)] backdrop-blur-xl backdrop-saturate-150 after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-gradient-to-r after:from-ccr-magenta after:via-ccr-gold-light after:to-ccr-blue after:content-['']">
      <div className="mx-auto grid max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-6 px-4 py-1.5 sm:px-6 md:py-2">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-ccr-famille.png"
            alt="CCR Famille"
            width={120}
            height={213}
            className="h-14 w-auto object-contain md:h-20"
            priority
          />
        </Link>

        <nav className="hidden items-center justify-center gap-6 text-sm font-medium md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-ccr-magenta"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/demande-de-soutien" className="font-semibold text-ccr-magenta transition-colors hover:text-ccr-ink">
            Besoin d&rsquo;aide ?
          </Link>
        </nav>

        <div className="hidden items-center justify-end gap-3 md:flex">
          <a
            href={INTRANET_URL}
            className="whitespace-nowrap rounded-full border border-ccr-ink/20 px-5 py-2 text-sm font-semibold transition-colors hover:border-ccr-ink"
          >
            Espace membres
          </a>
          <Link
            href="/cultes-et-programmes"
            className="whitespace-nowrap rounded-full bg-ccr-gold px-5 py-2 text-sm font-semibold text-ccr-ink transition-colors hover:bg-ccr-gold-light"
          >
            Participer à un culte
          </Link>
        </div>

        <div className="justify-self-end md:hidden">
          <MobileNav
            links={NAV_LINKS}
            intranetUrl={INTRANET_URL}
            whatsappUrl={buildWhatsAppLink("Bonjour, je souhaite avoir des informations sur CCR Famille.")}
          />
        </div>
      </div>
    </header>
  );
}
