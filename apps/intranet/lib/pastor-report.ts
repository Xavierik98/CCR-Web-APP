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
    `Pour le culte d’aujourd’hui, ${day}, il y a au total *${n(input.total, "personne", "personnes")}* présente${input.total > 1 ? "s" : ""} à l'église dont respectivement :`,
    `- *${n(input.man, "Homme", "Hommes")} ;*`,
    `- *${n(input.woman, "Femme", "Femmes")} ;*`,
    `- *${n(input.child, "Enfant", "Enfants")} ;*${input.unknown ? "" : " et"}`,
    ...(input.unknown ? [`- *${n(input.unknown, "personne sans catégorie", "personnes sans catégorie")} ;* et`] : []),
    online
      ? `- *${n(online, "personne", "personnes")}* _connectée${online > 1 ? "s" : ""} en ligne._`
      : "- *Aucune* _connectée en ligne._",
    "",
    "Bonne fin de journée !",
  ];
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
  const text = pastorMessage({
    date: event.startAt,
    total: event.attendances.length,
    man: c.MAN,
    woman: c.WOMAN,
    child: c.CHILD,
    unknown: c.UNKNOWN,
    online: event.onlineCount,
  });
  return { event, text };
}
