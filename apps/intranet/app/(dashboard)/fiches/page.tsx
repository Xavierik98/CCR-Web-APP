import { prisma, type SubmissionStatus } from "@ccr/database";
import Link from "next/link";
import { Badge, Card, Notice, PageHeader, Table } from "@/components/ui";
import { requireAccess } from "@/lib/auth";
import { formatDate, fullName } from "@/lib/labels";
import { findDuplicates } from "@/lib/members";
import { siteOrigin } from "@/lib/tasks";
import QRCode from "qrcode";

const STATUS: Record<SubmissionStatus, { label: string; tone: "gold" | "blue" | "magenta" | "neutral" }> = {
  PENDING: { label: "À valider", tone: "gold" },
  MERGED: { label: "Fusionnée", tone: "blue" },
  CREATED: { label: "Nouveau membre", tone: "blue" },
  REJECTED: { label: "Rejetée", tone: "neutral" },
};

const TRAITE: Record<string, string> = {
  fusion: "La fiche a été fusionnée avec le membre existant.",
  cree: "Un nouveau membre a été créé à partir de la fiche.",
  rejet: "La fiche a été rejetée.",
};

export default async function FichesPage({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string; traite?: string }>;
}) {
  await requireAccess("fiches");
  const { vue, traite } = await searchParams;
  const historique = vue === "traitees";

  const fiches = await prisma.memberSubmission.findMany({
    where: historique ? { NOT: { status: "PENDING" } } : { status: "PENDING" },
    orderBy: historique ? { reviewedAt: "desc" } : { createdAt: "asc" },
    include: { member: { select: { id: true, firstName: true, lastName: true } } },
    take: 200,
  });
  const suggestions = historique
    ? []
    : await Promise.all(fiches.map(async (f) => (await findDuplicates(f, undefined, 1))[0] ?? null));

  const formUrl = `${await siteOrigin()}/ma-fiche`;
  const qrOptions = { margin: 1, color: { dark: "#201C16", light: "#FFFFFF" } };
  const [qrSvg, qrPng] = await Promise.all([
    QRCode.toString(formUrl, { ...qrOptions, type: "svg" }),
    QRCode.toDataURL(formUrl, { ...qrOptions, width: 1024 }),
  ]);
  const tab = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-semibold ${active ? "bg-ccr-ink text-ccr-cream" : "text-ccr-ink/60 hover:text-ccr-ink"}`;

  return (
    <>
      <PageHeader
        title="Fiches à valider"
        subtitle="Les membres remplissent eux-mêmes leur fiche. Rien n'est enregistré avant votre validation."
      />
      {traite && TRAITE[traite] ? <Notice>{TRAITE[traite]}</Notice> : null}

      <Card className="mb-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div
            className="w-40 shrink-0 rounded-xl border border-ccr-ink/10 bg-white p-2"
            // SVG généré côté serveur par la bibliothèque qrcode (aucun contenu saisi par un tiers).
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold">Formulaire à partager aux membres</h2>
            <p className="mt-1 text-sm text-ccr-ink/70">
              À scanner avec l&rsquo;appareil photo du téléphone, ou à envoyer par WhatsApp. Aucune connexion n&rsquo;est demandée.
            </p>
            <p className="mt-3 break-all rounded-lg bg-ccr-cream px-3 py-2 font-mono text-sm">{formUrl}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
              <a href={formUrl} target="_blank" rel="noreferrer" className="text-ccr-magenta hover:underline">Ouvrir le formulaire</a>
              <a href={qrPng} download="qr-ma-fiche-ccr.png" className="text-ccr-magenta hover:underline">Télécharger le QR code (affiche, annonce)</a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Bonjour, merci de remplir ta fiche membre CCR Famille : ${formUrl}`)}`}
                target="_blank"
                rel="noreferrer"
                className="text-ccr-magenta hover:underline"
              >
                Partager sur WhatsApp
              </a>
            </div>
          </div>
        </div>
      </Card>

      <div className="mb-4 flex gap-2">
        <Link href="/fiches" className={tab(!historique)}>À valider</Link>
        <Link href="/fiches?vue=traitees" className={tab(historique)}>Déjà traitées</Link>
      </div>

      {fiches.length === 0 ? (
        <Card>
          <p className="text-sm text-ccr-ink/60">
            {historique ? "Aucune fiche traitée pour l'instant." : "Aucune fiche en attente."}
          </p>
        </Card>
      ) : (
        <Table head={historique ? ["Fiche", "Envoyée le", "Décision", "Membre"] : ["Fiche", "Envoyée le", "Membre qui semble correspondre", ""]}>
          {fiches.map((f, i) => (
            <tr key={f.id}>
              <td className="px-4 py-3">
                <p className="font-semibold">{fullName(f)}</p>
                <p className="text-xs text-ccr-ink/50">{[f.phone, f.email].filter(Boolean).join(" · ")}</p>
              </td>
              <td className="px-4 py-3 text-ccr-ink/70">{formatDate(f.createdAt)}</td>
              {historique ? (
                <>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS[f.status].tone}>{STATUS[f.status].label}</Badge>
                    {f.reviewedBy ? <p className="mt-1 text-xs text-ccr-ink/50">par {f.reviewedBy}</p> : null}
                  </td>
                  <td className="px-4 py-3">
                    {f.member ? (
                      <Link href={`/membres/${f.member.id}`} className="font-semibold hover:text-ccr-magenta">
                        {fullName(f.member)}
                      </Link>
                    ) : null}
                  </td>
                </>
              ) : (
                <>
                  <td className="px-4 py-3">
                    {suggestions[i] ? (
                      fullName(suggestions[i].member)
                    ) : (
                      <span className="text-ccr-ink/50">Aucun : nouvelle personne</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/fiches/${f.id}`} className="font-semibold text-ccr-magenta hover:underline">
                      Examiner &rarr;
                    </Link>
                  </td>
                </>
              )}
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
