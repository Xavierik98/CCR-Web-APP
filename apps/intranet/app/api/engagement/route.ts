import { openCampaigns, publicCampaign } from "@/lib/engagement";
import { cors, preflight } from "@/lib/public-api";

export const dynamic = "force-dynamic";
export const OPTIONS = preflight;

// Campagnes auxquelles on peut s'engager depuis le site public.
export async function GET(request: Request) {
  const list = await openCampaigns();
  return Response.json(list.map(publicCampaign), { headers: { ...cors(request), "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } });
}
