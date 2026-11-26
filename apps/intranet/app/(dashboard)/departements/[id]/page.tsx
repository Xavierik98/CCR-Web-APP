import { prisma } from "@ccr/database";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Card, Field, Input, Notice, PageHeader, Select, Textarea } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { fullName } from "@/lib/labels";
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
  await requireUser();
  const { id } = await params;
  const { enregistre } = await searchParams;

  const [dept, members] = await Promise.all([
    prisma.department.findUnique({
      where: { id },
      include: {
        memberships: { include: { member: true }, orderBy: { member: { firstName: "asc" } } },
      },
    }),
    prisma.member.findMany({
      where: { membershipStatus: "ACTIVE" },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);
  if (!dept) notFound();

  return (
    <>
      <PageHeader
        title={dept.name}
        subtitle={`${dept.memberships.length} membre(s)`}
        back={{ href: "/departements", label: "Départements et groupes" }}
      />
      {enregistre ? <Notice>Modifications enregistrées.</Notice> : null}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <h2 className="font-display text-lg font-bold">Membres et fonctions</h2>
          <ul className="mt-4 divide-y divide-ccr-ink/5">
            {dept.memberships.map((ms) => (
              <li key={ms.id} className="flex flex-wrap items-center gap-3 py-2">
                <Link href={`/membres/${ms.memberId}`} className="w-48 font-semibold hover:text-ccr-magenta">
                  {fullName(ms.member)}
                </Link>
                <form action={updateMembershipRole} className="flex flex-1 gap-2">
                  <input type="hidden" name="id" value={ms.id} />
                  <Input name="role" defaultValue={ms.role ?? ""} placeholder="Fonction" className="mt-0" />
                  <Button type="submit" variant="secondary">OK</Button>
                </form>
                <form action={removeDepartmentMember}>
                  <input type="hidden" name="id" value={ms.id} />
                  <button type="submit" className="text-xs font-semibold text-ccr-magenta hover:underline">
                    Retirer
                  </button>
                </form>
              </li>
            ))}
          </ul>
          <form action={addDepartmentMember} className="mt-6 grid gap-3 border-t border-ccr-ink/10 pt-4 sm:grid-cols-[1fr_1fr_auto]">
            <input type="hidden" name="departmentId" value={dept.id} />
            <Select name="memberId" empty="Ajouter un membre…" options={members.map((m) => [m.id, fullName(m)])} className="mt-0" />
            <Input name="role" placeholder="Fonction (facultatif)" className="mt-0" />
            <Button type="submit">Ajouter</Button>
          </form>
        </Card>

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
      </div>
    </>
  );
}
