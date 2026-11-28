import { prisma } from "@ccr/database";
import { cors, preflight } from "@/lib/public-api";

export const dynamic = "force-dynamic";

export const OPTIONS = preflight;

// Actualités publiées depuis l'intranet (dont les appels aux dons du
// social), lues par le site public.
export async function GET(request: Request) {
  const items = await prisma.content.findMany({
    where: { type: "NEWS", status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 30,
    select: { slug: true, title: true, body: true, coverImageUrl: true, publishedAt: true, createdAt: true },
  });
  return Response.json(
    items.map((i) => ({
      slug: i.slug,
      titre: i.title,
      texte: i.body,
      image: i.coverImageUrl,
      date: (i.publishedAt ?? i.createdAt).toISOString().slice(0, 10),
    })),
    { headers: { ...cors(request), "Cache-Control": "s-maxage=120, stale-while-revalidate=600" } },
  );
}
