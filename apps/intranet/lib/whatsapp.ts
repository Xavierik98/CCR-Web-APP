import { prisma } from "@ccr/database";
import { waNumber } from "./pledges";

// Envoi automatique de messages WhatsApp (sans clic). Deux services possibles,
// configurés par variables d'environnement sur Vercel :
// - CallMeBot (gratuit, pour un numéro personnel) : le destinataire envoie
//   une fois « I allow callmebot to send me messages » au bot, reçoit une
//   clé, et on la renseigne (ex. PASTOR_CALLMEBOT_APIKEY) ;
// - WhatsApp Business Cloud API (Meta) : WHATSAPP_CLOUD_TOKEN et
//   WHATSAPP_CLOUD_PHONE_ID (un modèle de message approuvé peut être exigé
//   par Meta pour écrire à quelqu'un qui n'a pas écrit en premier).
// Sans configuration, rien n'est envoyé seul : l'intranet propose alors un
// bouton qui ouvre WhatsApp avec le message prêt.

export type Recipient = "pasteur" | "social";

const CALLMEBOT_KEYS: Record<Recipient, string | undefined> = {
  pasteur: process.env.PASTOR_CALLMEBOT_APIKEY,
  social: process.env.SOCIAL_CALLMEBOT_APIKEY,
};

export function autoSendAvailable(to: Recipient) {
  return !!CALLMEBOT_KEYS[to] || (!!process.env.WHATSAPP_CLOUD_TOKEN && !!process.env.WHATSAPP_CLOUD_PHONE_ID);
}

// Numéro du destinataire : variable d'environnement, sinon fiche membre
// (fonction « Pasteur principal » ; pour le social, un utilisateur au rôle
// Accompagnement social relié à une fiche).
export async function recipientPhone(to: Recipient) {
  if (to === "pasteur") {
    if (process.env.PASTOR_WHATSAPP) return process.env.PASTOR_WHATSAPP;
    const m = await prisma.member.findFirst({
      where: { functions: { has: "Pasteur principal" }, phone: { not: null } },
      select: { phone: true },
    });
    return m?.phone ?? null;
  }
  if (process.env.SOCIAL_WHATSAPP) return process.env.SOCIAL_WHATSAPP;
  const u = await prisma.user.findFirst({
    where: { role: "SOCIAL_SUPPORT", member: { phone: { not: null } } },
    select: { member: { select: { phone: true } } },
  });
  return u?.member?.phone ?? null;
}

export function waLink(phone: string, text: string) {
  return `https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(text)}`;
}

export async function sendWhatsApp(to: Recipient, text: string): Promise<{ ok: boolean; error?: string }> {
  const phone = await recipientPhone(to);
  if (!phone) return { ok: false, error: "Numéro du destinataire inconnu" };
  const number = waNumber(phone);
  try {
    const key = CALLMEBOT_KEYS[to];
    if (key) {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${number}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(key)}`;
      const res = await fetch(url, { cache: "no-store" });
      return res.ok ? { ok: true } : { ok: false, error: `CallMeBot ${res.status}` };
    }
    const token = process.env.WHATSAPP_CLOUD_TOKEN;
    const phoneId = process.env.WHATSAPP_CLOUD_PHONE_ID;
    if (token && phoneId) {
      const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", to: number, type: "text", text: { body: text } }),
        cache: "no-store",
      });
      return res.ok ? { ok: true } : { ok: false, error: `WhatsApp Cloud ${res.status}` };
    }
    return { ok: false, error: "Aucun service d'envoi configuré" };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Erreur d'envoi" };
  }
}
