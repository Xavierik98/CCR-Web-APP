import { prisma } from "@ccr/database";
import { checkField } from "@ccr/ui/src/validation";
import { openCampaigns, publicCampaign } from "@/lib/engagement";
import { normalizePhone } from "@/lib/members";
import { cors, preflight } from "@/lib/public-api";

export const dynamic = "force-dynamic";
export const OPTIONS = preflight;

const str = (v: unknown, max = 200) => {
  const s = typeof v === "string" ? v.trim().slice(0, max) : "";
  return s === "" ? null : s;
};

async function find(id: string) {
  return (await openCampaigns()).find((c) => c.id === id) ?? null;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const c = await find((await params).id);
  if (!c) return Response.json({ erreur: "Campagne introuvable ou formulaire fermé." }, { status: 404, headers: cors(request) });
  return Response.json(publicCampaign(c), { headers: { ...cors(request), "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } });
}

// Engagement pris par la personne elle-même : il arrive dans la campagne,
// badge « Formulaire », et la trésorerie le suit comme les autres.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const headers = cors(request);
  const c = await find((await params).id);
  if (!c) return Response.json({ ok: false, erreur: "Cette campagne n'accepte plus d'engagements." }, { status: 404, headers });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, erreur: "Requête invalide." }, { status: 400, headers });
  }
  if (str(body.site_web)) return Response.json({ ok: true }, { headers });
  const lastName = str(body.lastName, 80);
  const firstName = str(body.firstName, 80);
  const phone = str(body.phone, 30);
  const email = str(body.email, 120)?.toLowerCase() ?? null;
  const raw = str(body.amount, 20)?.replace(/\s/g, "").replace(",", ".") ?? null;
  const amount = raw ? Number(raw) : null;
  if (!lastName || !firstName || checkField("name", lastName) || checkField("name", firstName)) {
    return Response.json({ ok: false, erreur: "Nom ou prénom non conforme." }, { status: 400, headers });
  }
  if (!phone || checkField("phone", phone)) {
    return Response.json({ ok: false, erreur: "Numéro de téléphone non conforme. Ex. : +212 6XX XX XX XX" }, { status: 400, headers });
  }
  if (email && checkField("email", email)) {
    return Response.json({ ok: false, erreur: "Adresse e-mail non conforme. Exemple : prenom.nom@gmail.com" }, { status: 400, headers });
  }
  if (amount !== null && (!Number.isFinite(amount) || amount <= 0 || amount > 10_000_000)) {
    return Response.json({ ok: false, erreur: "Montant non conforme." }, { status: 400, headers });
  }
  const n = normalizePhone(phone);
  const local = n && n.length === 9 ? `0${n}` : phone;
  // Fiche membre reconnue par le numéro de téléphone, si elle existe.
  const member = n
    ? await prisma.member.findFirst({ where: { phone: { contains: n.slice(-9) } }, select: { id: true } })
    : null;
  await prisma.$transaction([
    prisma.pledge.create({
      data: {
        campaignId: c.id,
        memberId: member?.id ?? null,
        donorName: `${firstName} ${lastName.toUpperCase()}`,
        amountPromised: amount,
        phone: local,
        email,
        comment: str(body.message, 500),
        fromForm: true,
        updatedBy: "formulaire du site",
      },
    }),
    prisma.campaign.update({ where: { id: c.id }, data: { updatedBy: "formulaire du site" } }),
  ]);
  return Response.json({ ok: true }, { headers });
}
