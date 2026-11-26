"use server";

import { prisma } from "@ccr/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

const FINANCE = ["SUPER_ADMIN", "ADMIN", "SECRETARY"] as const;

function text(formData: FormData, key: string) {
  const v = String(formData.get(key) ?? "").trim();
  return v === "" ? null : v;
}

function amount(formData: FormData) {
  const v = text(formData, "amountPromised")?.replace(",", ".");
  return v && !Number.isNaN(Number(v)) ? v : null;
}

export async function saveCampaign(formData: FormData) {
  await requireUser([...FINANCE]);
  const id = text(formData, "id");
  const name = text(formData, "name");
  const day = text(formData, "startDate");
  if (!name || !day) redirect(id ? `/collecte/${id}` : "/collecte?erreur=champs");
  const data = { name, startDate: new Date(`${day}T00:00:00Z`) };
  const c = id
    ? await prisma.campaign.update({ where: { id }, data })
    : await prisma.campaign.create({ data });
  revalidatePath("/collecte");
  redirect(`/collecte/${c.id}?enregistre=1`);
}

export async function deleteCampaign(formData: FormData) {
  await requireUser([...FINANCE]);
  await prisma.campaign.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/collecte");
  redirect("/collecte");
}

export async function savePledge(formData: FormData) {
  await requireUser([...FINANCE]);
  const id = text(formData, "id");
  const campaignId = String(formData.get("campaignId"));
  const memberId = text(formData, "memberId");
  let donorName = text(formData, "donorName");
  if (!donorName && memberId) {
    const m = await prisma.member.findUnique({ where: { id: memberId } });
    donorName = m ? [m.firstName, m.lastName].filter(Boolean).join(" ") : null;
  }
  if (!donorName) redirect(`/collecte/${campaignId}?erreur=nom`);
  const data = {
    donorName,
    amountPromised: amount(formData),
    followUpDone: formData.get("followUpDone") === "on",
    comment: text(formData, "comment"),
    ...(id ? {} : { memberId }),
  };
  if (id) await prisma.pledge.update({ where: { id }, data });
  else await prisma.pledge.create({ data: { ...data, campaignId } });
  revalidatePath(`/collecte/${campaignId}`);
  redirect(`/collecte/${campaignId}?enregistre=1`);
}

export async function deletePledge(formData: FormData) {
  await requireUser([...FINANCE]);
  const p = await prisma.pledge.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath(`/collecte/${p.campaignId}`);
  redirect(`/collecte/${p.campaignId}`);
}
