import { redirect } from "next/navigation";
import { requireAccess } from "@/lib/auth";

export default async function OuvrirDossierPage({ searchParams }: { searchParams: Promise<{ membre?: string }> }) {
  await requireAccess("sejour", "edit");
  const { membre } = await searchParams;
  redirect(membre ? `/dossiers-sejour/${membre}` : "/dossiers-sejour");
}
