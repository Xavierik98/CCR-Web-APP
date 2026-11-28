"use server";

import { prisma } from "@ccr/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccess } from "@/lib/auth";

export async function toggleMessage(formData: FormData) {
  const user = await requireAccess("messages", "edit");
  const id = String(formData.get("id"));
  const m = await prisma.contactMessage.findUniqueOrThrow({ where: { id } });
  await prisma.contactMessage.update({
    where: { id },
    data: m.status === "NEW" ? { status: "DONE", handledAt: new Date(), handledBy: user.email } : { status: "NEW", handledAt: null, handledBy: null },
  });
  revalidatePath("/messages");
  redirect(String(formData.get("retour") ?? "/messages"));
}
