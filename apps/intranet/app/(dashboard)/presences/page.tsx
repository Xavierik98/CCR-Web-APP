import { prisma } from "@ccr/database";
import Link from "next/link";
import { Button, Card, Field, Input, Notice, PageHeader, Select, Table } from "@/components/ui";
import { Icon } from "@/components/icons";
import { canEdit, requireAccess } from "@/lib/auth";
import { formatDate } from "@/lib/labels";
import { casablancaToday, formatDay, recentSundays } from "@/lib/programme";
import { createEvent, openSunday } from "./actions";

const dayOf = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Africa/Casablanca" });

// Module Présences. Les cultes ont lieu le dimanche : les dates sont proposées
// automatiquement. Le nombre de présents n'est jamais stocké, il est recompté
// à chaque affichage depuis les pointages réels.
export default async function PresencesPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const user = await requireAccess("presences");
  const editable = canEdit(user.role, "presences");
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

  // Dimanche du jour (ou prochain) et les quatre précédents, avec leur culte
  // s'il a déjà été ouvert.
  const today = casablancaToday();
  const byDay = new Map(events.filter((e) => e.type === "SERVICE").map((e) => [dayOf(e.startAt), e]));
  const sundays = recentSundays(4).map((day) => ({ day, event: byDay.get(day) ?? null }));

  return (
    <>
      <PageHeader title="Présences" subtitle="Les cultes ont lieu le dimanche : les dates sont proposées automatiquement." />
      {erreur ? <Notice tone="magenta">Cette date n&rsquo;est pas valide.</Notice> : null}

      <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {sundays.map(({ day, event }, i) => {
          const c = event ? counts.get(event.id) : undefined;
          const upcoming = day > today;
          const label = i === 0 ? (upcoming ? "Prochain dimanche" : "Aujourd'hui") : i === 1 ? "Dimanche dernier" : null;
          return (
            <div
              key={day}
              className={`flex flex-col rounded-2xl border p-4 ${i === 0 ? "border-ccr-ink bg-ccr-ink text-ccr-cream" : "border-ccr-ink/[0.06] bg-white"}`}
            >
              <p className={`text-[11px] font-semibold uppercase tracking-wide ${i === 0 ? "text-ccr-gold-light" : "text-ccr-ink/50"}`}>
                {label ?? "Dimanche"}
              </p>
              <p className="mt-1 font-semibold first-letter:uppercase">{formatDay(day).replace(/ \d{4}$/, "")}</p>
              <p className={`mt-2 font-display text-3xl font-black [font-variant-numeric:lining-nums] ${c ? "" : "opacity-40"}`}>
                {c?.total ?? 0}
              </p>
              <p className={`text-xs ${i === 0 ? "text-ccr-cream/60" : "text-ccr-ink/50"}`}>
                {c ? `${c.MAN} H, ${c.WOMAN} F, ${c.CHILD} E` : event ? "aucun présent coché" : "pas encore pointé"}
              </p>
              <div className="mt-auto pt-3">
                {event ? (
                  <Link
                    href={`/presences/${event.id}`}
                    className={`inline-flex items-center gap-1 text-sm font-semibold ${i === 0 ? "text-ccr-gold-light" : "text-ccr-magenta"} hover:underline`}
                  >
                    {editable ? "Pointer" : "Voir"} <Icon name="arrow" className="h-4 w-4" />
                  </Link>
                ) : editable ? (
                  <form action={openSunday}>
                    <input type="hidden" name="day" value={day} />
                    <button
                      type="submit"
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold ${
                        i === 0 ? "bg-ccr-gold text-ccr-ink hover:bg-ccr-gold-light" : "border border-ccr-ink/20 hover:border-ccr-ink"
                      }`}
                    >
                      Ouvrir le pointage
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className={`grid gap-6 ${editable ? "lg:grid-cols-[2fr_1fr]" : ""}`}>
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

        {editable ? (
          <Card className="self-start">
            <details>
              <summary className="cursor-pointer font-display text-lg font-bold">Culte exceptionnel</summary>
              <p className="mt-2 text-sm text-ccr-ink/60">Seulement pour un événement en dehors du dimanche.</p>
              <form action={createEvent} className="mt-4 space-y-4">
                <Field label="Intitulé">
                  <Input name="title" placeholder="Ex. Nuit de prière" required />
                </Field>
                <Field label="Date">
                  <Input name="date" type="date" required />
                </Field>
                <Field label="Heure">
                  <Input name="time" type="time" defaultValue="19:30" />
                </Field>
                <Field label="Type">
                  <Select
                    name="type"
                    defaultValue="OTHER"
                    options={{ SERVICE: "Culte", MEETING: "Réunion", CONFERENCE: "Conférence", OTHER: "Autre" }}
                  />
                </Field>
                <Button type="submit">Créer et pointer</Button>
              </form>
            </details>
          </Card>
        ) : null}
      </div>
    </>
  );
}
