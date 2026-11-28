import { prisma } from "@ccr/database";
import { cors, preflight } from "@/lib/public-api";

export const dynamic = "force-dynamic";

export const OPTIONS = preflight;

// Actualités publiées depuis l'intranet (dont les appels aux dons du
// social), lues par le site public.
export async function GET(request: Request) {
  const items = await prisma.content.findMany({
    where: { type: { in: ["NEWS", "EVENT"] }, status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 30,
    select: { type: true, slug: true, title: true, body: true, coverImageUrl: true, videoUrl: true, eventAt: true, location: true, publishedAt: true, createdAt: true },
  });
  return Response.json(
    items.map((i) => ({
      slug: i.slug,
      titre: i.title,
      texte: i.body,
      image: i.coverImageUrl,
      video: i.videoUrl,
      evenement: i.type === "EVENT",
      lieu: i.location,
      heure:
        i.eventAt && i.eventAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Africa/Casablanca" }) !== "00:00"
          ? i.eventAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Africa/Casablanca" }).replace(":", "h")
          : null,
      date: (i.eventAt ?? i.publishedAt ?? i.createdAt).toLocaleDateString("en-CA", { timeZone: "Africa/Casablanca" }),
    })),
    { headers: { ...cors(request), "Cache-Control": "s-maxage=120, stale-while-revalidate=600" } },
  );
}
