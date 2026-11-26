import { prisma } from "@ccr/database";
import { buildIcs } from "@/lib/tasks";

export const dynamic = "force-dynamic";

// Flux d'agenda personnel (abonnement depuis Google Agenda, Outlook, iPhone).
// Pas de connexion possible pour un agenda : l'accès repose sur le jeton
// secret, renouvelable depuis « Mes tâches ».
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const clean = token.replace(/\.ics$/, "");
  if (!/^[A-Za-z0-9_-]{20,}$/.test(clean)) return new Response("Introuvable", { status: 404 });
  const user = await prisma.user.findUnique({ where: { calendarToken: clean }, select: { id: true } });
  if (!user) return new Response("Introuvable", { status: 404 });

  const since = new Date(Date.now() - 30 * 86400000);
  const tasks = await prisma.task.findMany({
    where: { assigneeId: user.id, doneAt: null, dueAt: { gte: since } },
    orderBy: { dueAt: "asc" },
  });
  return new Response(buildIcs(tasks, "CCR Famille : mes tâches"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
