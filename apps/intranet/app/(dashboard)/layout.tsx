import Image from "next/image";
import Link from "next/link";
import { ROLE_LABELS, requireUser, SOCIAL } from "@/lib/auth";
import { signOut } from "../(auth)/login/actions";

// Données toujours lues à la demande : jamais de page figée au moment du build.
export const dynamic = "force-dynamic";

// Coquille du tableau de bord (section 3) : menu latéral filtré selon le rôle
// de la personne connectée.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  const nav = [
    { href: "/tableau-de-bord", label: "Tableau de bord" },
    { href: "/membres", label: "Membres" },
    { href: "/presences", label: "Présences" },
    { href: "/departements", label: "Départements et groupes" },
    { href: "/collecte", label: "Collecte" },
    { href: "/cms", label: "Actualités" },
    ...(SOCIAL.includes(user.role)
      ? [{ href: "/accompagnement-social", label: "Accompagnement social" }]
      : []),
    ...(user.role === "SUPER_ADMIN"
      ? [{ href: "/utilisateurs", label: "Utilisateurs" }]
      : []),
  ];

  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-ccr-ink text-ccr-cream md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col">
        <div className="flex items-center gap-3 px-6 py-5">
          <Image src="/logo-ccr-famille.png" alt="" width={32} height={56} className="h-10 w-auto" />
          <div>
            <p className="font-display text-lg font-bold leading-tight">CCR Famille</p>
            <p className="text-xs text-ccr-cream/50">Intranet</p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:overflow-visible">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-ccr-cream/80 transition-colors hover:bg-ccr-cream/10 hover:text-ccr-cream"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden border-t border-ccr-cream/10 px-6 py-4 md:block">
          <p className="truncate text-xs text-ccr-cream/70">{user.email}</p>
          <p className="text-xs text-ccr-gold-light">{ROLE_LABELS[user.role]}</p>
          <form action={signOut}>
            <button type="submit" className="mt-3 text-xs font-semibold text-ccr-cream/60 hover:text-ccr-cream">
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 px-6 py-8 md:px-10 md:py-10">{children}</main>
    </div>
  );
}
