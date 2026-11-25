// Liens réseaux sociaux : aucune URL inventée. Chaque lien reste vide tant
// que le vrai compte n'est pas fourni par l'église ; définissez la variable
// d'environnement correspondante une fois le compte créé (ex. sur Vercel) :
// NEXT_PUBLIC_FACEBOOK_URL, NEXT_PUBLIC_INSTAGRAM_URL,
// NEXT_PUBLIC_TIKTOK_URL, NEXT_PUBLIC_YOUTUBE_URL.
export const SOCIAL_LINKS = [
  {
    name: "facebook" as const,
    label: "Facebook",
    href: process.env.NEXT_PUBLIC_FACEBOOK_URL,
  },
  {
    name: "instagram" as const,
    label: "Instagram",
    href: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  },
  {
    name: "tiktok" as const,
    label: "TikTok",
    href: process.env.NEXT_PUBLIC_TIKTOK_URL,
  },
  {
    name: "youtube" as const,
    label: "YouTube",
    href: process.env.NEXT_PUBLIC_YOUTUBE_URL,
  },
];
