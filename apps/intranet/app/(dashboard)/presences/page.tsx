import { prisma } from "@ccr/database";
import Link from "next/link";
import { Button, Card, Field, Input, Notice, PageHeader, Select, Table } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/labels";
import { createEvent } from "./actions";

// Module Présences (section 3). Le nombre de présents n'est jamais stocké :
// il est recompté ici, à chaque affichage, depuis les pointages réels.
export default async function PresencesPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  await requireUser();
  const { erreur } = await searchParams;

  const [events, rows] = await Promise.all([
    prisma.serviceEvent.findMany({ orderBy: { startAt: "desc" } }),
    prisma.attendance.findMany({
      where: { present: true },
      select: { eventId: true, member: { select: { category: true } } },
    }),
  ]);
  const counts = new Map<string, { total: number; MAN: number; WOMAN: number; CHILD: number }>();
  for (const r of rows) {
    const c = counts.get(r.eventId) ?? { total: 0, MAN: 0, WOMAN: 0, CHILD: 0 };
    c.total += 1;
    if (r.member.category) c[r.member.category] += 1;
    counts.set(r.eventId, c);
  }

  return (
    <>
      <PageHeader title="Présences" subtitle="Décompte calculé automatiquement à partir des pointages." />
      {erreur === "date" ? <Notice tone="magenta">Indiquez la date du culte.</Notice> : null}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Table head={["Culte", "Date", "Présents", "Hommes", "Femmes", "Enfants"]}>
          {events.map((e) => {
            const c = counts.get(e.id) ?? { total: 0, MAN: 0, WOMAN: 0, CHILD: 0 };
            return (
              <tr key={e.id} className="hover:bg-ccr-gold/5">
                <td className="px-4 py-3">
                  <Link href={`/presences/${e.id}`} className="font-semibold hover:text-ccr-magenta">
                    {e.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ccr-ink/70">{formatDate(e.startAt)}</td>
                <td className="px-4 py-3 font-semibold">{c.total}</td>
                <td className="px-4 py-3 text-ccr-ink/70">{c.MAN}</td>
                <td className="px-4 py-3 text-ccr-ink/70">{c.WOMAN}</td>
                <td className="px-4 py-3 text-ccr-ink/70">{c.CHILD}</td>
              </tr>
            );
          })}
        </Table>

        <Card>
          <h2 className="font-display text-lg font-bold">Nouveau culte</h2>
          <form action={createEvent} className="mt-4 space-y-4">
            <Field label="Intitulé">
              <Input name="title" defaultValue="Rassemblement dominical" />
            </Field>
            <Field label="Date">
              <Input name="date" type="date" required />
            </Field>
            <Field label="Heure">
              <Input name="time" type="time" defaultValue="10:30" />
            </Field>
            <Field label="Type">
              <Select
                name="type"
                defaultValue="SERVICE"
                options={{ SERVICE: "Culte", MEETING: "Réunion", CONFERENCE: "Conférence", OTHER: "Autre" }}
              />
            </Field>
            <Button type="submit">Créer et pointer</Button>
          </form>
        </Card>
      </div>
    </>
  );
}
