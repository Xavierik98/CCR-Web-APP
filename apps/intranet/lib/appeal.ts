import { prisma } from "@ccr/database";
import { sendEmail } from "./notify";
import { qty } from "./stock";
import { sendWhatsApp } from "./whatsapp";

// Articles dont le stock est au seuil d'alerte ou en dessous.
export async function lowStockItems() {
  const items = await prisma.stockItem.findMany({ where: { active: true }, orderBy: [{ position: "asc" }, { name: "asc" }] });
  return items.filter((i) => Number(i.quantity) <= Number(i.threshold));
}

const monthLabel = (d: Date) => d.toLocaleDateString("fr-FR", { month: "long", year: "numeric", timeZone: "Africa/Casablanca" });

// Texte proposé pour l'appel du mois, à partir des articles qui manquent.
export async function appealDraft() {
  const now = new Date();
  const low = await lowStockItems();
  const all = low.length ? low : await prisma.stockItem.findMany({ where: { active: true }, orderBy: [{ position: "asc" }, { name: "asc" }] });
  const list = all.map((i) => i.name.toLowerCase()).join(", ");
  return {
    low,
    title: `Appel aux dons en nature : ${monthLabel(now)}`,
    body: [
      `L'accompagnement social de l'église soutient chaque mois des familles dans le besoin. Pour ${monthLabel(now)}, nous faisons appel à votre générosité.`,
      low.length ? `Nous avons particulièrement besoin de : ${list}.` : `Les dons les plus utiles : ${list}.`,
      "Vos dons en nature peuvent être remis à l'équipe de l'accompagnement social. Merci pour votre soutien !",
    ].join("\n\n"),
  };
}

// Appel aux dons en nature publié dans les actualités du site : un seul par
// mois (mis à jour s'il existe déjà). Le texte peut être écrit ou collé par
// l'accompagnement social (`custom`), sinon il est rédigé à partir du stock.
// Aucune photo n'est requise. En automatique (`auto`), un appel déjà existant
// pour le mois n'est jamais écrasé : une modification ou un retrait est respecté.
export async function publishDonationAppeal(authorId: string, auto = false, custom?: { title?: string | null; body?: string | null }) {
  const now = new Date();
  const month = now.toLocaleDateString("en-CA", { timeZone: "Africa/Casablanca" }).slice(0, 7);
  const slug = `appel-aux-dons-${month}`;
  const draft = await appealDraft();
  if (auto) {
    const existing = await prisma.content.findUnique({ where: { slug } });
    if (existing) return { content: existing, low: draft.low, created: false };
  }
  const title = custom?.title?.trim() || draft.title;
  const body = custom?.body?.trim() || draft.body;
  const content = await prisma.content.upsert({
    where: { slug },
    update: { title, body, status: "PUBLISHED", publishedAt: now, updatedBy: authorId },
    create: { type: "NEWS", slug, title, body, status: "PUBLISHED", publishedAt: now, authorId },
  });
  return { content, low: draft.low, created: true };
}

// Rappel du niveau du stock à l'accompagnement social : tâche dans l'agenda
// (sans doublon sur 6 jours), et WhatsApp et e-mail si ces services sont configurés.
export async function remindStockLevel() {
  const low = await lowStockItems();
  if (low.length === 0) return { low: 0, whatsapp: false, email: false };
  const lines = low.map((i) => `- ${i.name} : ${qty(i.quantity)} ${i.unit} (seuil ${qty(i.threshold)})`);
  const text = ["Niveau du stock (CCR Famille)", "", "Articles à réapprovisionner :", ...lines, "", "Détails dans l'intranet, rubrique Accompagnement social."].join("\n");
  const title = `Stock bas : ${low.length} article${low.length > 1 ? "s" : ""} à réapprovisionner`;
  const users = await prisma.user.findMany({ where: { role: "SOCIAL_SUPPORT" }, select: { id: true, email: true } });
  const since = new Date(Date.now() - 6 * 86400000);
  for (const u of users) {
    const recent = await prisma.task.findFirst({ where: { assigneeId: u.id, title: { startsWith: "Stock bas" }, createdAt: { gte: since } } });
    if (!recent) {
      await prisma.task.create({ data: { title, description: lines.join("\n"), dueAt: new Date(), assigneeId: u.id } });
    }
  }
  const emails = process.env.SOCIAL_EMAIL ? [process.env.SOCIAL_EMAIL] : users.map((u) => u.email);
  const [wa, mail] = await Promise.all([sendWhatsApp("social", text), sendEmail(emails, title, text)]);
  return { low: low.length, whatsapp: wa.ok, email: mail.ok };
}
