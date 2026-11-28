import { prisma } from "@ccr/database";

// Campagnes ouvertes au formulaire public : formulaire ouvert et pas terminées.
export async function openCampaigns() {
  const today = new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Casablanca" }) + "T00:00:00Z");
  return prisma.campaign.findMany({
    where: { formOpen: true, OR: [{ endDate: null }, { endDate: { gte: today } }] },
    orderBy: { startDate: "desc" },
    select: { id: true, name: true, startDate: true, endDate: true, description: true, coverImageUrl: true, videoUrl: true, monthly: true },
  });
}

export function publicCampaign(c: Awaited<ReturnType<typeof openCampaigns>>[number]) {
  return {
    id: c.id,
    nom: c.name,
    debut: c.startDate.toISOString().slice(0, 10),
    fin: c.endDate?.toISOString().slice(0, 10) ?? null,
    description: c.description,
    image: c.coverImageUrl,
    video: c.videoUrl,
    mensuel: c.monthly,
  };
}
