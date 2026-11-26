import { prisma } from "@ccr/database";
import { notFound } from "next/navigation";
import { Button, PageHeader } from "@/components/ui";
import { canEdit, requireAccess } from "@/lib/auth";
import { formatDate } from "@/lib/labels";
import { deleteEvent } from "../actions";
import { Checklist } from "./checklist";

export default async function PointagePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAccess("presences");
  const editable = canEdit(user.role, "presences");
  const { id } = await params;

  const event = await prisma.serviceEvent.findUnique({
    where: { id },
    include: { attendances: { select: { memberId: true } } },
  });
  if (!event) notFound();
  const presentIds = new Set(event.attendances.map((a) => a.memberId));

  // Membres actifs, plus ceux déjà pointés même s'ils sont partis depuis.
  const members = await prisma.member.findMany({
    where: { OR: [{ membershipStatus: "ACTIVE" }, { id: { in: [...presentIds] } }] },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: { id: true, firstName: true, lastName: true, category: true },
  });
  const rows = members.map((m) => ({
    id: m.id,
    lastName: m.lastName,
    firstName: m.firstName,
    present: presentIds.has(m.id),
    category: m.category ?? ("UNKNOWN" as const),
  }));
  // Tri par nom (ou par prénom quand le nom manque), sans tenir compte des accents.
  rows.sort((a, b) => (a.lastName || a.firstName).localeCompare(b.lastName || b.firstName, "fr", { sensitivity: "base" }));

  return (
    <>
      <PageHeader
        title={event.title}
        subtitle={
          editable
            ? `${formatDate(event.startAt)}. Cochez les présents : tout est enregistré au fur et à mesure.`
            : formatDate(event.startAt)
        }
        back={{ href: "/presences", label: "Tous les dimanches" }}
      />

      <Checklist
        eventId={event.id}
        eventLabel={`${event.title} (${formatDate(event.startAt)})`}
        rows={rows}
        editable={editable}
      />

      {editable ? (
        <form action={deleteEvent} className="mt-6 space-y-2">
          <input type="hidden" name="id" value={event.id} />
          <label className="flex items-center gap-2 text-xs text-ccr-ink/60">
            <input type="checkbox" name="confirm" required />
            Je confirme la suppression de ce culte et de son pointage
          </label>
          <Button type="submit" variant="danger">Supprimer ce culte</Button>
        </form>
      ) : null}
    </>
  );
}
