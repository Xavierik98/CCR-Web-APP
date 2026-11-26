import { redirect } from "next/navigation";
import { requireUser, SOCIAL } from "@/lib/auth";

export default async function OuvrirDossierPage({
  searchParams,
}: {
  searchParams: Promise<{ membre?: string }>;
}) {
  await requireUser(SOCIAL);
  const { membre } = await searchParams;
  redirect(membre ? `/accompagnement-social/${membre}` : "/accompagnement-social");
}
