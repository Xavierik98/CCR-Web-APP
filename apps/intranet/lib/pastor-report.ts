import { prisma } from "@ccr/database";

// Message de présence envoyé au pasteur après le culte du dimanche.
export function pastorMessage(input: {
  date: Date;
  total: number;
  man: number;
  woman: number;
  child: number;
  unknown: number;
  online: number | null;
  previous?: { total: number; date: Date } | null;
}) {
  const day = input.date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Casablanca",
  });
  const n = (v: number, one: string, many: string) => `${v} ${v > 1 ? many : one}`;
  const online = input.online ?? 0;
  const lines = [
    "Bonjour Papa !",
    "",
    `Voici le rapport de présence du culte du *${day}*.`,
    "",
    `Au total, *${n(input.total, "personne", "personnes")}* ${input.total > 1 ? "étaient présentes" : "était présente"} à l'église :`,
    `- *${input.man}* ${input.man > 1 ? "hommes" : "homme"}`,
    `- *${input.woman}* ${input.woman > 1 ? "femmes" : "femme"}`,
    `- *${input.child}* ${input.child > 1 ? "enfants" : "enfant"}`,
    ...(input.unknown ? [`- *${input.unknown}* sans catégorie`] : []),
    online ? `- *${n(online, "personne connectée", "personnes connectées")}* en ligne` : "- *Aucune* personne connectée en ligne",
  ];
  if (input.previous) {
    const diff = input.total - input.previous.total;
    lines.push(
      "",
      diff === 0
        ? `Autant de présents que dimanche dernier (*${input.previous.total}*).`
        : `Par rapport à dimanche dernier (*${input.previous.total}*) : *${Math.abs(diff)} ${diff > 0 ? "de plus" : "de moins"}*.`,
    );
  }
  lines.push("", "Bonne fin de journée !");
  return lines.join("\n");
}

export async function eventReport(eventId: string) {
  const event = await prisma.serviceEvent.findUnique({
    where: { id: eventId },
    include: { attendances: { where: { present: true }, select: { member: { select: { category: true } } } } },
  });
  if (!event) return null;
  const c = { MAN: 0, WOMAN: 0, CHILD: 0, UNKNOWN: 0 };
  for (const a of event.attendances) c[a.member.category ?? "UNKNOWN"] += 1;
  // Dimanche (culte) précédent, pour la comparaison.
  const prev = await prisma.serviceEvent.findFirst({
    where: { type: "SERVICE", startAt: { lt: event.startAt } },
    orderBy: { startAt: "desc" },
    include: { _count: { select: { attendances: { where: { present: true } } } } },
  });
  const text = pastorMessage({
    date: event.startAt,
    total: event.attendances.length,
    man: c.MAN,
    woman: c.WOMAN,
    child: c.CHILD,
    unknown: c.UNKNOWN,
    online: event.onlineCount,
    previous: prev ? { total: prev._count.attendances, date: prev.startAt } : null,
  });
  return { event, text, total: event.attendances.length, counts: c, previous: prev ? prev._count.attendances : null };
}
