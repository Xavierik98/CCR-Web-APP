import { prisma } from "@ccr/database";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Button, Card, Field, Input, Notice, PageHeader, Select, Textarea } from "@/components/ui";
import { canEdit, requireAccess, ROLE_LABELS } from "@/lib/auth";
import {
  CATEGORY_LABELS,
  PROFESSIONAL_LABELS,
  STATUS_LABELS,
  formatDate,
  fullName,
  toDateInput,
} from "@/lib/labels";
import { CHURCH_FUNCTIONS, findDuplicates } from "@/lib/members";
import { deleteUser, saveUser } from "../../utilisateurs/actions";
import { addMembership, deleteMember, mergeInto, removeMembership, saveMember } from "../actions";

export default async function MembrePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ enregistre?: string; erreur?: string; fusionne?: string; revoque?: string }>;
}) {
  const user = await requireAccess("membres");
  const editable = canEdit(user.role, "membres");
  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const { id } = await params;
  const { enregistre, erreur, fusionne, revoque } = await searchParams;
  const isNew = id === "nouveau";
  if (isNew && !editable) notFound();

  const [member, groups, departments] = await Promise.all([
    isNew
      ? null
      : prisma.member.findUnique({
          where: { id },
          include: {
            memberships: { include: { department: true }, orderBy: { department: { name: "asc" } } },
            attendances: { include: { event: true }, orderBy: { event: { startAt: "desc" } }, take: 5 },
            user: true,
            _count: { select: { attendances: true } },
          },
        }),
    prisma.group.findMany({ orderBy: { name: "asc" } }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!isNew && !member) notFound();

  const duplicates = member && editable ? await findDuplicates(member, member.id) : [];
  const others = member && editable
    ? await prisma.member.findMany({
        where: { NOT: { id: member.id } },
        orderBy: { firstName: "asc" },
        select: { id: true, firstName: true, lastName: true },
      })
    : [];
  const customFunctions = member?.functions.filter((f) => !CHURCH_FUNCTIONS.includes(f)) ?? [];
  const retour = member ? `/membres/${member.id}` : "/membres";

  return (
    <>
      <PageHeader
        title={member ? fullName(member) : "Nouveau membre"}
        subtitle={member ? `${member._count.attendances} présence(s) enregistrée(s)` : undefined}
        back={{ href: "/membres", label: "Tous les membres" }}
      />
      {enregistre ? <Notice>Modifications enregistrées.</Notice> : null}
      {fusionne ? <Notice>Fiches fusionnées : présences, départements et engagements regroupés ici.</Notice> : null}
      {revoque ? <Notice>Accès à l&rsquo;intranet révoqué.</Notice> : null}
      {erreur === "nom" ? <Notice tone="magenta">Le prénom est obligatoire.</Notice> : null}
      {!editable ? <Notice>Consultation seule : votre rôle ne permet pas de modifier les fiches.</Notice> : null}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <form action={saveMember}>
            <fieldset disabled={!editable} className="grid gap-4 sm:grid-cols-2">
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
                <Select name="groupId" defaultValue={member?.groupId ?? ""} empty="Aucun" options={groups.map((g) => [g.id, g.name])} />
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
                <p className="text-sm font-semibold">Fonctions dans l&rsquo;église</p>
                <div className="mt-2 grid gap-1 sm:grid-cols-2">
                  {CHURCH_FUNCTIONS.map((f) => (
                    <label key={f} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="functions"
                        value={f}
                        defaultChecked={member?.functions.includes(f)}
                        className="h-4 w-4 accent-ccr-gold"
                      />
                      {f}
                    </label>
                  ))}
                </div>
                <Input
                  name="functionsOther"
                  defaultValue={customFunctions.join(", ")}
                  placeholder="Autres fonctions, séparées par des virgules"
                  className="mt-3"
                />
              </div>

              <div className="sm:col-span-2">
                <Field label="Notes">
                  <Textarea name="notes" rows={5} defaultValue={member?.notes ?? ""} />
                </Field>
              </div>
              {editable ? (
                <div className="sm:col-span-2">
                  <Button type="submit">Enregistrer</Button>
                </div>
              ) : null}
            </fieldset>
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
                    {editable ? (
                      <form action={removeMembership}>
                        <input type="hidden" name="id" value={ms.id} />
                        <input type="hidden" name="memberId" value={member.id} />
                        <button type="submit" className="text-xs font-semibold text-ccr-magenta hover:underline">
                          Retirer
                        </button>
                      </form>
                    ) : null}
                  </li>
                ))}
                {member.memberships.length === 0 ? <li className="text-sm text-ccr-ink/50">Aucun département.</li> : null}
              </ul>
              {editable ? (
                <form action={addMembership} className="mt-4 space-y-2 border-t border-ccr-ink/10 pt-4">
                  <input type="hidden" name="memberId" value={member.id} />
                  <Select name="departmentId" empty="Ajouter à un département…" options={departments.map((d) => [d.id, d.name])} />
                  <Input name="role" placeholder="Fonction dans le département (facultatif)" />
                  <Button type="submit" variant="secondary">Ajouter</Button>
                </form>
              ) : null}
            </Card>

            {isSuperAdmin ? (
              <Card>
                <h2 className="font-display text-lg font-bold">Accès à l&rsquo;intranet</h2>
                {member.user ? (
                  <>
                    <p className="mt-2 text-sm">
                      <Badge tone="gold">{ROLE_LABELS[member.user.role]}</Badge>{" "}
                      <span className="text-ccr-ink/60">{member.user.email}</span>
                    </p>
                    <form action={saveUser} className="mt-3 flex gap-2">
                      <input type="hidden" name="email" value={member.user.email} />
                      <input type="hidden" name="memberId" value={member.id} />
                      <input type="hidden" name="retour" value={retour} />
                      <Select name="role" defaultValue={member.user.role} options={ROLE_LABELS} className="mt-0" />
                      <Button type="submit" variant="secondary">OK</Button>
                    </form>
                    {member.user.email !== user.email ? (
                      <form action={deleteUser} className="mt-3">
                        <input type="hidden" name="email" value={member.user.email} />
                        <input type="hidden" name="retour" value={retour} />
                        <button type="submit" className="text-xs font-semibold text-ccr-magenta hover:underline">
                          Révoquer l&rsquo;accès
                        </button>
                      </form>
                    ) : null}
                  </>
                ) : member.email ? (
                  <form action={saveUser} className="mt-3 space-y-2">
                    <input type="hidden" name="memberId" value={member.id} />
                    <input type="hidden" name="retour" value={retour} />
                    <p className="text-sm text-ccr-ink/60">Aucun accès. Donner un rôle à {member.email} :</p>
                    <Select name="role" defaultValue="READ_ONLY" options={ROLE_LABELS} />
                    <Button type="submit" variant="secondary">Attribuer</Button>
                  </form>
                ) : (
                  <p className="mt-2 text-sm text-ccr-ink/60">Ajoutez un e-mail à la fiche pour pouvoir donner un accès.</p>
                )}
              </Card>
            ) : null}

            {editable ? (
              <Card>
                <h2 className="font-display text-lg font-bold">Fusionner un doublon</h2>
                <p className="mt-1 text-xs text-ccr-ink/50">
                  L&rsquo;autre fiche est supprimée ; ses présences, départements, engagements et informations
                  manquantes sont repris ici.
                </p>
                {duplicates.length > 0 ? (
                  <ul className="mt-3 space-y-1 text-sm">
                    {duplicates.map(({ member: d }) => (
                      <li key={d.id}>
                        <Link href={`/membres/${d.id}`} className="font-semibold hover:text-ccr-magenta">
                          {fullName(d)}
                        </Link>
                        <span className="text-ccr-ink/50"> {d.phone ?? ""}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <form action={mergeInto} className="mt-3 space-y-2">
                  <input type="hidden" name="keepId" value={member.id} />
                  <Select
                    name="removeId"
                    empty="Fiche à fusionner dans celle-ci…"
                    defaultValue={duplicates[0]?.member.id ?? ""}
                    options={[
                      ...duplicates.map((d) => [d.member.id, `${fullName(d.member)} (doublon probable)`]),
                      ...others.filter((o) => !duplicates.some((d) => d.member.id === o.id)).map((o) => [o.id, fullName(o)]),
                    ]}
                    required
                  />
                  <label className="flex items-center gap-2 text-xs text-ccr-ink/60">
                    <input type="checkbox" required />
                    Je confirme : c&rsquo;est la même personne
                  </label>
                  <Button type="submit" variant="secondary">Fusionner</Button>
                </form>
              </Card>
            ) : null}

            <Card>
              <h2 className="font-display text-lg font-bold">Dernières présences</h2>
              <ul className="mt-3 space-y-1 text-sm text-ccr-ink/70">
                {member.attendances.map((a) => (
                  <li key={a.id}>{formatDate(a.event.startAt)}</li>
                ))}
                {member.attendances.length === 0 ? <li>Aucune présence.</li> : null}
              </ul>
            </Card>

            {editable ? (
              <form action={deleteMember} className="space-y-2">
                <input type="hidden" name="id" value={member.id} />
                <label className="flex items-center gap-2 text-xs text-ccr-ink/60">
                  <input type="checkbox" name="confirm" required />
                  Je confirme la suppression définitive (présences comprises)
                </label>
                <Button type="submit" variant="danger">Supprimer la fiche</Button>
              </form>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
