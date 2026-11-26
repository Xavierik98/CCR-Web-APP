import { redirect } from "next/navigation";
import { requireAccess } from "@/lib/auth";

export default async function OuvrirDossierPage({
  searchParams,
}: {
  searchParams: Promise<{ membre?: string }>;
}) {
  await requireAccess("social");
  const { membre } = await searchParams;
  redirect(membre ? `/accompagnement-social/${membre}` : "/accompagnement-social");
}
