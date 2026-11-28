"use server";

import { prisma } from "@ccr/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccess } from "@/lib/auth";
import { casablancaToUtc } from "@/lib/programme";
import { publishDonationAppeal, remindStockLevel } from "@/lib/appeal";
import { StockError, applyMovements, qty, readQuantities } from "@/lib/stock";

function text(formData: FormData, key: string, max = 200) {
  const v = String(formData.get(key) ?? "").trim().slice(0, max);
  return v === "" ? null : v;
}

function refresh() {
  revalidatePath("/accompagnement-social/stock");
  revalidatePath("/accompagnement-social/demandes");
  revalidatePath("/tableau-de-bord");
}

const back = (path: string, params: string) => `${path}${path.includes("?") ? "&" : "?"}${params}`;

// Nouvel article (denrée ou équipement non prévu dans la liste).
export async function addStockItem(formData: FormData) {
  await requireAccess("social", "edit");
  const name = text(formData, "name", 60);
  const unit = text(formData, "unit", 20) ?? "unité";
  if (!name) redirect("/accompagnement-social/stock?erreur=article");
  const existing = await prisma.stockItem.findFirst({ where: { name: { equals: name, mode: "insensitive" } } });
  if (existing) await prisma.stockItem.update({ where: { id: existing.id }, data: { active: true } });
  else await prisma.stockItem.create({ data: { name, unit } });
  refresh();
  redirect("/accompagnement-social/stock?ajoute=1");
}

// Réception de dons : entrées en stock, avec date et heure de réception.
export async function receiveStock(formData: FormData) {
  const user = await requireAccess("social", "edit");
  const day = text(formData, "date", 10);
  const time = text(formData, "time", 5);
  // Réception datée : jamais dans le futur (sinon l'heure actuelle).
  const at = day && time && /^\d{4}-\d{2}-\d{2}$/.test(day) ? casablancaToUtc(day, time) : new Date();
  if (at.getTime() > Date.now()) at.setTime(Date.now());
  // Dons non répertoriés (ex. papier hygiénique) : l'article est créé à la volée.
  const lines = readQuantities(formData);
  for (let i = 1; i <= 5; i++) {
    const name = text(formData, `autre_nom_${i}`, 60);
    const n = Number(String(formData.get(`autre_qte_${i}`) ?? "").replace(",", "."));
    if (!name) continue;
    if (!Number.isFinite(n) || n <= 0) redirect(`/accompagnement-social/stock?erreur=${encodeURIComponent(`Indiquez la quantité reçue pour « ${name} ».`)}`);
    const unit = text(formData, `autre_unite_${i}`, 20) ?? "unité";
    const found = await prisma.stockItem.findFirst({ where: { name: { equals: name, mode: "insensitive" } } });
    const item = found
      ? await prisma.stockItem.update({ where: { id: found.id }, data: { active: true } })
      : await prisma.stockItem.create({ data: { name: name.charAt(0).toUpperCase() + name.slice(1), unit } });
    lines.push({ itemId: item.id, quantity: n });
  }
  try {
    await applyMovements(lines, { type: "IN", byEmail: user.email, note: text(formData, "note", 300), at });
  } catch (e) {
    if (e instanceof StockError) redirect(`/accompagnement-social/stock?erreur=${encodeURIComponent(e.message)}`);
    throw e;
  }
  refresh();
  redirect("/accompagnement-social/stock?recu=1");
}

// Distribution (avec ou sans demande) à un membre ou à une personne extérieure.
export async function distributeStock(formData: FormData) {
  const user = await requireAccess("social", "edit");
  const memberId = text(formData, "memberId");
  const name = text(formData, "beneficiaryName", 120);
  const requestId = text(formData, "requestId");
  const retour = text(formData, "retour") ?? "/accompagnement-social/stock";
  if (!memberId && !name) redirect(back(retour, "erreur=" + encodeURIComponent("Indiquez à qui le don est remis.")));
  try {
    await applyMovements(
      readQuantities(formData),
      { type: "OUT", byEmail: user.email, note: text(formData, "note", 300), beneficiaryMemberId: memberId, beneficiaryName: name, requestId },
      requestId
        ? (tx) =>
            tx.supportRequest.update({
              where: { id: requestId },
              data: { status: "DONE", handledAt: new Date(), handledBy: user.email, decisionNote: text(formData, "note", 300), ...(memberId ? { memberId } : {}) },
            })
        : undefined,
    );
  } catch (e) {
    if (e instanceof StockError) redirect(back(retour, `erreur=${encodeURIComponent(e.message)}`));
    throw e;
  }
  refresh();
  redirect(requestId ? "/accompagnement-social/demandes?effectue=1" : "/accompagnement-social/stock?distribue=1");
}

// Décision sur une demande : liste d'attente, refus (avec motif) ou retour
// dans les demandes à traiter. Qui, quand et pourquoi restent dans l'historique.
export async function decideRequest(decision: string, formData: FormData) {
  const user = await requireAccess("social", "edit");
  const id = String(formData.get("id"));
  if (!["WAITLIST", "REJECTED", "NEW"].includes(decision)) redirect("/accompagnement-social/demandes");
  const note = text(formData, "note", 500);
  if (decision === "REJECTED" && !note) redirect("/accompagnement-social/demandes?erreur=motif");
  await prisma.supportRequest.update({
    where: { id },
    data: {
      status: decision as "WAITLIST" | "REJECTED" | "NEW",
      decisionNote: note,
      handledAt: new Date(),
      handledBy: user.email,
    },
  });
  refresh();
  redirect(`/accompagnement-social/demandes?decision=${decision}`);
}

// Inventaire : corrige la quantité réelle d'un article (mouvement tracé) et,
// au besoin, son seuil d'alerte.
export async function adjustStock(formData: FormData) {
  const user = await requireAccess("social", "edit");
  const itemId = String(formData.get("itemId"));
  const num = (key: string) => {
    const raw = String(formData.get(key) ?? "").trim().replace(",", ".");
    if (raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : NaN;
  };
  const n = num("quantity");
  const seuil = num("threshold");
  if (Number.isNaN(n) || Number.isNaN(seuil) || (n === null && seuil === null)) redirect("/accompagnement-social/stock?erreur=quantite");
  const item = await prisma.stockItem.findUniqueOrThrow({ where: { id: itemId } });
  const params = new URLSearchParams({ article: item.name });
  if (n !== null && Number(item.quantity) !== n) {
    await applyMovements([{ itemId, quantity: n }], { type: "ADJUST", byEmail: user.email, note: text(formData, "note", 300) ?? "Inventaire" });
    params.set("de", qty(item.quantity));
    params.set("a", qty(n));
  }
  if (seuil !== null && Number(item.threshold) !== seuil) {
    await prisma.stockItem.update({ where: { id: itemId }, data: { threshold: seuil } });
    params.set("seuil", qty(seuil));
  }
  refresh();
  redirect(`/accompagnement-social/stock?inventaire=1&${params.toString()}`);
}

// Appel aux dons en nature publié tout de suite dans les actualités du site.
export async function publishAppealNow(formData: FormData) {
  const user = await requireAccess("social", "edit");
  await publishDonationAppeal(user.id, false, { title: text(formData, "title", 120), body: text(formData, "body", 3000) });
  revalidatePath("/cms");
  refresh();
  redirect("/accompagnement-social/stock?appel=1");
}

// Rappel du niveau du stock (agenda, et WhatsApp ou e-mail si configurés).
export async function remindStockNow() {
  await requireAccess("social", "edit");
  const r = await remindStockLevel();
  refresh();
  redirect(`/accompagnement-social/stock?rappel=${r.low}`);
}

// Appel aux dons : retirer du site (archivé) ou republier.
export async function toggleAppeal(formData: FormData) {
  await requireAccess("social", "edit");
  const id = String(formData.get("id"));
  const item = await prisma.content.findUniqueOrThrow({ where: { id } });
  const publish = item.status !== "PUBLISHED";
  await prisma.content.update({ where: { id }, data: { status: publish ? "PUBLISHED" : "ARCHIVED", publishedAt: publish ? new Date() : item.publishedAt } });
  revalidatePath("/cms");
  refresh();
  redirect(`/accompagnement-social/stock?${publish ? "republie" : "retire"}=1`);
}
