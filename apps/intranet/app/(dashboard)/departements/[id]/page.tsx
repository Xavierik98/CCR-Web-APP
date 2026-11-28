import { prisma } from "@ccr/database";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Card, Field, Input, Notice, PageHeader, Select, Textarea } from "@/components/ui";
import { canEdit, canView, requireAccess } from "@/lib/auth";
import { fullName } from "@/lib/labels";
import { NEED_STATUS } from "@/lib/needs";
import {
  addDepartmentMember,
  deleteDepartment,
  removeDepartmentMember,
  saveDepartment,
  updateMembershipRole,
} from "../actions";

export default async function DepartementPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ enregistre?: string }>;
}) {
  const user = await requireAccess("departements");
  const editable = canEdit(user.role, "departements");
  const { id } = await params;
  const { enregistre } = await searchParams;

  const [dept, members] = await Promise.all([
    prisma.department.findUnique({
      where: { id },
      include: {
        memberships: { include: { member: true }, orderBy: { member: { firstName: "asc" } } },
        needs: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    }),
    prisma.member.findMany({
      where: { membershipStatus: "ACTIVE" },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);
  if (!dept) notFound();
  // Les enfants (Écodim) sont listés à part de l'équipe qui les encadre.
  const enfants = dept.memberships.filter((m) => m.member.category === "CHILD" || m.role === "Enfant");
  const equipe = dept.memberships.filter((m) => !enfants.includes(m));

  return (
    <>
      <PageHeader
        title={dept.name}
        subtitle={`${equipe.length} dans l'équipe${enfants.length ? `, ${enfants.length} enfant(s)` : ""}`}
        back={{ href: "/departements", label: "Départements et groupes" }}
      />
      {enregistre ? <Notice>Modifications enregistrées.</Notice> : null}

      <div className={`grid gap-6 ${editable ? "lg:grid-cols-[2fr_1fr]" : ""}`}>
        <Card>
          <h2 className="font-display text-lg font-bold">Équipe et fonctions</h2>
          <ul className="mt-4 divide-y divide-ccr-ink/5">
            {[...equipe].sort((a, b) => Number(!!b.role?.toLowerCase().startsWith("responsable")) - Number(!!a.role?.toLowerCase().startsWith("responsable"))).map((ms) => (
              <li key={ms.id} className="flex flex-wrap items-center gap-3 py-2">
                <Link href={`/membres/${ms.memberId}`} className="w-48 font-semibold hover:text-ccr-magenta">
                  {fullName(ms.member)}
                </Link>
                {editable ? (
                  <form action={updateMembershipRole} className="flex flex-1 gap-2">
                    <input type="hidden" name="id" value={ms.id} />
                    <Input name="role" defaultValue={ms.role ?? ""} placeholder="Fonction" className="mt-0" />
                    <Button type="submit" variant="secondary">OK</Button>
                  </form>
                ) : <span className="flex-1 text-sm text-ccr-ink/60">{ms.role ?? ""}</span>}
                {editable ? (
                  <form action={removeDepartmentMember}>
                    <input type="hidden" name="id" value={ms.id} />
                    <button type="submit" className="text-xs font-semibold text-ccr-magenta hover:underline">
                      Retirer
                    </button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
          {enfants.length ? (
            <div className="mt-6 border-t border-ccr-ink/10 pt-4">
              <h3 className="font-display text-base font-bold">Enfants ({enfants.length})</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {enfants.map((ms) => (
                  <Link key={ms.id} href={`/membres/${ms.memberId}`} className="rounded-full bg-ccr-cream px-3 py-1 text-xs font-semibold hover:bg-ccr-gold/20">
                    {fullName(ms.member)}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
          <div className="mt-6 border-t border-ccr-ink/10 pt-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-base font-bold">États de besoin</h3>
              {canView(user.role, "besoins") ? (
                <Link href={`/besoins/nouveau?departement=${dept.id}`} className="text-sm font-semibold text-ccr-magenta hover:underline">+ Faire un état de besoin</Link>
              ) : null}
            </div>
            {dept.needs.length ? (
              <ul className="mt-2 space-y-1 text-sm">
                {dept.needs.map((n) => (
                  <li key={n.id}>
                    <Link href={`/besoins/${n.id}`} className="hover:text-ccr-magenta">{n.title}</Link>
                    <span className="text-xs text-ccr-ink/50"> ({NEED_STATUS[n.status].label})</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-ccr-ink/50">Aucun pour l&rsquo;instant.</p>
            )}
          </div>
          {editable ? (
            <form action={addDepartmentMember} className="mt-6 grid gap-3 border-t border-ccr-ink/10 pt-4 sm:grid-cols-[1fr_1fr_auto]">
              <input type="hidden" name="departmentId" value={dept.id} />
              <Select name="memberId" empty="Ajouter un membre…" options={members.map((m) => [m.id, fullName(m)])} className="mt-0" />
              <Input name="role" placeholder="Fonction (facultatif)" className="mt-0" />
              <Button type="submit">Ajouter</Button>
            </form>
          ) : null}
        </Card>

        {editable ? (
          <div className="space-y-6">
            <Card>
              <form action={saveDepartment} className="space-y-4">
                <input type="hidden" name="id" value={dept.id} />
                <Field label="Nom">
                  <Input name="name" defaultValue={dept.name} required />
                </Field>
                <Field label="Description">
                  <Textarea name="description" rows={4} defaultValue={dept.description ?? ""} />
                </Field>
                <Button type="submit">Enregistrer</Button>
              </form>
            </Card>
            <form action={deleteDepartment} className="space-y-2">
              <input type="hidden" name="id" value={dept.id} />
              <label className="flex items-center gap-2 text-xs text-ccr-ink/60">
                <input type="checkbox" name="confirm" required />
                Je confirme la suppression (les membres ne sont pas supprimés)
              </label>
              <Button type="submit" variant="danger">Supprimer le département</Button>
            </form>
          </div>
        ) : null}
      </div>
    </>
  );
}
