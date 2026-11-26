import { getAttendanceSummary, prisma } from "@ccr/database";
import { notFound } from "next/navigation";
import { Button, Card, Notice, PageHeader, Stat } from "@/components/ui";
import { requireAccess } from "@/lib/auth";
import { CATEGORY_LABELS, formatDate, fullName } from "@/lib/labels";
import { deleteEvent, saveAttendance } from "../actions";
import { Checklist } from "./checklist";

export default async function PointagePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ enregistre?: string }>;
}) {
  await requireAccess("presences");
  const { id } = await params;
  const { enregistre } = await searchParams;

  const event = await prisma.serviceEvent.findUnique({
    where: { id },
    include: { attendances: { select: { memberId: true } } },
  });
  if (!event) notFound();
  const presentIds = new Set(event.attendances.map((a) => a.memberId));

  // Membres actifs, plus ceux déjà pointés même s'ils sont partis depuis.
  const members = await prisma.member.findMany({
    where: { OR: [{ membershipStatus: "ACTIVE" }, { id: { in: [...presentIds] } }] },
    orderBy: { firstName: "asc" },
    select: { id: true, firstName: true, lastName: true, category: true },
  });
  const summary = await getAttendanceSummary(id);

  const groups = (["MAN", "WOMAN", "CHILD", null] as const).map((cat) => ({
    label: cat ? `${CATEGORY_LABELS[cat]}s` : "Catégorie à compléter",
    rows: members
      .filter((m) => m.category === cat)
      .map((m) => ({ id: m.id, name: fullName(m), present: presentIds.has(m.id) })),
  })).filter((g) => g.rows.length > 0);

  return (
    <>
      <PageHeader
        title={event.title}
        subtitle={formatDate(event.startAt)}
        back={{ href: "/presences", label: "Tous les cultes" }}
      />
      {enregistre ? <Notice>Pointage enregistré, décompte mis à jour.</Notice> : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="Présents" value={summary.total} />
        <Stat label="Hommes" value={summary.byCategory.MAN} />
        <Stat label="Femmes" value={summary.byCategory.WOMAN} />
        <Stat label="Enfants" value={summary.byCategory.CHILD} />
      </div>

      <Card>
        <form action={saveAttendance}>
          <input type="hidden" name="eventId" value={event.id} />
          <Checklist groups={groups} />
          <Button type="submit">Enregistrer le pointage</Button>
        </form>
      </Card>

      <form action={deleteEvent} className="mt-6 space-y-2">
        <input type="hidden" name="id" value={event.id} />
        <label className="flex items-center gap-2 text-xs text-ccr-ink/60">
          <input type="checkbox" name="confirm" required />
          Je confirme la suppression de ce culte et de son pointage
        </label>
        <Button type="submit" variant="danger">Supprimer ce culte</Button>
      </form>
    </>
  );
}
