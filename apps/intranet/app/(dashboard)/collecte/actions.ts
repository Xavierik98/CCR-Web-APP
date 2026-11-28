"use server";

import { prisma } from "@ccr/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccess } from "@/lib/auth";
import { currentMonth } from "@/lib/pledges";

function text(formData: FormData, key: string) {
  const v = String(formData.get(key) ?? "").trim();
  return v === "" ? null : v;
}

function amount(formData: FormData, key = "amountPromised") {
  const v = text(formData, key)?.replace(/\s/g, "").replace(",", ".");
  return v && !Number.isNaN(Number(v)) ? v : null;
}

// Note qui a modifié la campagne en dernier (et quand, via updatedAt).
async function touchCampaign(campaignId: string, email: string) {
  await prisma.campaign.update({ where: { id: campaignId }, data: { updatedBy: email } });
}

export async function saveCampaign(formData: FormData) {
  const user = await requireAccess("collecte", "edit");
  const id = text(formData, "id");
  const name = text(formData, "name");
  const day = text(formData, "startDate");
  const end = text(formData, "endDate");
  if (!name || !day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) redirect(id ? `/collecte/${id}?erreur=champs` : "/collecte?erreur=champs");
  if (end && end < day) redirect(id ? `/collecte/${id}?erreur=dates` : "/collecte?erreur=dates");
  const url = (key: string) => {
    const v = text(formData, key);
    return v && /^https?:\/\//i.test(v) ? v.slice(0, 1000) : null;
  };
  const data = {
    name,
    startDate: new Date(`${day}T00:00:00Z`),
    endDate: end && /^\d{4}-\d{2}-\d{2}$/.test(end) ? new Date(`${end}T00:00:00Z`) : null,
    description: text(formData, "description")?.slice(0, 2000) ?? null,
    coverImageUrl: url("coverImageUrl"),
    videoUrl: url("videoUrl"),
    monthly: formData.get("monthly") === "on",
    formOpen: formData.get("formOpen") === "on",
    updatedBy: user.email,
  };
  const c = id
    ? await prisma.campaign.update({ where: { id }, data })
    : await prisma.campaign.create({ data });
  revalidatePath("/collecte");
  redirect(`/collecte/${c.id}?enregistre=1`);
}

export async function deleteCampaign(formData: FormData) {
  await requireAccess("collecte", "edit");
  await prisma.campaign.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/collecte");
  redirect("/collecte");
}

export async function savePledge(formData: FormData) {
  const user = await requireAccess("collecte", "edit");
  const id = text(formData, "id");
  const campaignId = String(formData.get("campaignId"));
  const memberId = text(formData, "memberId");
  let donorName = text(formData, "donorName");
  if (!donorName && memberId) {
    const m = await prisma.member.findUnique({ where: { id: memberId } });
    donorName = m ? [m.firstName, m.lastName].filter(Boolean).join(" ") : null;
  }
  if (!donorName) redirect(`/collecte/${campaignId}?erreur=nom`);
  const campaign = await prisma.campaign.findUniqueOrThrow({ where: { id: campaignId }, select: { monthly: true } });
  const data = {
    donorName,
    amountPromised: amount(formData),
    // Engagement mensuel : le reçu est enregistré mois par mois (ci-dessous).
    ...(campaign.monthly ? {} : { amountPaid: amount(formData, "amountPaid") }),
    phone: text(formData, "phone"),
    comment: text(formData, "comment"),
    updatedBy: user.email,
    ...(id ? {} : { memberId }),
  };
  const pledge = id ? await prisma.pledge.update({ where: { id }, data }) : await prisma.pledge.create({ data: { ...data, campaignId } });
  if (campaign.monthly && formData.has("amountPaid")) {
    const month = /^\d{4}-\d{2}$/.test(String(formData.get("month"))) ? String(formData.get("month")) : currentMonth();
    const paid = Number(amount(formData, "amountPaid") ?? 0);
    const existing = await prisma.pledgePayment.findMany({ where: { pledgeId: pledge.id, month } });
    const before = existing.reduce((s, x) => s + Number(x.amount), 0);
    if (paid !== before) {
      await prisma.$transaction([
        prisma.pledgePayment.deleteMany({ where: { pledgeId: pledge.id, month } }),
        ...(paid > 0 ? [prisma.pledgePayment.create({ data: { pledgeId: pledge.id, month, amount: paid, byEmail: user.email } })] : []),
      ]);
    }
  }
  await touchCampaign(campaignId, user.email);
  revalidatePath(`/collecte/${campaignId}`);
  const back = text(formData, "retour");
  redirect(back?.startsWith(`/collecte/${campaignId}`) ? back : `/collecte/${campaignId}?enregistre=1`);
}

// Note qu'une relance WhatsApp vient d'être envoyée (appelé au clic, pendant
// que WhatsApp s'ouvre avec le message prêt).
export async function remindPledge(id: string) {
  const user = await requireAccess("collecte", "edit");
  const p = await prisma.pledge.update({
    where: { id },
    data: { lastReminderAt: new Date(), reminderCount: { increment: 1 }, followUpDone: true, updatedBy: user.email },
  });
  await touchCampaign(p.campaignId, user.email);
  revalidatePath("/collecte");
  revalidatePath(`/collecte/${p.campaignId}`);
  revalidatePath("/mes-taches");
  revalidatePath("/tableau-de-bord");
  return { at: new Date().toISOString() };
}

export async function deletePledge(formData: FormData) {
  const user = await requireAccess("collecte", "edit");
  const p = await prisma.pledge.delete({ where: { id: String(formData.get("id")) } });
  await touchCampaign(p.campaignId, user.email);
  revalidatePath(`/collecte/${p.campaignId}`);
  redirect(`/collecte/${p.campaignId}`);
}

// « Déjà relancé » : la relance a été faite autrement (appel, en personne,
// message envoyé ailleurs). Elle est notée sans ouvrir WhatsApp.
export async function markReminded(formData: FormData) {
  await remindPledge(String(formData.get("id")));
  const back = String(formData.get("retour") ?? "");
  redirect(back.startsWith("/collecte") ? back : "/collecte");
}
