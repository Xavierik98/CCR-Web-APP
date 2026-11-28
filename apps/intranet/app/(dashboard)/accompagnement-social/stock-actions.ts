"use server";

import { prisma } from "@ccr/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccess } from "@/lib/auth";
import { casablancaToUtc } from "@/lib/programme";
import { StockError, applyMovements, readQuantities } from "@/lib/stock";

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
  try {
    await applyMovements(readQuantities(formData), { type: "IN", byEmail: user.email, note: text(formData, "note", 300), at });
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
              data: { status: "DONE", handledAt: new Date(), handledBy: user.email, ...(memberId ? { memberId } : {}) },
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

export async function rejectRequest(formData: FormData) {
  const user = await requireAccess("social", "edit");
  await prisma.supportRequest.update({
    where: { id: String(formData.get("id")) },
    data: { status: "REJECTED", handledAt: new Date(), handledBy: user.email },
  });
  refresh();
  redirect("/accompagnement-social/demandes?refuse=1");
}

// Inventaire : corrige la quantité réelle d'un article (mouvement tracé).
export async function adjustStock(formData: FormData) {
  const user = await requireAccess("social", "edit");
  const itemId = String(formData.get("itemId"));
  const n = Number(String(formData.get("quantity") ?? "").replace(",", "."));
  if (!Number.isFinite(n) || n < 0) redirect("/accompagnement-social/stock?erreur=quantite");
  const item = await prisma.stockItem.findUniqueOrThrow({ where: { id: itemId } });
  if (Number(item.quantity) !== n) {
    await applyMovements([{ itemId, quantity: n }], { type: "ADJUST", byEmail: user.email, note: "Inventaire" });
  }
  refresh();
  redirect("/accompagnement-social/stock?inventaire=1");
}
