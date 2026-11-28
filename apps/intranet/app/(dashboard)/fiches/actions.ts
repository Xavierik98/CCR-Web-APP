"use server";

import { prisma } from "@ccr/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccess } from "@/lib/auth";
import { categoryFromTitle } from "@/lib/members";

// Champs qu'une fiche peut écrire sur un membre.
const SUBMISSION_FIELDS = [
  "firstName",
  "lastName",
  "phone",
  "email",
  "birthDate",
  "neighborhood",
  "category",
  "professionalStatus",
  "title",
] as const;

// Situation de séjour signalée dans la fiche : reportée dans le dossier de
// séjour (créé au besoin), datée comme signalement de la personne.
async function applyResidency(memberId: string, sub: { residencyStatus: import("@ccr/database").ResidencyStatus | null; residencyExpiry: Date | null; residencyMissing: string[]; residencyNote: string | null; createdAt: Date }) {
  if (!sub.residencyStatus && !sub.residencyExpiry && !sub.residencyMissing.length && !sub.residencyNote) return;
  const existing = await prisma.socialSupportRecord.findUnique({ where: { memberId } });
  const note = sub.residencyNote ? `Signalé le ${sub.createdAt.toLocaleDateString("fr-FR")} : ${sub.residencyNote}` : null;
  const data = {
    ...(sub.residencyStatus ? { residencyStatus: sub.residencyStatus } : {}),
    ...(sub.residencyExpiry ? { documentExpiry: sub.residencyExpiry } : {}),
    missingDocuments: sub.residencyMissing,
    renewalDifficulty: [existing?.renewalDifficulty, note].filter(Boolean).join("\n\n") || null,
    lastReportedAt: sub.createdAt,
    updatedBy: "fiche du membre",
  };
  if (existing) await prisma.socialSupportRecord.update({ where: { memberId }, data });
  else await prisma.socialSupportRecord.create({ data: { memberId, residencyStatus: sub.residencyStatus ?? "IN_PROGRESS", ...data } });
}

type Dept = { departmentId: string; role: string | null };

function departmentsOf(raw: unknown): Dept[] {
  return Array.isArray(raw)
    ? raw.filter((d): d is Dept => typeof d?.departmentId === "string")
    : [];
}

async function applyDepartments(memberId: string, depts: Dept[]) {
  const known = new Set((await prisma.department.findMany({ select: { id: true } })).map((d) => d.id));
  for (const d of depts.filter((d) => known.has(d.departmentId))) {
    await prisma.departmentMembership.upsert({
      where: { memberId_departmentId: { memberId, departmentId: d.departmentId } },
      create: { memberId, departmentId: d.departmentId, role: d.role },
      // On n'efface pas une fonction existante avec une valeur vide.
      update: d.role ? { role: d.role } : {},
    });
  }
}

function done() {
  revalidatePath("/fiches");
  revalidatePath("/membres");
}

// Écrase, sur le membre choisi, les champs cochés par la valeur envoyée.
export async function mergeSubmission(formData: FormData) {
  const user = await requireAccess("fiches", "edit");
  const id = String(formData.get("id"));
  const memberId = String(formData.get("memberId") ?? "");
  if (!memberId) redirect(`/fiches/${id}?erreur=membre`);

  const sub = await prisma.memberSubmission.findUniqueOrThrow({ where: { id } });
  const member = await prisma.member.findUniqueOrThrow({ where: { id: memberId } });
  const apply = new Set(formData.getAll("apply").map(String));

  const data: Record<string, unknown> = {};
  for (const f of SUBMISSION_FIELDS) {
    if (apply.has(f) && sub[f] !== null && sub[f] !== "") data[f] = sub[f];
  }
  if (apply.has("functions")) data.functions = [...new Set([...member.functions, ...sub.functions])];
  if (sub.message && apply.has("message")) {
    data.notes = [member.notes, `Fiche envoyée le ${sub.createdAt.toLocaleDateString("fr-FR")} : ${sub.message}`]
      .filter(Boolean)
      .join("\n\n");
  }

  const fromTitle = categoryFromTitle((data.title as string | undefined) ?? member.title);
  if (fromTitle && member.category !== "CHILD" && !apply.has("category")) data.category = fromTitle;
  await prisma.member.update({ where: { id: memberId }, data });
  if (apply.has("departments")) await applyDepartments(memberId, departmentsOf(sub.departments));
  await applyResidency(memberId, sub);
  await prisma.memberSubmission.update({
    where: { id },
    data: { status: "MERGED", memberId, reviewedBy: user.email, reviewedAt: new Date() },
  });
  done();
  redirect(`/fiches?traite=fusion`);
}

export async function createFromSubmission(formData: FormData) {
  const user = await requireAccess("fiches", "edit");
  const id = String(formData.get("id"));
  const sub = await prisma.memberSubmission.findUniqueOrThrow({ where: { id } });
  const member = await prisma.member.create({
    data: {
      firstName: sub.firstName,
      lastName: sub.lastName,
      phone: sub.phone,
      email: sub.email,
      birthDate: sub.birthDate,
      neighborhood: sub.neighborhood,
      title: sub.title,
      category: sub.category ?? categoryFromTitle(sub.title),
      professionalStatus: sub.professionalStatus,
      functions: sub.functions,
      notes: sub.message ? `Fiche envoyée le ${sub.createdAt.toLocaleDateString("fr-FR")} : ${sub.message}` : null,
    },
  });
  await applyDepartments(member.id, departmentsOf(sub.departments));
  await applyResidency(member.id, sub);
  await prisma.memberSubmission.update({
    where: { id },
    data: { status: "CREATED", memberId: member.id, reviewedBy: user.email, reviewedAt: new Date() },
  });
  done();
  redirect(`/fiches?traite=cree`);
}

export async function rejectSubmission(formData: FormData) {
  const user = await requireAccess("fiches", "edit");
  const id = String(formData.get("id"));
  await prisma.memberSubmission.update({
    where: { id },
    data: { status: "REJECTED", reviewedBy: user.email, reviewedAt: new Date() },
  });
  done();
  redirect(`/fiches?traite=rejet`);
}
