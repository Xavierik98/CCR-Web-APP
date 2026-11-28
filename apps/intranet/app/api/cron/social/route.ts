import { publishDonationAppeal, remindStockLevel } from "@/lib/appeal";
import { logContent } from "@/lib/people";
import { casablancaNow } from "@/lib/programme";

export const dynamic = "force-dynamic";

// Tâche planifiée quotidienne (voir vercel.json) :
// - le 1er du mois : appel aux dons en nature publié sur le site et rappel du stock ;
// - chaque lundi, si des articles sont au seuil d'alerte : rappel à
//   l'accompagnement social et appel du mois s'il n'existe pas encore.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  const fromVercel = (request.headers.get("user-agent") ?? "").startsWith("vercel-cron");
  if (secret ? auth !== `Bearer ${secret}` : !fromVercel) return new Response("Accès refusé", { status: 401 });

  const now = casablancaNow();
  const firstOfMonth = now.getUTCDate() === 1;
  const monday = now.getUTCDay() === 1;
  if (!firstOfMonth && !monday) return Response.json({ fait: false, raison: "ni le 1er du mois ni un lundi" });

  const rappel = await remindStockLevel();
  if (!firstOfMonth && rappel.low === 0) return Response.json({ fait: false, raison: "stock suffisant" });
  const { content, created } = await publishDonationAppeal("systeme", true);
  if (created) await logContent(content.id, content.title, "Publiée automatiquement", "systeme");
  return Response.json({ fait: true, appel: content.slug, nouveau: created, rappel });
}
