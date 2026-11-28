"use server";

import { prisma, type ResidencyStatus } from "@ccr/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccess } from "@/lib/auth";
import { RESIDENCY_DOCUMENTS } from "@/lib/residency";

function text(formData: FormData, key: string, max = 500) {
  const v = String(formData.get(key) ?? "").trim().slice(0, max);
  return v === "" ? null : v;
}
const date = (formData: FormData, key: string) => {
  const v = text(formData, key, 10);
  return v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(`${v}T00:00:00Z`) : null;
};
const STATUSES = ["VALID", "IN_PROGRESS", "EXPIRED", "NEVER_HAD"];

export async function saveSocialRecord(formData: FormData) {
  const user = await requireAccess("sejour", "edit");
  const memberId = text(formData, "memberId");
  if (!memberId) redirect("/dossiers-sejour");
  const renew = text(formData, "hasRenewalDocuments");
  const status = text(formData, "residencyStatus") ?? "VALID";
  const known = new Set<string>(RESIDENCY_DOCUMENTS);
  const missing = formData.getAll("missingDocuments").map(String).filter((d) => known.has(d));
  const other = text(formData, "missingOther", 120);
  const data = {
    residencyStatus: (STATUSES.includes(status) ? status : "VALID") as ResidencyStatus,
    documentNumber: text(formData, "documentNumber", 60),
    documentExpiry: date(formData, "documentExpiry"),
    procedureStartedAt: date(formData, "procedureStartedAt"),
    lastProgressAt: date(formData, "lastProgressAt"),
    missingDocuments: other ? [...missing, ...other.split(",").map((s) => s.trim()).filter(Boolean)] : missing,
    hasRenewalDocuments: renew === null ? null : renew === "oui",
    renewalDifficulty: text(formData, "renewalDifficulty", 2000),
    updatedBy: user.email,
  };
  await prisma.socialSupportRecord.upsert({ where: { memberId }, create: { memberId, ...data }, update: data });
  revalidatePath("/dossiers-sejour");
  redirect(`/dossiers-sejour/${memberId}?enregistre=1`);
}

export async function deleteSocialRecord(formData: FormData) {
  await requireAccess("sejour", "edit");
  await prisma.socialSupportRecord.delete({ where: { memberId: String(formData.get("memberId")) } });
  revalidatePath("/dossiers-sejour");
  redirect("/dossiers-sejour");
}
