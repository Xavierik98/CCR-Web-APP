import { getAttendanceSummary, prisma } from "@ccr/database";
import Link from "next/link";
import { Card, Notice, PageHeader, Stat } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/labels";

export default async function TableauDeBordPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  await requireUser();
  const { erreur } = await searchParams;

  const [actifs, departs, parCategorie, derniersCultes] = await Promise.all([
    prisma.member.count({ where: { membershipStatus: "ACTIVE" } }),
    prisma.member.count({ where: { membershipStatus: "DEPARTED" } }),
    prisma.member.groupBy({
      by: ["category"],
      where: { membershipStatus: "ACTIVE" },
      _count: true,
    }),
    prisma.serviceEvent.findMany({ orderBy: { startAt: "desc" }, take: 6 }),
  ]);
  const compte = (c: string | null) => parCategorie.find((g) => g.category === c)?._count ?? 0;
  const dernier = derniersCultes[0];
  const resume = dernier ? await getAttendanceSummary(dernier.id) : null;
  const historique = await Promise.all(
    derniersCultes.map(async (e) => ({ event: e, summary: await getAttendanceSummary(e.id) })),
  );

  return (
    <>
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble, calculée en direct depuis la base." />
      {erreur === "role" ? (
        <Notice tone="magenta">Votre rôle ne donne pas accès à cette rubrique.</Notice>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Membres actifs" value={actifs} hint={`${compte("MAN")} hommes, ${compte("WOMAN")} femmes, ${compte("CHILD")} enfants`} />
        <Stat label="À compléter" value={compte(null)} hint="Membres actifs sans catégorie" />
        <Stat label="Départs" value={departs} />
        <Stat
          label="Dernier culte"
          value={resume?.total ?? 0}
          hint={dernier ? `présents le ${formatDate(dernier.startAt)}` : "aucun culte enregistré"}
        />
      </div>

      <Card className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Présences des derniers cultes</h2>
          <Link href="/presences" className="text-sm font-semibold text-ccr-magenta hover:underline">
            Tout voir &rarr;
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {historique.map(({ event, summary }) => {
            const max = Math.max(...historique.map((h) => h.summary.total), 1);
            return (
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
                  <div className="h-2 rounded-full bg-ccr-gold" style={{ width: `${(summary.total / max) * 100}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      </Card>
    </>
  );
}
