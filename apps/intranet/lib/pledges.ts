import { prisma } from "@ccr/database";
import { normalizePhone } from "./members";

// Délai entre deux relances d'un même engagement.
export const RELANCE_JOURS = 14;

type PledgeLike = {
  amountPromised: unknown;
  amountPaid: unknown;
  lastReminderAt: Date | null;
  phone: string | null;
  member?: { phone: string | null; firstName: string } | null;
};

export type PledgeStatus = "PAYE" | "PARTIEL" | "NON_PAYE" | "A_CONFIRMER";

export const STATUS_LABELS: Record<PledgeStatus, { label: string; tone: "blue" | "gold" | "magenta" | "neutral" }> = {
  PAYE: { label: "Payé", tone: "blue" },
  PARTIEL: { label: "Partiel", tone: "gold" },
  NON_PAYE: { label: "Non payé", tone: "magenta" },
  A_CONFIRMER: { label: "Montant à confirmer", tone: "neutral" },
};

const num = (v: unknown) => (v === null || v === undefined ? 0 : Number(v));

export function pledgeStatus(p: PledgeLike): PledgeStatus {
  const promised = num(p.amountPromised);
  const paid = num(p.amountPaid);
  if (!promised) return paid > 0 ? "PAYE" : "A_CONFIRMER";
  if (paid >= promised) return "PAYE";
  return paid > 0 ? "PARTIEL" : "NON_PAYE";
}

export function pledgePhone(p: PledgeLike) {
  return p.phone || p.member?.phone || null;
}

// À relancer : pas encore entièrement payé, un numéro connu, et aucune
// relance depuis RELANCE_JOURS jours.
export function needsReminder(p: PledgeLike, now = Date.now()) {
  if (pledgeStatus(p) === "PAYE") return false;
  if (!pledgePhone(p)) return false;
  return !p.lastReminderAt || now - p.lastReminderAt.getTime() > RELANCE_JOURS * 86400000;
}

// Numéro au format international attendu par WhatsApp (chiffres seulement).
export function waNumber(phone: string) {
  const local = normalizePhone(phone);
  if (local && local.length === 9) return `212${local}`;
  return phone.replace(/\D/g, "").replace(/^00/, "");
}

export const mad = (n: number) => `${n.toLocaleString("fr-FR")} MAD`;

// Résumé court : « 150 MAD reçus sur 300 MAD » ou « montant à confirmer ».
export function pledgeSummary(p: { amountPromised: unknown; amountPaid: unknown }) {
  const promised = num(p.amountPromised);
  const paid = num(p.amountPaid);
  if (!promised) return paid ? `${mad(paid)} reçus, montant promis à confirmer` : "montant à confirmer";
  return `${mad(paid)} reçus sur ${mad(promised)}`;
}

// Lien WhatsApp avec le message de rappel déjà rédigé.
export function reminderLink(p: PledgeLike & { donorName: string; campaign: { name: string } }) {
  const phone = pledgePhone(p);
  if (!phone) return null;
  const prenom = p.member?.firstName || p.donorName;
  const promised = num(p.amountPromised);
  const paid = num(p.amountPaid);
  const lines = [
    `Bonjour ${prenom}, que Dieu vous bénisse !`,
    `Petit rappel fraternel concernant votre engagement pour « ${p.campaign.name} »${promised ? ` : ${mad(promised)}` : ""}.`,
    paid > 0 ? `Nous avons déjà bien reçu ${mad(paid)}, merci beaucoup.` : null,
    "Merci pour votre fidélité et votre générosité.",
    "La trésorerie de CCR Famille",
  ].filter(Boolean);
  return `https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(lines.join("\n"))}`;
}

// Engagements à relancer, toutes campagnes confondues.
export async function pledgesToRemind() {
  const pledges = await prisma.pledge.findMany({
    include: {
      campaign: { select: { id: true, name: true } },
      member: { select: { id: true, firstName: true, lastName: true, phone: true } },
    },
    orderBy: [{ lastReminderAt: { sort: "asc", nulls: "first" } }, { donorName: "asc" }],
  });
  const now = Date.now();
  return pledges.filter((p) => needsReminder(p, now));
}
