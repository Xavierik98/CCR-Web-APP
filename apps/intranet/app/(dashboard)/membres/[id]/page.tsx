import { prisma } from "@ccr/database";
import { notFound } from "next/navigation";
import { Button, Card, Field, Input, Notice, PageHeader, Select, Textarea } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import {
  CATEGORY_LABELS,
  PROFESSIONAL_LABELS,
  STATUS_LABELS,
  formatDate,
  fullName,
  toDateInput,
} from "@/lib/labels";
import { addMembership, deleteMember, removeMembership, saveMember } from "../actions";

export default async function MembrePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ enregistre?: string; erreur?: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const { enregistre, erreur } = await searchParams;
  const isNew = id === "nouveau";

  const [member, groups, departments] = await Promise.all([
    isNew
      ? null
      : prisma.member.findUnique({
          where: { id },
          include: {
            memberships: { include: { department: true }, orderBy: { department: { name: "asc" } } },
            attendances: { include: { event: true }, orderBy: { event: { startAt: "desc" } }, take: 5 },
            _count: { select: { attendances: true } },
          },
        }),
    prisma.group.findMany({ orderBy: { name: "asc" } }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!isNew && !member) notFound();

  return (
    <>
      <PageHeader
        title={member ? fullName(member) : "Nouveau membre"}
        subtitle={member ? `${member._count.attendances} présence(s) enregistrée(s)` : undefined}
        back={{ href: "/membres", label: "Tous les membres" }}
      />
      {enregistre ? <Notice>Modifications enregistrées.</Notice> : null}
      {erreur === "nom" ? <Notice tone="magenta">Le prénom est obligatoire.</Notice> : null}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <form action={saveMember} className="grid gap-4 sm:grid-cols-2">
            {member ? <input type="hidden" name="id" value={member.id} /> : null}
            <Field label="Prénom(s)">
              <Input name="firstName" defaultValue={member?.firstName} required />
            </Field>
            <Field label="Nom">
              <Input name="lastName" defaultValue={member?.lastName} />
            </Field>
            <Field label="Téléphone">
              <Input name="phone" defaultValue={member?.phone ?? ""} />
            </Field>
            <Field label="E-mail">
              {/* Pas de type="email" : des adresses importées mal formées bloqueraient l'enregistrement. */}
              <Input name="email" inputMode="email" defaultValue={member?.email ?? ""} />
            </Field>
            <Field label="Catégorie">
              <Select name="category" defaultValue={member?.category ?? ""} empty="À compléter" options={CATEGORY_LABELS} />
            </Field>
            <Field label="Date de naissance">
              <Input name="birthDate" type="date" defaultValue={toDateInput(member?.birthDate)} />
            </Field>
            <Field label="Quartier">
              <Input name="neighborhood" defaultValue={member?.neighborhood ?? ""} />
            </Field>
            <Field label="Situation professionnelle">
              <Select
                name="professionalStatus"
                defaultValue={member?.professionalStatus ?? ""}
                empty="Non renseignée"
                options={PROFESSIONAL_LABELS}
              />
            </Field>
            <Field label="Groupe de suivi">
              <Select
                name="groupId"
                defaultValue={member?.groupId ?? ""}
                empty="Aucun"
                options={groups.map((g) => [g.id, g.name])}
              />
            </Field>
            <Field label="Statut">
              <Select name="membershipStatus" defaultValue={member?.membershipStatus ?? "ACTIVE"} options={STATUS_LABELS} />
            </Field>
            <Field label="Date de départ" hint="Pris en compte si le statut est « Parti ».">
              <Input name="departedAt" type="date" defaultValue={toDateInput(member?.departedAt)} />
            </Field>
            <Field label="Motif du départ">
              <Input name="departureReason" defaultValue={member?.departureReason ?? ""} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Notes">
                <Textarea name="notes" rows={5} defaultValue={member?.notes ?? ""} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Enregistrer</Button>
            </div>
          </form>
        </Card>

        {member ? (
          <div className="space-y-6">
            <Card>
              <h2 className="font-display text-lg font-bold">Départements</h2>
              <ul className="mt-3 space-y-2">
                {member.memberships.map((ms) => (
                  <li key={ms.id} className="flex items-start justify-between gap-2 text-sm">
                    <span>
                      <span className="font-semibold">{ms.department.name}</span>
                      {ms.role ? <span className="block text-ccr-ink/60">{ms.role}</span> : null}
                    </span>
                    <form action={removeMembership}>
                      <input type="hidden" name="id" value={ms.id} />
                      <input type="hidden" name="memberId" value={member.id} />
                      <button type="submit" className="text-xs font-semibold text-ccr-magenta hover:underline">
                        Retirer
                      </button>
                    </form>
                  </li>
                ))}
                {member.memberships.length === 0 ? (
                  <li className="text-sm text-ccr-ink/50">Aucun département.</li>
                ) : null}
              </ul>
              <form action={addMembership} className="mt-4 space-y-2 border-t border-ccr-ink/10 pt-4">
                <input type="hidden" name="memberId" value={member.id} />
                <Select name="departmentId" empty="Ajouter à un département…" options={departments.map((d) => [d.id, d.name])} />
                <Input name="role" placeholder="Fonction (facultatif)" />
                <Button type="submit" variant="secondary">Ajouter</Button>
              </form>
            </Card>

            <Card>
              <h2 className="font-display text-lg font-bold">Dernières présences</h2>
              <ul className="mt-3 space-y-1 text-sm text-ccr-ink/70">
                {member.attendances.map((a) => (
                  <li key={a.id}>{formatDate(a.event.startAt)}</li>
                ))}
                {member.attendances.length === 0 ? <li>Aucune présence.</li> : null}
              </ul>
            </Card>

            <form action={deleteMember} className="space-y-2">
              <input type="hidden" name="id" value={member.id} />
              <label className="flex items-center gap-2 text-xs text-ccr-ink/60">
                <input type="checkbox" name="confirm" required />
                Je confirme la suppression définitive (présences comprises)
              </label>
              <Button type="submit" variant="danger">Supprimer la fiche</Button>
            </form>
          </div>
        ) : null}
      </div>
    </>
  );
}
