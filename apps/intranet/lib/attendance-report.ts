import { prisma, type MemberCategory } from "@ccr/database";

export const CATEGORY_ORDER: { key: MemberCategory | "UNKNOWN"; label: string }[] = [
  { key: "WOMAN", label: "Femmes" },
  { key: "MAN", label: "Hommes" },
  { key: "CHILD", label: "Enfants" },
  { key: "UNKNOWN", label: "Autres" },
];

// Données d'un rapport de présence : présents et absents (membres actifs),
// rangés par catégorie puis par nom et prénom.
export async function loadAttendanceReport(eventId: string) {
  const event = await prisma.serviceEvent.findUnique({
    where: { id: eventId },
    include: { attendances: { select: { memberId: true } } },
  });
  if (!event) return null;
  const presentIds = new Set(event.attendances.map((a) => a.memberId));
  const members = await prisma.member.findMany({
    where: { OR: [{ membershipStatus: "ACTIVE" }, { id: { in: [...presentIds] } }] },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: { id: true, firstName: true, lastName: true, category: true },
  });
  members.sort((a, b) => (a.lastName || a.firstName).localeCompare(b.lastName || b.firstName, "fr", { sensitivity: "base" }));
  const groups = CATEGORY_ORDER.map((c) => {
    const list = members.filter((m) => (m.category ?? "UNKNOWN") === c.key);
    return {
      ...c,
      present: list.filter((m) => presentIds.has(m.id)),
      absent: list.filter((m) => !presentIds.has(m.id)),
    };
  });
  const total = groups.reduce((n, g) => n + g.present.length, 0);
  return { event, groups, total };
}
