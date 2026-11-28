import { prisma } from "@ccr/database";
import { checkField } from "@ccr/ui/src/validation";
import { findDuplicates, normalizePhone } from "@/lib/members";
import { notifySupportRequest } from "@/lib/notify";

export const dynamic = "force-dynamic";

// Formulaire « Demande de soutien » du site public. Seul le site public peut
// l'appeler depuis un navigateur (CORS), et un champ piège écarte les robots.
const ALLOWED = (process.env.PUBLIC_SITE_ORIGINS ?? "https://ccr-famille-public.vercel.app,http://localhost:3200")
  .split(",")
  .map((s) => s.trim());

function cors(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED.includes(origin) ? origin : ALLOWED[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: cors(request) });
}

const str = (v: unknown, max = 200) => {
  const s = typeof v === "string" ? v.trim().slice(0, max) : "";
  return s === "" ? null : s;
};

export async function POST(request: Request) {
  const headers = cors(request);
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, erreur: "Requête invalide." }, { status: 400, headers });
  }
  if (str(body.site_web)) return Response.json({ ok: true }, { headers });

  const firstName = str(body.firstName, 80);
  const lastName = str(body.lastName, 80);
  const phone = str(body.phone, 30);
  const email = str(body.email, 120)?.toLowerCase() ?? null;
  if (!firstName || !lastName || checkField("name", firstName) || checkField("name", lastName)) {
    return Response.json({ ok: false, erreur: "Nom ou prénom non conforme." }, { status: 400, headers });
  }
  if (!phone || checkField("phone", phone)) {
    return Response.json({ ok: false, erreur: "Numéro de téléphone non conforme. Ex. : +212 6XX XX XX XX" }, { status: 400, headers });
  }
  if (email && checkField("email", email, false)) {
    return Response.json({ ok: false, erreur: "Adresse e-mail non conforme." }, { status: 400, headers });
  }
  const size = Number(body.householdSize);
  const needs = Array.isArray(body.needs) ? body.needs.map((n) => String(n).slice(0, 60)).slice(0, 20) : [];
  const n = normalizePhone(phone);
  const data = {
    firstName,
    lastName,
    phone: n && n.length === 9 ? `0${n}` : phone,
    email,
    neighborhood: str(body.neighborhood, 80),
    householdSize: Number.isFinite(size) && size > 0 ? Math.min(Math.floor(size), 50) : null,
    needs,
    message: str(body.message, 1000),
  };
  // Rattachement automatique à la fiche membre quand le téléphone correspond.
  const match = (await findDuplicates({ firstName, lastName, phone: data.phone, email }, undefined, 1))[0];
  await prisma.supportRequest.create({ data: { ...data, memberId: match && match.score >= 10 ? match.member.id : null } });
  await notifySupportRequest(data);
  return Response.json({ ok: true }, { headers });
}
