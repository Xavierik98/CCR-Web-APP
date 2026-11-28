import { prisma } from "@ccr/database";
import { notFound } from "next/navigation";
import { Badge, Button, Card, Field, Input, Notice, PageHeader, Select, Textarea } from "@/components/ui";
import { canEdit, requireAccess } from "@/lib/auth";
import { RESIDENCY_LABELS, formatDate, fullName, toDateInput } from "@/lib/labels";
import { RESIDENCY_DOCUMENTS, residencyAlerts } from "@/lib/residency";
import { deleteSocialRecord, saveSocialRecord } from "../actions";

export default async function DossierSejourPage({
  params,
  searchParams,
}: {
  params: Promise<{ memberId: string }>;
  searchParams: Promise<{ enregistre?: string }>;
}) {
  const user = await requireAccess("sejour");
  const editable = canEdit(user.role, "sejour");
  const { memberId } = await params;
  const { enregistre } = await searchParams;
  const member = await prisma.member.findUnique({ where: { id: memberId }, include: { socialSupport: true } });
  if (!member) notFound();
  const r = member.socialSupport;
  const known = new Set<string>(RESIDENCY_DOCUMENTS);
  const others = (r?.missingDocuments ?? []).filter((d) => !known.has(d));
  const alerts = r ? residencyAlerts(r) : [];

  return (
    <>
      <PageHeader
        title={fullName(member)}
        subtitle={r ? `Dossier de séjour, mis à jour le ${formatDate(r.updatedAt)}${r.updatedBy ? ` par ${r.updatedBy}` : ""}` : "Nouveau dossier de séjour"}
        back={{ href: "/dossiers-sejour", label: "Dossiers de séjour" }}
      />
      {enregistre ? <Notice>Dossier enregistré.</Notice> : null}
      {alerts.length ? <div className="mb-4 flex flex-wrap gap-2">{alerts.map((a) => <Badge key={a.key} tone={a.tone}>{a.label}</Badge>)}</div> : null}
      {r?.lastReportedAt ? <Notice>Dernier signalement fait par la personne elle-même le {formatDate(r.lastReportedAt)}.</Notice> : null}

      <Card className="max-w-3xl">
        <form action={saveSocialRecord}>
          <fieldset disabled={!editable} className="space-y-4">
            <input type="hidden" name="memberId" value={member.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Statut">
                <Select name="residencyStatus" defaultValue={r?.residencyStatus ?? "IN_PROGRESS"} options={RESIDENCY_LABELS} />
              </Field>
              <Field label="Numéro du titre ou du récépissé">
                <Input name="documentNumber" defaultValue={r?.documentNumber ?? ""} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Date d'expiration" hint="Carte ou récépissé">
                <Input name="documentExpiry" type="date" defaultValue={toDateInput(r?.documentExpiry)} />
              </Field>
              <Field label="Dépôt de la demande">
                <Input name="procedureStartedAt" type="date" defaultValue={toDateInput(r?.procedureStartedAt)} />
              </Field>
              <Field label="Dernière avancée" hint="Sans avancée depuis 60 jours : alerte">
                <Input name="lastProgressAt" type="date" defaultValue={toDateInput(r?.lastProgressAt)} />
              </Field>
            </div>
            <div>
              <p className="text-sm font-semibold">Documents manquants</p>
              <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {RESIDENCY_DOCUMENTS.map((d) => (
                  <label key={d} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="missingDocuments" value={d} defaultChecked={r?.missingDocuments.includes(d)} className="h-4 w-4 accent-ccr-gold" />
                    {d}
                  </label>
                ))}
              </div>
              <Input name="missingOther" defaultValue={others.join(", ")} placeholder="Autres documents manquants (séparés par des virgules)" className="mt-2" />
            </div>
            <Field label="Documents nécessaires au renouvellement réunis ?">
              <Select
                name="hasRenewalDocuments"
                defaultValue={r?.hasRenewalDocuments === null || r?.hasRenewalDocuments === undefined ? "" : r.hasRenewalDocuments ? "oui" : "non"}
                empty="Non renseigné"
                options={{ oui: "Oui", non: "Non" }}
              />
            </Field>
            <Field label="Difficultés, suivi">
              <Textarea name="renewalDifficulty" rows={4} defaultValue={r?.renewalDifficulty ?? ""} />
            </Field>
            {editable ? <Button type="submit">Enregistrer</Button> : null}
          </fieldset>
        </form>
      </Card>

      {r && editable ? (
        <form action={deleteSocialRecord} className="mt-6 space-y-2">
          <input type="hidden" name="memberId" value={member.id} />
          <label className="flex items-center gap-2 text-xs text-ccr-ink/60">
            <input type="checkbox" name="confirm" required />
            Je confirme la suppression de ce dossier
          </label>
          <Button type="submit" variant="danger">Supprimer le dossier</Button>
        </form>
      ) : null}
    </>
  );
}
