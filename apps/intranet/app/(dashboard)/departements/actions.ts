"use server";

import { prisma } from "@ccr/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccess } from "@/lib/auth";

function text(formData: FormData, key: string) {
  const v = String(formData.get(key) ?? "").trim();
  return v === "" ? null : v;
}

export async function saveDepartment(formData: FormData) {
  await requireAccess("departements", "edit");
  const id = text(formData, "id");
  const name = text(formData, "name");
  if (!name) redirect(id ? `/departements/${id}` : "/departements");
  const data = { name, description: text(formData, "description") };
  const dept = id
    ? await prisma.department.update({ where: { id }, data })
    : await prisma.department.create({ data });
  revalidatePath("/departements");
  redirect(`/departements/${dept.id}?enregistre=1`);
}

export async function deleteDepartment(formData: FormData) {
  await requireAccess("departements", "edit");
  await prisma.department.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/departements");
  redirect("/departements");
}

export async function addDepartmentMember(formData: FormData) {
  await requireAccess("departements", "edit");
  const departmentId = String(formData.get("departmentId"));
  const memberId = text(formData, "memberId");
  if (memberId) {
    const role = text(formData, "role");
    await prisma.departmentMembership.upsert({
      where: { memberId_departmentId: { memberId, departmentId } },
      create: { memberId, departmentId, role },
      update: { role },
    });
  }
  revalidatePath(`/departements/${departmentId}`);
  redirect(`/departements/${departmentId}?enregistre=1`);
}

export async function updateMembershipRole(formData: FormData) {
  await requireAccess("departements", "edit");
  const id = String(formData.get("id"));
  const ms = await prisma.departmentMembership.update({
    where: { id },
    data: { role: text(formData, "role") },
  });
  revalidatePath(`/departements/${ms.departmentId}`);
  redirect(`/departements/${ms.departmentId}?enregistre=1`);
}

export async function removeDepartmentMember(formData: FormData) {
  await requireAccess("departements", "edit");
  const ms = await prisma.departmentMembership.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath(`/departements/${ms.departmentId}`);
  redirect(`/departements/${ms.departmentId}`);
}

export async function saveGroup(formData: FormData) {
  await requireAccess("departements", "edit");
  const id = text(formData, "id");
  const name = text(formData, "name");
  if (!name) redirect("/departements");
  const leaderMemberId = text(formData, "leaderMemberId");
  if (leaderMemberId) {
    // Un membre ne dirige qu'un groupe à la fois.
    await prisma.group.updateMany({
      where: { leaderMemberId, NOT: id ? { id } : undefined },
      data: { leaderMemberId: null },
    });
  }
  const data = { name, neighborhood: text(formData, "neighborhood"), leaderMemberId };
  const group = id
    ? await prisma.group.update({ where: { id }, data })
    : await prisma.group.create({ data });
  revalidatePath("/departements");
  redirect(`/departements/groupes/${group.id}?enregistre=1`);
}

export async function setGroupMember(formData: FormData) {
  await requireAccess("departements", "edit");
  const groupId = String(formData.get("groupId"));
  const memberId = text(formData, "memberId");
  const remove = formData.get("remove") === "1";
  if (memberId) {
    await prisma.member.update({ where: { id: memberId }, data: { groupId: remove ? null : groupId } });
  }
  revalidatePath(`/departements/groupes/${groupId}`);
  redirect(`/departements/groupes/${groupId}`);
}

export async function deleteGroup(formData: FormData) {
  await requireAccess("departements", "edit");
  await prisma.group.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/departements");
  redirect("/departements");
}
