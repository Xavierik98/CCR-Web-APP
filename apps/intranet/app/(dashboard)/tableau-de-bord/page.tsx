import { getAttendanceSummary, prisma } from "@ccr/database";
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";
import { Notice } from "@/components/ui";
import { canEdit, canView, requireUser } from "@/lib/auth";
import { CONTENT_STATUS_LABELS, formatDate, fullName } from "@/lib/labels";
import { formatOccurrence, nextCulte, upcoming } from "@/lib/programme";
import { formatDue } from "@/lib/tasks";

const TONES = {
  gold: "bg-ccr-gold/15 text-[#b07a12]",
  blue: "bg-ccr-blue/10 text-ccr-blue",
  magenta: "bg-ccr-magenta/10 text-ccr-magenta",
  ink: "bg-ccr-ink/5 text-ccr-ink/70",
};

function StatCard({
  icon,
  tone,
  label,
  value,
  hint,
  href,
}: {
  icon: IconName;
  tone: keyof typeof TONES;
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  href?: string;
}) {
  const body = (
    <div className="h-full rounded-2xl border border-ccr-ink/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(32,28,22,0.04)] transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(32,28,22,0.18)]">
      <div className="flex items-start justify-between">
        <p className="text-sm text-ccr-ink/60">{label}</p>
        <span className={`flex h-10 w-10 items-center justify-center rounded-full ${TONES[tone]}`}>
          <Icon name={icon} className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-1 font-display text-4xl font-black [font-variant-numeric:lining-nums]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ccr-ink/50">{hint}</p> : null}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

function Panel({ title, action, children, className = "" }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-ccr-ink/[0.06] bg-white p-6 shadow-[0_1px_2px_rgba(32,28,22,0.04)] ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function MoreLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-sm font-semibold text-ccr-magenta hover:underline">
      {children}
    </Link>
  );
}

const money = (n: number) => `${n.toLocaleString("fr-FR")} MAD`;

export default async function TableauDeBordPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const user = await requireUser();
  const { erreur } = await searchParams;
  const see = {
    membres: canView(user.role, "membres"),
    presences: canView(user.role, "presences"),
    departements: canView(user.role, "departements"),
    collecte: canView(user.role, "collecte"),
    actualites: canView(user.role, "actualites"),
    fiches: canView(user.role, "fiches"),
  };

  const [actifs, parCategorie, cultes, departements, fichesEnAttente, promesses, contenus] = await Promise.all([
    prisma.member.count({ where: { membershipStatus: "ACTIVE" } }),
    prisma.member.groupBy({ by: ["category"], where: { membershipStatus: "ACTIVE" }, _count: true }),
    prisma.serviceEvent.findMany({ where: { startAt: { lte: new Date() } }, orderBy: { startAt: "desc" }, take: 8 }),
    prisma.department.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { memberships: true } },
        memberships: {
          where: { role: { contains: "resp", mode: "insensitive" } },
          include: { member: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
    }),
    see.fiches ? prisma.memberSubmission.count({ where: { status: "PENDING" } }) : 0,
    see.collecte ? prisma.pledge.aggregate({ _sum: { amountPromised: true }, _count: true }) : null,
    see.actualites
      ? prisma.content.findMany({ orderBy: { updatedAt: "desc" }, take: 3, select: { id: true, title: true, status: true, updatedAt: true } })
      : [],
  ]);
  const rappels = await prisma.task.findMany({
    where: { assigneeId: user.id, doneAt: null },
    orderBy: { dueAt: "asc" },
    take: 3,
  });
  const compte = (c: string | null) => parCategorie.find((g) => g.category === c)?._count ?? 0;

  const resumes = await Promise.all(cultes.map(async (e) => ({ event: e, summary: await getAttendanceSummary(e.id) })));
  const [dernier, precedent] = resumes;
  const ecart = dernier && precedent ? dernier.summary.total - precedent.summary.total : null;

  // Suivi pastoral : membres actifs venus à au moins un des cultes plus
  // anciens, mais absents des trois derniers cultes enregistrés.
  let aSuivre: { id: string; firstName: string; lastName: string; vu: Date }[] = [];
  if (see.membres && cultes.length >= 4) {
    const recents = cultes.slice(0, 3).map((c) => c.id);
    const anciens = cultes.slice(3).map((c) => c.id);
    const rows = await prisma.member.findMany({
      where: {
        membershipStatus: "ACTIVE",
        attendances: { some: { eventId: { in: anciens } }, none: { eventId: { in: recents } } },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        attendances: { orderBy: { event: { startAt: "desc" } }, take: 1, select: { event: { select: { startAt: true } } } },
      },
    });
    aSuivre = rows
      .map((m) => ({ id: m.id, firstName: m.firstName, lastName: m.lastName, vu: m.attendances[0].event.startAt }))
      .sort((a, b) => +b.vu - +a.vu);
  }

  const culte = nextCulte();
  const semaine = upcoming(5).filter((o) => +o.date !== +culte.date).slice(0, 4);
  const equipes = [...departements].sort((a, b) => b._count.memberships - a._count.memberships).slice(0, 6);
  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Casablanca" });
  const maxPresents = Math.max(...resumes.map((r) => r.summary.total), 1);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm capitalize text-ccr-ink/50">{today}</p>
          <h1 className="mt-1 font-display text-3xl font-black md:text-4xl">Tableau de bord</h1>
          <p className="mt-1 text-sm text-ccr-ink/60">La vie de l&rsquo;église en un coup d&rsquo;œil, calculée en direct.</p>
        </div>
        {canEdit(user.role, "actualites") ? (
          <Link
            href="/cms/nouveau"
            className="inline-flex items-center gap-2 rounded-full bg-ccr-ink px-5 py-2.5 text-sm font-semibold text-ccr-cream transition-colors hover:bg-ccr-ink/85"
          >
            <Icon name="plus" className="h-4 w-4" /> Publier
          </Link>
        ) : null}
      </div>

      {erreur === "role" ? <Notice tone="magenta">Votre rôle ne donne pas accès à cette rubrique.</Notice> : null}

      {rappels.length > 0 ? (
        <section className="mb-6 rounded-2xl border border-ccr-gold/40 bg-ccr-gold/10 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <Icon name="calendar" className="h-5 w-5" /> Mes rappels
            </h2>
            <MoreLink href="/mes-taches">Toutes mes tâches &rarr;</MoreLink>
          </div>
          <ul className="mt-3 grid gap-2 md:grid-cols-3">
            {rappels.map((t) => (
              <li key={t.id} className="rounded-xl bg-white px-4 py-3">
                <p className="truncate text-sm font-semibold">{t.title}</p>
                <p className={`text-xs ${t.dueAt < new Date() ? "font-semibold text-ccr-magenta" : "text-ccr-ink/60"}`}>{formatDue(t.dueAt)}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="users"
          tone="gold"
          label="Membres actifs"
          value={actifs}
          hint={`${compte("MAN")} hommes, ${compte("WOMAN")} femmes, ${compte("CHILD")} enfants`}
          href={see.membres ? "/membres" : undefined}
        />
        <StatCard
          icon="check"
          tone="blue"
          label="Présents au dernier culte"
          value={dernier?.summary.total ?? 0}
          hint={
            dernier ? (
              <>
                le {formatDate(dernier.event.startAt)}
                {ecart !== null ? (
                  <span className={ecart >= 0 ? "text-ccr-blue" : "text-ccr-magenta"}>
                    {" "}
                    ({ecart >= 0 ? "+" : ""}
                    {ecart} par rapport au précédent)
                  </span>
                ) : null}
              </>
            ) : (
              "aucun culte enregistré"
            )
          }
          href={see.presences && dernier ? `/presences/${dernier.event.id}` : undefined}
        />
        {see.fiches ? (
          <StatCard icon="inbox" tone="magenta" label="Fiches à valider" value={fichesEnAttente} hint="envoyées par les membres" href="/fiches" />
        ) : (
          <StatCard icon="layers" tone="magenta" label="Départements" value={departements.length} href={see.departements ? "/departements" : undefined} />
        )}
        {promesses ? (
          <StatCard
            icon="coins"
            tone="ink"
            label="Collecte : montants promis"
            value={money(Number(promesses._sum.amountPromised ?? 0))}
            hint={`${promesses._count} engagements`}
            href="/collecte"
          />
        ) : (
          <StatCard icon="layers" tone="ink" label="Départements" value={departements.length} href={see.departements ? "/departements" : undefined} />
        )}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel
          title="Prochain culte"
          className="xl:col-span-2"
          action={see.presences ? <MoreLink href="/presences">Présences &rarr;</MoreLink> : null}
        >
          <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
            <div className="rounded-2xl bg-ccr-ink p-5 text-ccr-cream">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ccr-gold-light">{formatOccurrence(culte.date)}</p>
              <p className="mt-2 font-display text-2xl font-bold">{culte.titre}</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-ccr-cream/70">
                <Icon name="clock" className="h-4 w-4" /> {culte.horaire}
              </p>
              <div className="mt-5 border-t border-ccr-cream/10 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ccr-cream/50">Cette semaine aussi</p>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {semaine.map((o) => (
                    <li key={`${o.titre}-${+o.date}`} className="flex justify-between gap-3">
                      <span>{o.titre}</span>
                      <span className="shrink-0 capitalize text-ccr-cream/60">
                        {o.date.toLocaleDateString("fr-FR", { weekday: "short", timeZone: "UTC" })} {o.horaire.split(" - ")[0]}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ccr-ink/50">Équipes de service</p>
              <ul className="mt-2 divide-y divide-ccr-ink/5">
                {equipes.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{d.name}</p>
                      <p className="truncate text-xs text-ccr-ink/50">
                        {d.memberships.length
                          ? d.memberships.map((m) => fullName(m.member)).join(", ")
                          : "Responsable non renseigné"}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-ccr-cream px-2.5 py-0.5 text-xs font-semibold text-ccr-ink/70">
                      {d._count.memberships}
                    </span>
                  </li>
                ))}
              </ul>
              {see.departements ? (
                <div className="mt-2">
                  <MoreLink href="/departements">Tous les départements &rarr;</MoreLink>
                </div>
              ) : null}
            </div>
          </div>
        </Panel>

        {see.membres ? (
          <Panel title="Suivi pastoral" action={<span className="text-xs text-ccr-ink/50">{aSuivre.length} à appeler</span>}>
            <p className="-mt-2 mb-3 text-xs text-ccr-ink/50">Absents des trois derniers cultes, présents avant.</p>
            {aSuivre.length === 0 ? (
              <p className="text-sm text-ccr-ink/60">Personne à relancer pour l&rsquo;instant.</p>
            ) : (
              <ul className="space-y-1">
                {aSuivre.slice(0, 7).map((m) => (
                  <li key={m.id}>
                    <Link href={`/membres/${m.id}`} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-ccr-cream">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ccr-magenta/10 text-xs font-bold text-ccr-magenta">
                        {(m.firstName[0] ?? "") + (m.lastName[0] ?? "")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{fullName(m)}</span>
                        <span className="block text-xs text-ccr-ink/50">vu le {formatDate(m.vu)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {aSuivre.length > 7 ? <p className="mt-2 text-xs text-ccr-ink/50">et {aSuivre.length - 7} autres</p> : null}
          </Panel>
        ) : null}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {see.presences ? (
          <Panel title="Présences des derniers cultes" className="xl:col-span-2" action={<MoreLink href="/presences">Tout voir &rarr;</MoreLink>}>
            <div className="space-y-3">
              {resumes.slice(0, 6).map(({ event, summary }) => (
                <Link key={event.id} href={`/presences/${event.id}`} className="block">
                  <div className="flex items-center justify-between text-sm">
                    <span>{formatDate(event.startAt)}</span>
                    <span className="font-semibold">
                      {summary.total}{" "}
                      <span className="font-normal text-ccr-ink/50">
                        ({summary.byCategory.MAN} H, {summary.byCategory.WOMAN} F, {summary.byCategory.CHILD} E)
                      </span>
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-ccr-ink/5">
                    <div className="h-2 rounded-full bg-ccr-gold" style={{ width: `${(summary.total / maxPresents) * 100}%` }} />
                  </div>
                </Link>
              ))}
              {resumes.length === 0 ? <p className="text-sm text-ccr-ink/60">Aucun culte enregistré.</p> : null}
            </div>
          </Panel>
        ) : null}

        {see.actualites ? (
          <section className="rounded-2xl border-2 border-dashed border-ccr-ink/15 p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ccr-gold/15 text-[#b07a12]">
                <Icon name="pen" className="h-5 w-5" />
              </span>
              <h2 className="font-display text-xl font-bold">Publications</h2>
            </div>
            {contenus.length === 0 ? (
              <p className="mt-4 text-sm text-ccr-ink/60">Aucune actualité pour l&rsquo;instant.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {contenus.map((c) => (
                  <li key={c.id}>
                    <Link href={`/cms/${c.id}`} className="block hover:text-ccr-magenta">
                      <span className="block truncate text-sm font-semibold">{c.title}</span>
                      <span className="text-xs text-ccr-ink/50">
                        {CONTENT_STATUS_LABELS[c.status]}, modifiée le {formatDate(c.updatedAt)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              {canEdit(user.role, "actualites") ? (
                <Link href="/cms/nouveau" className="inline-flex items-center gap-1.5 rounded-full bg-ccr-gold px-4 py-2 text-sm font-semibold text-ccr-ink hover:bg-ccr-gold-light">
                  <Icon name="plus" className="h-4 w-4" /> Nouvelle actualité
                </Link>
              ) : null}
              <MoreLink href="/cms">Toutes les actualités</MoreLink>
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
