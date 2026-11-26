import { prisma } from "@ccr/database";
import { Badge, Button, Card, Notice, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDue, googleCalendarUrl, siteOrigin } from "@/lib/tasks";
import { renewCalendarToken, toggleTask } from "../taches/actions";

// Tâches assignées à la personne connectée, avec l'ajout à son agenda.
export default async function MesTachesPage({
  searchParams,
}: {
  searchParams: Promise<{ agenda?: string }>;
}) {
  const user = await requireUser();
  const { agenda } = await searchParams;
  const [me, tasks] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { calendarToken: true } }),
    prisma.task.findMany({
      where: { assigneeId: user.id },
      orderBy: [{ doneAt: { sort: "asc", nulls: "first" } }, { dueAt: "asc" }],
      take: 200,
    }),
  ]);
  const origin = await siteOrigin();
  const feed = me.calendarToken ? `${origin}/agenda/${me.calendarToken}` : null;
  const now = new Date();
  const open = tasks.filter((t) => !t.doneAt);
  const finished = tasks.filter((t) => t.doneAt);

  return (
    <>
      <PageHeader title="Mes tâches" subtitle="Les tâches qui vous sont confiées, avec leur échéance." />
      {agenda ? <Notice>Lien d&rsquo;agenda créé. Ajoutez-le une seule fois à votre agenda : les nouvelles tâches y apparaîtront seules.</Notice> : null}

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-3">
          {open.length === 0 ? (
            <Card>
              <p className="text-sm text-ccr-ink/60">Aucune tâche en cours.</p>
            </Card>
          ) : (
            open.map((t) => {
              const late = t.dueAt < now;
              return (
                <Card key={t.id} className={late ? "border-ccr-magenta/40" : ""}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg font-bold">{t.title}</p>
                      <p className={`text-sm ${late ? "font-semibold text-ccr-magenta" : "text-ccr-ink/60"}`}>
                        {formatDue(t.dueAt)} {late ? <Badge tone="magenta">En retard</Badge> : null}
                      </p>
                      {t.description ? <p className="mt-2 whitespace-pre-line text-sm text-ccr-ink/80">{t.description}</p> : null}
                      <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold">
                        <a href={googleCalendarUrl(t)} target="_blank" rel="noreferrer" className="text-ccr-blue hover:underline">
                          Ajouter à Google Agenda
                        </a>
                        <a href={`/taches/${t.id}/ics`} className="text-ccr-blue hover:underline">
                          Télécharger pour Outlook ou iPhone (.ics)
                        </a>
                      </div>
                    </div>
                    <form action={toggleTask}>
                      <input type="hidden" name="id" value={t.id} />
                      <Button type="submit">C&rsquo;est fait</Button>
                    </form>
                  </div>
                </Card>
              );
            })
          )}

          {finished.length > 0 ? (
            <details className="rounded-2xl border border-ccr-ink/10 bg-white p-5">
              <summary className="cursor-pointer text-sm font-semibold">Tâches terminées ({finished.length})</summary>
              <ul className="mt-3 divide-y divide-ccr-ink/5">
                {finished.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className="text-ccr-ink/60 line-through">{t.title}</span>
                    <form action={toggleTask}>
                      <input type="hidden" name="id" value={t.id} />
                      <button type="submit" className="text-xs font-semibold text-ccr-blue hover:underline">Rouvrir</button>
                    </form>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>

        <Card className="self-start">
          <h2 className="font-display text-lg font-bold">Recevoir mes tâches dans mon agenda</h2>
          <p className="mt-2 text-sm text-ccr-ink/70">
            Abonnez votre agenda (Google, Outlook, iPhone) à ce lien personnel : chaque tâche y apparaît
            automatiquement, avec un rappel la veille et une heure avant.
          </p>
          {feed ? (
            <>
              <input readOnly value={feed} className="mt-3 w-full rounded-lg border border-ccr-ink/15 bg-ccr-cream px-3 py-2 font-mono text-xs" />
              <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">
                <a href={feed.replace(/^https?:/, "webcal:")} className="text-ccr-blue hover:underline">Ouvrir dans mon agenda</a>
                <a
                  href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(feed.replace(/^https?:/, "webcal:"))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ccr-blue hover:underline"
                >
                  Ajouter à Google Agenda
                </a>
              </div>
              <p className="mt-3 text-xs text-ccr-ink/50">Ce lien est personnel : ne le partagez pas.</p>
              <form action={renewCalendarToken} className="mt-3">
                <button type="submit" className="text-xs font-semibold text-ccr-magenta hover:underline">
                  Changer de lien (l&rsquo;ancien ne marchera plus)
                </button>
              </form>
            </>
          ) : (
            <form action={renewCalendarToken} className="mt-4">
              <Button type="submit">Créer mon lien d&rsquo;agenda</Button>
            </form>
          )}
        </Card>
      </div>
    </>
  );
}
