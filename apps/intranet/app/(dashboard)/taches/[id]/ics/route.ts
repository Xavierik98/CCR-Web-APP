import { prisma } from "@ccr/database";
import { canView, getCurrentUser } from "@/lib/auth";
import { buildIcs } from "@/lib/tasks";

export const dynamic = "force-dynamic";

// Fichier .ics d'une tâche, pour l'ajouter à Outlook ou à l'agenda de l'iPhone.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Non connecté", { status: 401 });
  const { id } = await params;
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || (task.assigneeId !== user.id && !canView(user.role, "taches"))) {
    return new Response("Introuvable", { status: 404 });
  }
  return new Response(buildIcs([task], "CCR Famille"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="tache-ccr.ics"`,
    },
  });
}
