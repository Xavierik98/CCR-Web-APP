import { prisma } from "@ccr/database";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { CampaignForm } from "@/components/campaign-form";
import { RemindButton } from "@/components/remind-button";
import { ShareLink } from "@/components/share-link";
import { Badge, Button, Card, Field, Input, Notice, PageHeader, Select } from "@/components/ui";
import { canEdit, requireAccess } from "@/lib/auth";
import { formatDate, fullName } from "@/lib/labels";
import {
  STATUS_LABELS,
  campaignPhase,
  currentMonth,
  mad,
  monthLabel,
  needsReminder,
  pledgePhone,
  pledgeStatus,
  reminderLink,
  withMonth,
  type PledgeStatus,
} from "@/lib/pledges";
import { deleteCampaign, deletePledge, savePledge } from "../actions";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ccr-famille-public.vercel.app";

// Les 12 derniers mois (AAAA-MM), du plus récent au plus ancien.
function lastMonths(n = 12) {
  const now = currentMonth();
  const [y, m] = now.split("-").map(Number);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1 - i, 15));
    return d.toISOString().slice(0, 7);
  });
}

const FILTRES: { key: string; label: string; test: (s: PledgeStatus, relance: boolean) => boolean }[] = [
  { key: "tous", label: "Tous", test: () => true },
  { key: "a-relancer", label: "À relancer", test: (_s, r) => r },
  { key: "non-paye", label: "Non payés", test: (s) => s === "NON_PAYE" },
  { key: "partiel", label: "Partiels", test: (s) => s === "PARTIEL" },
  { key: "paye", label: "Payés", test: (s) => s === "PAYE" },
  { key: "a-confirmer", label: "À confirmer", test: (s) => s === "A_CONFIRMER" },
];

export default async function CampagnePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ enregistre?: string; erreur?: string; filtre?: string; mois?: string }>;
}) {
  const user = await requireAccess("collecte");
  const editable = canEdit(user.role, "collecte");
  const { id } = await params;
  const { enregistre, erreur, filtre = "tous", mois } = await searchParams;
  const months = lastMonths();

  const [campaign, members] = await Promise.all([
    prisma.campaign.findUnique({
      where: { id },
      include: { pledges: { include: { member: true, payments: { orderBy: { month: "desc" } } }, orderBy: { donorName: "asc" } } },
    }),
    prisma.member.findMany({
      where: { membershipStatus: "ACTIVE" },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);
  if (!campaign) notFound();
  const month = campaign.monthly && mois && months.includes(mois) ? mois : currentMonth();
  const phase = campaignPhase(campaign);

  const rows = campaign.pledges.map((raw) => {
    const p = withMonth(raw, campaign.monthly, month);
    return {
      p,
      status: pledgeStatus(p),
      relance: phase !== "TERMINEE" && month === currentMonth() && needsReminder(p),
      link: reminderLink({ ...p, campaign }),
      paidMonths: campaign.monthly ? [...new Set(raw.payments.map((x) => x.month))].slice(0, 6) : [],
    };
  });
  // Historique mensuel : total reçu par mois (6 derniers mois).
  const history = campaign.monthly
    ? months.slice(0, 6).map((m) => ({
        m,
        total: campaign.pledges.flatMap((x) => x.payments).filter((x) => x.month === m).reduce((s, x) => s + Number(x.amount), 0),
      }))
    : [];
  const formUrl = `${SITE_URL}/engagement/${campaign.id}`;
  const qrSvg = editable ? await QRCode.toString(formUrl, { type: "svg", margin: 1, color: { dark: "#201C16", light: "#ffffff" } }) : null;
  const promis = rows.reduce((s, r) => s + Number(r.p.amountPromised ?? 0), 0);
  const recu = rows.reduce((s, r) => s + Number(r.p.amountPaid ?? 0), 0);
  const pct = promis ? Math.round((recu / promis) * 100) : 0;
  const current = FILTRES.find((f) => f.key === filtre) ?? FILTRES[0];
  const shown = rows.filter((r) => current.test(r.status, r.relance));
  const retour = `/collecte/${campaign.id}?filtre=${current.key}${campaign.monthly ? `&mois=${month}` : ""}&enregistre=1`;

  return (
    <>
      <PageHeader
        title={campaign.name}
        subtitle={`${campaign.endDate ? `Du ${formatDate(campaign.startDate)} au ${formatDate(campaign.endDate)}` : `Depuis le ${formatDate(campaign.startDate)}`}${campaign.monthly ? ", engagement mensuel" : ""}${phase === "TERMINEE" ? " (terminée)" : phase === "A_VENIR" ? " (à venir)" : ""}. Dernière mise à jour le ${campaign.updatedAt.toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Casablanca" })}${campaign.updatedBy ? ` par ${campaign.updatedBy}` : ""}.`}
        back={{ href: "/collecte", label: "Toutes les campagnes" }}
      />
      {enregistre ? <Notice>Modifications enregistrées.</Notice> : null}
      {erreur === "nom" ? <Notice tone="magenta">Indiquez un nom ou choisissez un membre.</Notice> : null}
      {erreur === "dates" ? <Notice tone="magenta">La date de fin doit être après la date de début.</Notice> : null}

      {campaign.coverImageUrl || campaign.description ? (
        <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-ccr-ink/[0.06] bg-white p-4 sm:flex-row">
          {campaign.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={campaign.coverImageUrl} alt="" className="max-h-48 w-full rounded-xl object-cover sm:w-48" />
          ) : null}
          <div className="min-w-0">
            {campaign.description ? <p className="whitespace-pre-line text-sm text-ccr-ink/80">{campaign.description}</p> : null}
            {campaign.videoUrl ? (
              <a href={campaign.videoUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-ccr-blue hover:underline">
                Voir la vidéo
              </a>
            ) : null}
          </div>
        </section>
      ) : null}

      {campaign.monthly ? (
        <section className="mb-6 rounded-2xl border border-ccr-gold/30 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold">Mois suivi : <span className="capitalize">{monthLabel(month)}</span></p>
            <div className="flex flex-wrap gap-1.5">
              {months.slice(0, 6).map((m) => (
                <Link
                  key={m}
                  href={`/collecte/${campaign.id}?mois=${m}`}
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${m === month ? "bg-ccr-ink text-ccr-cream" : "bg-ccr-cream text-ccr-ink/70 hover:text-ccr-ink"}`}
                >
                  {new Date(`${m}-15T12:00:00Z`).toLocaleDateString("fr-FR", { month: "short" })}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {history.map((h) => (
              <div key={h.m} className={`rounded-xl p-2 text-center ${h.m === month ? "bg-ccr-gold/15" : "bg-ccr-cream"}`}>
                <p className="text-[11px] capitalize text-ccr-ink/60">{new Date(`${h.m}-15T12:00:00Z`).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" })}</p>
                <p className="text-sm font-bold">{mad(h.total)}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mb-6 grid gap-4 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="rounded-2xl bg-ccr-ink p-5 text-ccr-cream">
          <p className="text-sm text-ccr-cream/60">{campaign.monthly ? <>Reçu en <span className="capitalize">{monthLabel(month)}</span></> : "Reçu"}</p>
          <p className="font-display text-3xl font-black">{mad(recu)}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-ccr-gold" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <p className="mt-2 text-xs text-ccr-cream/60">{pct} % des {mad(promis)} promis{campaign.monthly ? " par mois" : ""}, reste {mad(Math.max(promis - recu, 0))}</p>
        </div>
        {(["PAYE", "PARTIEL", "NON_PAYE"] as const).map((s) => (
          <Card key={s}>
            <p className="text-sm text-ccr-ink/60">{STATUS_LABELS[s].label}</p>
            <p className="font-display text-3xl font-black">{rows.filter((r) => r.status === s).length}</p>
          </Card>
        ))}
      </section>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTRES.map((f) => {
          const n = rows.filter((r) => f.test(r.status, r.relance)).length;
          return (
            <Link
              key={f.key}
              href={`/collecte/${campaign.id}?filtre=${f.key}`}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                f.key === current.key ? "bg-ccr-ink text-ccr-cream" : "bg-white text-ccr-ink/70 ring-1 ring-ccr-ink/10 hover:text-ccr-ink"
              }`}
            >
              {f.label} <span className="opacity-60">{n}</span>
            </Link>
          );
        })}
      </div>

      <Card className="p-0">
        <ul className="divide-y divide-ccr-ink/5">
          {shown.length === 0 ? <li className="p-5 text-sm text-ccr-ink/60">Aucun engagement dans cette catégorie.</li> : null}
          {shown.map(({ p, status, relance, link, paidMonths }) => (
            <li key={p.id} className={`p-4 ${relance ? "bg-ccr-magenta/[0.03]" : ""}`}>
              <form action={savePledge} className="grid items-end gap-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1.4fr_auto]">
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="campaignId" value={campaign.id} />
                <input type="hidden" name="retour" value={retour} />
                <input type="hidden" name="month" value={month} />
                <fieldset disabled={!editable} className="contents">
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge tone={STATUS_LABELS[status].tone}>{STATUS_LABELS[status].label}</Badge>
                      {p.fromForm ? <Badge tone="gold">Formulaire</Badge> : null}
                      {p.lastReminderAt ? (
                        <span className="text-xs text-ccr-ink/50">
                          Relancé le {formatDate(p.lastReminderAt)}
                          {p.reminderCount > 1 ? ` (${p.reminderCount} fois)` : ""}
                        </span>
                      ) : p.followUpDone ? (
                        <span className="text-xs text-ccr-ink/50">Relance faite (ancien suivi)</span>
                      ) : null}
                    </div>
                    <Input name="donorName" defaultValue={p.donorName} className="mt-0" />
                    {p.member ? (
                      <Link href={`/membres/${p.member.id}`} className="text-xs text-ccr-ink/50 hover:text-ccr-magenta">
                        Fiche : {fullName(p.member)}
                      </Link>
                    ) : null}
                    {paidMonths.length ? (
                      <p className="text-xs text-ccr-ink/50">
                        Payé : {paidMonths.map((m) => new Date(`${m}-15T12:00:00Z`).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" })).join(", ")}
                      </p>
                    ) : null}
                  </div>
                  <Field label={campaign.monthly ? "Promis / mois" : "Promis"}>
                    <Input name="amountPromised" inputMode="decimal" placeholder="À confirmer" defaultValue={p.amountPromised?.toString() ?? ""} />
                  </Field>
                  <Field label={campaign.monthly ? `Reçu (${new Date(`${month}-15T12:00:00Z`).toLocaleDateString("fr-FR", { month: "short" })})` : "Reçu"}>
                    <Input name="amountPaid" inputMode="decimal" placeholder="0" defaultValue={p.amountPaid?.toString() ?? ""} />
                  </Field>
                  <Field label="Téléphone">
                    <Input name="phone" inputMode="tel" placeholder={p.member?.phone ?? "+212 6…"} defaultValue={p.phone ?? ""} />
                  </Field>
                  <Field label="Commentaire">
                    <Input name="comment" defaultValue={p.comment ?? ""} />
                  </Field>
                </fieldset>
                <div className="flex flex-wrap items-center gap-2">
                  {editable ? <Button type="submit" variant="secondary">OK</Button> : null}
                  {editable && link && status !== "PAYE" ? <RemindButton pledgeId={p.id} href={link} compact /> : null}
                  {editable && !pledgePhone(p) && status !== "PAYE" ? <span className="text-xs text-ccr-ink/40">Sans numéro</span> : null}
                  {editable ? (
                    <button type="submit" formAction={deletePledge} className="text-xs font-semibold text-ccr-magenta hover:underline">
                      Supprimer
                    </button>
                  ) : null}
                </div>
              </form>
            </li>
          ))}
        </ul>

        {editable ? (
          <form action={savePledge} className="grid gap-3 border-t border-ccr-ink/10 p-4 lg:grid-cols-[2fr_2fr_1fr_1fr_auto]">
            <input type="hidden" name="campaignId" value={campaign.id} />
            <Select name="memberId" empty="Membre (facultatif)…" options={members.map((m) => [m.id, fullName(m)])} className="mt-0" />
            <Input name="donorName" placeholder="ou nom libre (ex. Couple KIFILA)" className="mt-0" />
            <Input name="amountPromised" inputMode="decimal" placeholder={campaign.monthly ? "Montant par mois" : "Montant promis"} className="mt-0" />
            <Input name="phone" inputMode="tel" placeholder="Téléphone" className="mt-0" />
            <Button type="submit">Ajouter</Button>
          </form>
        ) : null}
      </Card>

      {editable ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="font-display text-lg font-bold">Formulaire d&rsquo;engagement</h2>
            {campaign.formOpen && phase !== "TERMINEE" ? (
              <>
                <p className="mt-1 text-xs text-ccr-ink/60">
                  À envoyer aux membres : chacun indique son nom, son téléphone et son montant{campaign.monthly ? " par mois" : ""}. L&rsquo;engagement apparaît ici avec le badge « Formulaire ».
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                  <ShareLink url={formUrl} message={`Bonjour ! Vous pouvez prendre votre engagement pour « ${campaign.name} » ici :`} />
                  {qrSvg ? (
                    // SVG généré côté serveur par la bibliothèque qrcode (aucun contenu saisi par un tiers).
                    <div className="w-32 rounded-xl border border-ccr-ink/10 bg-white p-2" dangerouslySetInnerHTML={{ __html: qrSvg }} />
                  ) : null}
                </div>
              </>
            ) : (
              <p className="mt-1 text-sm text-ccr-ink/60">
                {phase === "TERMINEE" ? "Campagne terminée : le formulaire est fermé." : "Formulaire fermé : cochez « Formulaire d'engagement ouvert » ci-dessous pour le rouvrir."}
              </p>
            )}
          </Card>
          <Card>
            <h2 className="mb-4 font-display text-lg font-bold">Modifier la campagne</h2>
            <CampaignForm campaign={campaign} />
          </Card>
          <form action={deleteCampaign} className="space-y-2">
            <input type="hidden" name="id" value={campaign.id} />
            <label className="flex items-center gap-2 text-xs text-ccr-ink/60">
              <input type="checkbox" name="confirm" required />
              Je confirme la suppression de la campagne et de tous ses engagements
            </label>
            <Button type="submit" variant="danger">Supprimer la campagne</Button>
          </form>
        </div>
      ) : null}
    </>
  );
}
