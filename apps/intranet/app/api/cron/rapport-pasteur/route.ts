import { prisma } from "@ccr/database";
import { eventReport } from "@/lib/pastor-report";
import { casablancaNow } from "@/lib/programme";
import { autoSendAvailable, sendWhatsApp } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

// Appelé par la tâche planifiée de Vercel le dimanche (voir vercel.json) :
// envoie au pasteur le rapport de présence du culte du jour, une seule fois.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  const fromVercel = (request.headers.get("user-agent") ?? "").startsWith("vercel-cron");
  if (secret ? auth !== `Bearer ${secret}` : !fromVercel) return new Response("Accès refusé", { status: 401 });

  const now = casablancaNow();
  if (now.getUTCDay() !== 0) return Response.json({ envoye: false, raison: "pas dimanche" });
  if (now.getUTCHours() * 60 + now.getUTCMinutes() < 13 * 60) return Response.json({ envoye: false, raison: "trop tôt" });
  if (!autoSendAvailable("pasteur")) return Response.json({ envoye: false, raison: "service WhatsApp non configuré" });

  const day = now.toISOString().slice(0, 10);
  const events = await prisma.serviceEvent.findMany({
    where: { type: "SERVICE", startAt: { gte: new Date(`${day}T00:00:00Z`), lt: new Date(new Date(`${day}T00:00:00Z`).getTime() + 2 * 86400000) } },
  });
  const event = events.find((e) => e.startAt.toLocaleDateString("en-CA", { timeZone: "Africa/Casablanca" }) === day);
  if (!event) return Response.json({ envoye: false, raison: "aucun culte pointé aujourd'hui" });
  if (event.attendanceReportSentAt) return Response.json({ envoye: false, raison: "déjà envoyé" });

  const report = await eventReport(event.id);
  if (!report) return Response.json({ envoye: false, raison: "culte introuvable" });
  const result = await sendWhatsApp("pasteur", report.text);
  if (result.ok) await prisma.serviceEvent.update({ where: { id: event.id }, data: { attendanceReportSentAt: new Date() } });
  return Response.json({ envoye: result.ok, erreur: result.error });
}
