import { prisma } from "@ccr/database";
import { sendWhatsApp } from "./whatsapp";

// E-mail via Resend (facultatif) : RESEND_API_KEY, RESEND_FROM (expéditeur
// d'un domaine vérifié chez Resend) et SOCIAL_EMAIL (destinataire ; à défaut,
// les adresses des utilisateurs au rôle Accompagnement social).
async function sendEmail(to: string[], subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from || to.length === 0) return { ok: false, error: "E-mail non configuré" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, text }),
      cache: "no-store",
    });
    return res.ok ? { ok: true } : { ok: false, error: `Resend ${res.status}` };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Erreur d'envoi" };
  }
}

// Nouvelle demande de soutien : WhatsApp et e-mail à l'accompagnement social
// (si configurés). La notification dans l'intranet et l'agenda ne dépendent
// d'aucun service : elles viennent directement de la base.
export async function notifySupportRequest(r: {
  firstName: string;
  lastName: string;
  phone: string;
  neighborhood: string | null;
  householdSize: number | null;
  needs: string[];
  message: string | null;
}) {
  const lines = [
    "Nouvelle demande de soutien (CCR Famille)",
    `${r.firstName} ${r.lastName}, ${r.phone}`,
    r.neighborhood ? `Quartier : ${r.neighborhood}` : null,
    r.householdSize ? `Personnes au foyer : ${r.householdSize}` : null,
    r.needs.length ? `Besoins : ${r.needs.join(", ")}` : null,
    r.message ? `Message : ${r.message}` : null,
    "À traiter dans l'intranet, rubrique Accompagnement social.",
  ].filter(Boolean);
  const text = lines.join("\n");
  const emails = process.env.SOCIAL_EMAIL
    ? [process.env.SOCIAL_EMAIL]
    : (await prisma.user.findMany({ where: { role: "SOCIAL_SUPPORT" }, select: { email: true } })).map((u) => u.email);
  const [wa, mail] = await Promise.all([
    sendWhatsApp("social", text),
    sendEmail(emails, `Demande de soutien : ${r.firstName} ${r.lastName}`, text),
  ]);
  return { whatsapp: wa.ok, email: mail.ok };
}
