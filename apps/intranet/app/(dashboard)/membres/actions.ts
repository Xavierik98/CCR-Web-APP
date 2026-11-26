"use server";

import {
  prisma,
  type MemberCategory,
  type MembershipStatus,
  type ProfessionalStatus,
} from "@ccr/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { EDITORS, requireUser } from "@/lib/auth";

function text(formData: FormData, key: string) {
  const v = String(formData.get(key) ?? "").trim();
  return v === "" ? null : v;
}

function date(formData: FormData, key: string) {
  const v = text(formData, key);
  return v ? new Date(`${v}T00:00:00Z`) : null;
}

export async function saveMember(formData: FormData) {
  await requireUser(EDITORS);
  const id = text(formData, "id");
  const status = (text(formData, "membershipStatus") ?? "ACTIVE") as MembershipStatus;
  const data = {
    firstName: text(formData, "firstName") ?? "",
    lastName: text(formData, "lastName") ?? "",
    phone: text(formData, "phone"),
    email: text(formData, "email"),
    neighborhood: text(formData, "neighborhood"),
    category: text(formData, "category") as MemberCategory | null,
    birthDate: date(formData, "birthDate"),
    professionalStatus: text(formData, "professionalStatus") as ProfessionalStatus | null,
    membershipStatus: status,
    departedAt: status === "DEPARTED" ? date(formData, "departedAt") : null,
    departureReason: status === "DEPARTED" ? text(formData, "departureReason") : null,
    groupId: text(formData, "groupId"),
    notes: text(formData, "notes"),
  };
  if (!data.firstName) redirect(`/membres/${id ?? "nouveau"}?erreur=nom`);

  const member = id
    ? await prisma.member.update({ where: { id }, data })
    : await prisma.member.create({ data });
  revalidatePath("/membres");
  redirect(`/membres/${member.id}?enregistre=1`);
}

export async function deleteMember(formData: FormData) {
  await requireUser(EDITORS);
  const id = String(formData.get("id"));
  await prisma.group.updateMany({ where: { leaderMemberId: id }, data: { leaderMemberId: null } });
  await prisma.member.delete({ where: { id } });
  revalidatePath("/membres");
  redirect("/membres?supprime=1");
}

export async function addMembership(formData: FormData) {
  await requireUser(EDITORS);
  const memberId = String(formData.get("memberId"));
  const departmentId = String(formData.get("departmentId") ?? "");
  if (!departmentId) redirect(`/membres/${memberId}`);
  const role = text(formData, "role");
  await prisma.departmentMembership.upsert({
    where: { memberId_departmentId: { memberId, departmentId } },
    create: { memberId, departmentId, role },
    update: { role },
  });
  revalidatePath(`/membres/${memberId}`);
  redirect(`/membres/${memberId}?enregistre=1`);
}

export async function removeMembership(formData: FormData) {
  await requireUser(EDITORS);
  const id = String(formData.get("id"));
  const memberId = String(formData.get("memberId"));
  await prisma.departmentMembership.delete({ where: { id } });
  revalidatePath(`/membres/${memberId}`);
  redirect(`/membres/${memberId}`);
}
