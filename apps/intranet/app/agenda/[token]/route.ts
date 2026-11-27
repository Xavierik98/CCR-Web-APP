import { prisma } from "@ccr/database";
import { pledgesToRemind, reminderLink } from "@/lib/pledges";
import { casablancaNow, casablancaToUtc } from "@/lib/programme";
import { buildIcs } from "@/lib/tasks";

export const dynamic = "force-dynamic";

// Flux d'agenda personnel (abonnement depuis Google Agenda, Outlook, iPhone).
// Pas de connexion possible pour un agenda : l'accès repose sur le jeton
// secret, renouvelable depuis « Mes tâches ».
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const clean = token.replace(/\.ics$/, "");
  if (!/^[A-Za-z0-9_-]{20,}$/.test(clean)) return new Response("Introuvable", { status: 404 });
  const user = await prisma.user.findUnique({ where: { calendarToken: clean }, select: { id: true, role: true } });
  if (!user) return new Response("Introuvable", { status: 404 });

  const since = new Date(Date.now() - 30 * 86400000);
  const tasks = await prisma.task.findMany({
    where: { assigneeId: user.id, doneAt: null, dueAt: { gte: since } },
    orderBy: { dueAt: "asc" },
  });
  // Trésorerie : chaque personne à relancer apparaît à 18h (aujourd'hui, ou
  // demain si 18h est passé) jusqu'à ce que la relance soit faite.
  const relances = [];
  if (user.role === "TREASURER") {
    const now = casablancaNow();
    const day = now.toISOString().slice(0, 10);
    let at = casablancaToUtc(day, "18:00");
    if (at.getTime() < Date.now()) at = new Date(at.getTime() + 86400000);
    for (const p of await pledgesToRemind()) {
      const name = p.member ? [p.member.firstName, p.member.lastName].filter(Boolean).join(" ") : p.donorName;
      relances.push({
        id: `relance-${p.id}-${p.reminderCount}`,
        title: `Relancer ${name} (engagement ${p.campaign.name})`,
        description: `Relance WhatsApp en un clic : ${reminderLink(p) ?? ""}`,
        dueAt: at,
        createdAt: p.lastReminderAt ?? at,
      });
    }
  }
  return new Response(buildIcs([...tasks, ...relances], "CCR Famille : mes tâches"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
