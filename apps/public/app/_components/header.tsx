import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/qui-sommes-nous", label: "Qui sommes-nous" },
  { href: "/cultes-et-programmes", label: "Cultes et programmes" },
  { href: "/departements", label: "Departements" },
  { href: "/galerie", label: "Galerie" },
  { href: "/actualites", label: "Actualites" },
  { href: "/contact", label: "Contact" },
];

// A remplacer par le domaine definitif une fois reserve (section 10 du cahier
// des charges) ; en attendant, pointe vers l'intranet reellement deploye.
const INTRANET_URL =
  process.env.NEXT_PUBLIC_INTRANET_URL ??
  "https://ccr-famille-intranet.vercel.app";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-ccr-ink/10 bg-ccr-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-ccr-famille.jpg"
            alt="CCR Famille"
            width={90}
            height={160}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-ccr-magenta"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
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
            Participer a un culte
          </Link>
        </div>

        {/* Menu sans JavaScript : <details> fait office de disclosure accessible sous md. */}
        <details className="md:hidden">
          <summary className="list-none rounded-full border border-ccr-ink/20 px-3 py-2 text-sm font-medium">
            Menu
          </summary>
          <nav className="absolute left-0 right-0 top-full flex flex-col gap-1 border-b border-ccr-ink/10 bg-ccr-cream px-6 py-4 text-sm font-medium shadow-lg">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="py-2">
                {link.label}
              </Link>
            ))}
            <Link
              href="/cultes-et-programmes"
              className="mt-2 rounded-full bg-ccr-gold px-5 py-2 text-center font-semibold text-ccr-ink"
            >
              Participer a un culte
            </Link>
            <a
              href={INTRANET_URL}
              className="mt-2 rounded-full border border-ccr-ink/20 px-5 py-2 text-center font-semibold"
            >
              Espace membres
            </a>
          </nav>
        </details>
      </div>
    </header>
  );
}
