import { prisma } from "@ccr/database";
import { notFound } from "next/navigation";
import { SendReportButton } from "@/components/send-report-button";
import { Button, Card, Input, Notice, PageHeader } from "@/components/ui";
import { canEdit, requireAccess } from "@/lib/auth";
import { formatDate } from "@/lib/labels";
import { eventReport } from "@/lib/pastor-report";
import { autoSendAvailable, recipientPhone, waLink } from "@/lib/whatsapp";
import { deleteEvent, sendPastorReportNow, setOnlineCount } from "../actions";
import { Checklist } from "./checklist";

export default async function PointagePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ rapport?: string; enligne?: string }>;
}) {
  const user = await requireAccess("presences");
  const editable = canEdit(user.role, "presences");
  const { id } = await params;
  const { rapport, enligne } = await searchParams;

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

  const report = await eventReport(event.id);
  const pastorPhone = await recipientPhone("pasteur");
  const auto = autoSendAvailable("pasteur");
  const isSunday = event.startAt.toLocaleDateString("en-US", { weekday: "short", timeZone: "Africa/Casablanca" }) === "Sun";

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

      {rapport === "envoye" ? <Notice>Rapport envoyé au pasteur sur WhatsApp.</Notice> : null}
      {rapport === "echec" ? <Notice tone="magenta">L&rsquo;envoi automatique a échoué : utilisez le bouton WhatsApp.</Notice> : null}
      {enligne ? <Notice>Nombre de personnes en ligne enregistré.</Notice> : null}

      {report ? (
        <Card className="mt-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold">Rapport pour le pasteur</h2>
              <p className="mt-1 text-sm text-ccr-ink/60">
                {event.attendanceReportSentAt
                  ? `Envoyé le ${event.attendanceReportSentAt.toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Casablanca" })}.`
                  : isSunday && auto
                    ? "Envoi automatique prévu ce dimanche à 13h45."
                    : "Pas encore envoyé."}
              </p>
            </div>
            {editable ? (
              <form action={setOnlineCount} className="flex items-end gap-2">
                <input type="hidden" name="eventId" value={event.id} />
                <label className="block">
                  <span className="text-xs font-semibold text-ccr-ink/60">Connectés en ligne</span>
                  <Input name="onlineCount" type="number" min={0} defaultValue={event.onlineCount ?? ""} placeholder="0" className="w-28" />
                </label>
                <Button type="submit" variant="secondary">OK</Button>
              </form>
            ) : null}
          </div>
          <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-[#e7f8ec] p-4 font-sans text-sm leading-relaxed text-ccr-ink">{report.text}</pre>
          {editable ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {pastorPhone ? (
                <SendReportButton eventId={event.id} href={waLink(pastorPhone, report.text)} />
              ) : (
                <span className="text-sm text-ccr-magenta">Numéro du pasteur introuvable (fiche avec la fonction « Pasteur principal »).</span>
              )}
              {auto ? (
                <form action={sendPastorReportNow}>
                  <input type="hidden" name="eventId" value={event.id} />
                  <Button type="submit" variant="secondary">Envoyer automatiquement maintenant</Button>
                </form>
              ) : (
                <span className="text-xs text-ccr-ink/50">Envoi automatique non configuré : le bouton ouvre WhatsApp avec le message prêt.</span>
              )}
            </div>
          ) : null}
        </Card>
      ) : null}

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
