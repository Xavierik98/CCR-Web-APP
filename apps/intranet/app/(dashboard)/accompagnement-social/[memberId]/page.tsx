import { prisma } from "@ccr/database";
import { notFound } from "next/navigation";
import { Button, Card, Field, Input, Notice, PageHeader, Select, Textarea } from "@/components/ui";
import { requireAccess } from "@/lib/auth";
import { RESIDENCY_LABELS, fullName } from "@/lib/labels";
import { deleteSocialRecord, saveSocialRecord } from "../actions";

export default async function DossierSocialPage({
  params,
  searchParams,
}: {
  params: Promise<{ memberId: string }>;
  searchParams: Promise<{ enregistre?: string }>;
}) {
  await requireAccess("social");
  const { memberId } = await params;
  const { enregistre } = await searchParams;

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: { socialSupport: true },
  });
  if (!member) notFound();
  const r = member.socialSupport;

  return (
    <>
      <PageHeader
        title={fullName(member)}
        subtitle={r ? "Dossier de titre de séjour" : "Nouveau dossier"}
        back={{ href: "/accompagnement-social", label: "Accompagnement social" }}
      />
      {enregistre ? <Notice>Dossier enregistré.</Notice> : null}

      <Card className="max-w-2xl">
        <form action={saveSocialRecord} className="space-y-4">
          <input type="hidden" name="memberId" value={member.id} />
          <Field label="Situation">
            <Select name="residencyStatus" defaultValue={r?.residencyStatus ?? "VALID"} options={RESIDENCY_LABELS} />
          </Field>
          <Field label="Numéro du titre de séjour">
            <Input name="documentNumber" defaultValue={r?.documentNumber ?? ""} />
          </Field>
          <Field label="Documents nécessaires au renouvellement réunis ?">
            <Select
              name="hasRenewalDocuments"
              defaultValue={r?.hasRenewalDocuments === null || r?.hasRenewalDocuments === undefined ? "" : r.hasRenewalDocuments ? "oui" : "non"}
              empty="Non renseigné"
              options={{ oui: "Oui", non: "Non" }}
            />
          </Field>
          <Field label="Difficulté rencontrée">
            <Textarea name="renewalDifficulty" rows={4} defaultValue={r?.renewalDifficulty ?? ""} />
          </Field>
          <Button type="submit">Enregistrer</Button>
        </form>
      </Card>

      {r ? (
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
