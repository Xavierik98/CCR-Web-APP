import { prisma } from "@ccr/database";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Card, Field, Input, Notice, PageHeader, Select } from "@/components/ui";
import { canEdit, requireAccess } from "@/lib/auth";
import { fullName } from "@/lib/labels";
import { deleteGroup, saveGroup, setGroupMember } from "../../actions";

export default async function GroupePage({
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

  const [group, members] = await Promise.all([
    prisma.group.findUnique({
      where: { id },
      include: { members: { orderBy: { firstName: "asc" } } },
    }),
    prisma.member.findMany({
      where: { membershipStatus: "ACTIVE" },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);
  if (!group) notFound();
  const options = members.map((m) => [m.id, fullName(m)] as [string, string]);

  return (
    <>
      <PageHeader
        title={group.name}
        subtitle={`${group.members.length} personne(s) suivie(s)`}
        back={{ href: "/departements", label: "Départements et groupes" }}
      />
      {enregistre ? <Notice>Modifications enregistrées.</Notice> : null}

      <div className={`grid gap-6 ${editable ? "lg:grid-cols-[2fr_1fr]" : ""}`}>
        <Card>
          <h2 className="font-display text-lg font-bold">Personnes suivies</h2>
          <ul className="mt-4 divide-y divide-ccr-ink/5">
            {group.members.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-2 text-sm">
                <Link href={`/membres/${m.id}`} className="font-semibold hover:text-ccr-magenta">
                  {fullName(m)}
                </Link>
                <span className="flex items-center gap-4 text-ccr-ink/60">
                  {m.phone}
                  {editable ? (
                    <form action={setGroupMember}>
                      <input type="hidden" name="groupId" value={group.id} />
                      <input type="hidden" name="memberId" value={m.id} />
                      <input type="hidden" name="remove" value="1" />
                      <button type="submit" className="text-xs font-semibold text-ccr-magenta hover:underline">
                        Retirer
                      </button>
                    </form>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
          {editable ? (
            <form action={setGroupMember} className="mt-6 flex gap-3 border-t border-ccr-ink/10 pt-4">
              <input type="hidden" name="groupId" value={group.id} />
              <Select name="memberId" empty="Ajouter une personne…" options={options} className="mt-0 flex-1" />
              <Button type="submit">Ajouter</Button>
            </form>
          ) : null}
        </Card>

        {editable ? (
          <div className="space-y-6">
            <Card>
              <form action={saveGroup} className="space-y-4">
                <input type="hidden" name="id" value={group.id} />
                <Field label="Nom du groupe">
                  <Input name="name" defaultValue={group.name} required />
                </Field>
                <Field label="Responsable">
                  <Select name="leaderMemberId" defaultValue={group.leaderMemberId ?? ""} empty="À désigner" options={options} />
                </Field>
                <Field label="Quartier">
                  <Input name="neighborhood" defaultValue={group.neighborhood ?? ""} />
                </Field>
                <Button type="submit">Enregistrer</Button>
              </form>
            </Card>
            <form action={deleteGroup} className="space-y-2">
              <input type="hidden" name="id" value={group.id} />
              <label className="flex items-center gap-2 text-xs text-ccr-ink/60">
                <input type="checkbox" name="confirm" required />
                Je confirme la suppression (les membres ne sont pas supprimés)
              </label>
              <Button type="submit" variant="danger">Supprimer le groupe</Button>
            </form>
          </div>
        ) : null}
      </div>
    </>
  );
}
