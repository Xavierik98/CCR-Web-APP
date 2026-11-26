import { headers } from "next/headers";

// Adresse publique de l'intranet telle que vue par le navigateur (domaine
// Vercel en production, localhost en local).
export async function siteOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

type IcsTask = { id: string; title: string; description: string | null; dueAt: Date; createdAt: Date };

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const escape = (v: string) => v.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (c) => `\\${c}`);

// Lignes de plus de 75 octets repliées, comme l'exige le format iCalendar.
function fold(line: string) {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = ` ${rest.slice(74)}`;
  }
  out.push(rest);
  return out.join("\r\n");
}

// Fichier agenda (.ics) : chaque tâche devient un rendez-vous de 30 minutes
// à l'échéance, avec deux rappels (la veille et une heure avant).
export function buildIcs(tasks: IcsTask[], calendarName: string) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CCR Famille//Intranet//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escape(calendarName)}`,
    "X-WR-TIMEZONE:Africa/Casablanca",
  ];
  for (const t of tasks) {
    const end = new Date(t.dueAt.getTime() + 30 * 60000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${t.id}@ccr-famille`,
      `DTSTAMP:${stamp(t.createdAt)}`,
      `DTSTART:${stamp(t.dueAt)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${escape(t.title)}`,
      ...(t.description ? [`DESCRIPTION:${escape(t.description)}`] : []),
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escape(t.title)}`,
      "TRIGGER:-P1D",
      "END:VALARM",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escape(t.title)}`,
      "TRIGGER:-PT1H",
      "END:VALARM",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

// Lien « Ajouter à Google Agenda » pour une tâche.
export function googleCalendarUrl(t: IcsTask) {
  const end = new Date(t.dueAt.getTime() + 30 * 60000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: t.title,
    dates: `${stamp(t.dueAt)}/${stamp(end)}`,
    details: t.description ?? "",
    ctz: "Africa/Casablanca",
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export function formatDue(d: Date) {
  return d.toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Casablanca",
  });
}
