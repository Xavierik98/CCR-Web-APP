import { canView, getCurrentUser } from "@/lib/auth";
import { loadAttendanceReport } from "@/lib/attendance-report";

export const dynamic = "force-dynamic";

const cell = (v: string) => (/[";\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

// Export Excel (CSV au séparateur point-virgule, lisible directement par
// Excel en français) : résumé puis liste nominative présents / absents.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !canView(user.role, "presences")) return new Response("Accès refusé", { status: 403 });
  const { id } = await params;
  const report = await loadAttendanceReport(id);
  if (!report) return new Response("Introuvable", { status: 404 });

  const date = report.event.startAt.toLocaleDateString("fr-FR", { timeZone: "Africa/Casablanca" });
  const lines: string[][] = [
    ["Rapport de présence", report.event.title, date],
    [],
    ["Catégorie", "Présents"],
    ...report.groups.map((g) => [g.label, String(g.present.length)]),
    ["Total", String(report.total)],
    [],
    ["Nom", "Prénom", "Catégorie", "Présence"],
    ...report.groups.flatMap((g) => [
      ...g.present.map((m) => [m.lastName, m.firstName, g.label, "Présent"]),
      ...g.absent.map((m) => [m.lastName, m.firstName, g.label, "Absent"]),
    ]),
  ];
  const csv = "﻿" + lines.map((l) => l.map(cell).join(";")).join("\r\n");
  const day = report.event.startAt.toLocaleDateString("en-CA", { timeZone: "Africa/Casablanca" });
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="presences-${day}.csv"`,
    },
  });
}
