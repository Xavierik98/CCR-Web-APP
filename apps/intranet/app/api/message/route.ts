import { prisma } from "@ccr/database";
import { checkField } from "@ccr/ui/src/validation";
import { normalizePhone } from "@/lib/members";
import { cors, preflight } from "@/lib/public-api";

export const dynamic = "force-dynamic";

export const OPTIONS = preflight;

const str = (v: unknown, max = 200) => {
  const s = typeof v === "string" ? v.trim().slice(0, max) : "";
  return s === "" ? null : s;
};

// Formulaires « Contact » et « Mon église a un besoin » du site public :
// le message arrive dans la boîte de réception de l'intranet.
export async function POST(request: Request) {
  const headers = cors(request);
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, erreur: "Requête invalide." }, { status: 400, headers });
  }
  if (str(body.site_web)) return Response.json({ ok: true }, { headers });
  const kind = body.kind === "BESOIN" ? "BESOIN" : "CONTACT";
  const lastName = str(body.lastName, 80);
  const firstName = str(body.firstName, 80);
  const phone = str(body.phone, 30);
  const email = str(body.email, 120)?.toLowerCase() ?? null;
  const message = str(body.message, 3000);
  if (!lastName || !firstName || checkField("name", lastName) || checkField("name", firstName)) {
    return Response.json({ ok: false, erreur: "Nom ou prénom non conforme." }, { status: 400, headers });
  }
  if (!phone || checkField("phone", phone)) {
    return Response.json({ ok: false, erreur: "Numéro de téléphone non conforme. Ex. : +212 6XX XX XX XX" }, { status: 400, headers });
  }
  if (!email || checkField("email", email)) {
    return Response.json({ ok: false, erreur: "Adresse e-mail non conforme. Exemple : prenom.nom@gmail.com" }, { status: 400, headers });
  }
  if (!message) return Response.json({ ok: false, erreur: "Le message est vide." }, { status: 400, headers });
  const n = normalizePhone(phone);
  await prisma.contactMessage.create({
    data: {
      kind,
      lastName,
      firstName,
      phone: n && n.length === 9 ? `0${n}` : phone,
      email,
      subject: str(body.subject, 120),
      department: str(body.department, 120),
      message,
    },
  });
  return Response.json({ ok: true }, { headers });
}
