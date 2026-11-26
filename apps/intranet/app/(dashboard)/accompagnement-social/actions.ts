"use server";

import { prisma, type ResidencyStatus } from "@ccr/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccess } from "@/lib/auth";

function text(formData: FormData, key: string) {
  const v = String(formData.get(key) ?? "").trim();
  return v === "" ? null : v;
}

export async function saveSocialRecord(formData: FormData) {
  await requireAccess("social", "edit");
  const memberId = text(formData, "memberId");
  if (!memberId) redirect("/accompagnement-social");
  const renew = text(formData, "hasRenewalDocuments");
  const data = {
    residencyStatus: (text(formData, "residencyStatus") ?? "VALID") as ResidencyStatus,
    documentNumber: text(formData, "documentNumber"),
    hasRenewalDocuments: renew === null ? null : renew === "oui",
    renewalDifficulty: text(formData, "renewalDifficulty"),
  };
  await prisma.socialSupportRecord.upsert({
    where: { memberId },
    create: { memberId, ...data },
    update: data,
  });
  revalidatePath("/accompagnement-social");
  redirect(`/accompagnement-social/${memberId}?enregistre=1`);
}

export async function deleteSocialRecord(formData: FormData) {
  await requireAccess("social", "edit");
  await prisma.socialSupportRecord.delete({ where: { memberId: String(formData.get("memberId")) } });
  revalidatePath("/accompagnement-social");
  redirect("/accompagnement-social");
}
