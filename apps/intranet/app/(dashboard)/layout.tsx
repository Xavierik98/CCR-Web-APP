import { prisma } from "@ccr/database";
import Image from "next/image";
import { Icon } from "@/components/icons";
import { SidebarNav, type NavItem } from "@/components/sidebar-nav";
import { TopBar } from "@/components/top-bar";
import { ROLE_LABELS, canEdit, canView, getDisplayName, requireUser, type Module } from "@/lib/auth";
import { pledgesToRemind } from "@/lib/pledges";
import { signOut } from "../(auth)/login/actions";

// Données toujours lues à la demande : jamais de page figée au moment du build.
export const dynamic = "force-dynamic";

// Adresse du site public (modifiable par variable d'environnement le jour où
// un nom de domaine propre sera branché).
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ccr-famille-public.vercel.app";

const NAV: (Omit<NavItem, "count"> & { module?: Module })[] = [
  { href: "/tableau-de-bord", label: "Tableau de bord", icon: "home" },
  { href: "/mes-taches", label: "Mes tâches", icon: "calendar" },
  { href: "/membres", label: "Membres", icon: "users", module: "membres" },
  { href: "/presences", label: "Présences", icon: "check", module: "presences" },
  { href: "/departements", label: "Départements", icon: "layers", module: "departements" },
  { href: "/collecte", label: "Collecte", icon: "coins", module: "collecte" },
  { href: "/cms", label: "Actualités", icon: "megaphone", module: "actualites" },
  { href: "/fiches", label: "Fiches à valider", icon: "inbox", module: "fiches" },
  { href: "/messages", label: "Messages du site", icon: "megaphone", module: "messages" },
  { href: "/taches", label: "Tâches des responsables", icon: "list", module: "taches" },
  { href: "/besoins", label: "États de besoin", icon: "list", module: "besoins" },
  { href: "/accompagnement-social/demandes", label: "Accompagnement social", icon: "heart", module: "social" },
  { href: "/dossiers-sejour", label: "Dossiers de séjour", icon: "inbox", module: "sejour" },
  { href: "/utilisateurs", label: "Accès et rôles", icon: "key", module: "utilisateurs" },
];

// Coquille du tableau de bord : le menu ne montre que les rubriques que le
// rôle de la personne connectée peut ouvrir.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [pendingFiches, myTasks] = await Promise.all([
    canView(user.role, "fiches") ? prisma.memberSubmission.count({ where: { status: "PENDING" } }) : 0,
    prisma.task.count({ where: { assigneeId: user.id, doneAt: null } }),
  ]);
  const myReminders = user.role === "TREASURER" ? (await pledgesToRemind()).length : 0;
  const supportRequests = canView(user.role, "social") ? await prisma.supportRequest.count({ where: { status: "NEW" } }) : 0;
  const siteMessages = canView(user.role, "messages") ? await prisma.contactMessage.count({ where: { status: "NEW" } }) : 0;
  const needsToDecide = canEdit(user.role, "besoins") ? await prisma.needsStatement.count({ where: { status: "SUBMITTED" } }) : 0;

  const items: NavItem[] = NAV.filter((n) => !n.module || canView(user.role, n.module)).map(
    ({ module, ...n }) => ({
      ...n,
      count:
        module === "fiches"
          ? pendingFiches
          : module === "social"
            ? supportRequests
            : module === "messages"
              ? siteMessages
            : module === "besoins"
              ? needsToDecide
            : n.href === "/mes-taches"
              ? myTasks + myReminders
              : undefined,
    }),
  );
  const name = await getDisplayName(user);
  const initials = name.initials;

  return (
    <div className="min-h-screen bg-ccr-cream md:flex print:bg-white">
      <aside className="bg-ccr-ink text-ccr-cream print:hidden md:sticky md:top-0 md:flex md:h-screen md:w-[260px] md:shrink-0 md:flex-col">
        <div className="flex items-center gap-3 px-6 pb-6 pt-6">
          <Image src="/logo-ccr-famille.png" alt="" width={32} height={56} className="h-11 w-auto" />
          <div>
            <p className="font-display text-lg font-bold leading-tight">CCR Famille</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ccr-gold-light/80">Espace gestion</p>
          </div>
        </div>
        <SidebarNav items={items} />
        <div className="border-t border-ccr-cream/10 p-3 md:p-4">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ccr-cream/10 text-xs font-bold text-ccr-gold-light">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ccr-cream">{name.full}</p>
              <p className="text-xs leading-tight text-ccr-gold-light">{ROLE_LABELS[user.role]}</p>
              <p className="truncate text-[11px] text-ccr-cream/50">{user.email}</p>
            </div>
            <form action={signOut}>
              <button type="submit" title="Se déconnecter" className="rounded-lg p-1.5 text-ccr-cream/50 hover:bg-ccr-cream/10 hover:text-ccr-cream">
                <Icon name="logout" className="h-4 w-4" />
                <span className="sr-only">Se déconnecter</span>
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-5 py-6 md:px-10 md:py-8 print:p-0">
        <TopBar siteUrl={SITE_URL} />
        {children}
      </main>
    </div>
  );
}
