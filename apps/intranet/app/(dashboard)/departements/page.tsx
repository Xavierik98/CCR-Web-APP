import { prisma } from "@ccr/database";
import Link from "next/link";
import { Button, Card, Input, PageHeader, Table } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { fullName } from "@/lib/labels";
import { saveDepartment, saveGroup } from "./actions";

// Module Départements et groupes (section 3) : départements avec la fonction
// de chacun, et groupes de suivi avec leur responsable.
export default async function DepartementsPage() {
  await requireUser();
  const [departments, groups] = await Promise.all([
    prisma.department.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { memberships: true } } },
    }),
    prisma.group.findMany({
      orderBy: { name: "asc" },
      include: { leader: true, _count: { select: { members: true } } },
    }),
  ]);

  return (
    <>
      <PageHeader title="Départements et groupes" />

      <div className="grid gap-8 xl:grid-cols-2">
        <section>
          <h2 className="mb-3 font-display text-xl font-bold">Départements</h2>
          <Table head={["Département", "Membres"]}>
            {departments.map((d) => (
              <tr key={d.id} className="hover:bg-ccr-gold/5">
                <td className="px-4 py-3">
                  <Link href={`/departements/${d.id}`} className="font-semibold hover:text-ccr-magenta">
                    {d.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ccr-ink/70">{d._count.memberships}</td>
              </tr>
            ))}
          </Table>
          <Card className="mt-4">
            <form action={saveDepartment} className="flex flex-wrap gap-3">
              <Input name="name" placeholder="Nom du nouveau département" required className="mt-0 flex-1" />
              <Button type="submit">Ajouter</Button>
            </form>
          </Card>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-bold">Groupes de suivi</h2>
          <Table head={["Groupe", "Responsable", "Membres"]}>
            {groups.map((g) => (
              <tr key={g.id} className="hover:bg-ccr-gold/5">
                <td className="px-4 py-3">
                  <Link href={`/departements/groupes/${g.id}`} className="font-semibold hover:text-ccr-magenta">
                    {g.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ccr-ink/70">{g.leader ? fullName(g.leader) : "À désigner"}</td>
                <td className="px-4 py-3 text-ccr-ink/70">{g._count.members}</td>
              </tr>
            ))}
          </Table>
          <Card className="mt-4">
            <form action={saveGroup} className="flex flex-wrap gap-3">
              <Input name="name" placeholder="Nom du nouveau groupe" required className="mt-0 flex-1" />
              <Button type="submit">Ajouter</Button>
            </form>
          </Card>
        </section>
      </div>
    </>
  );
}
