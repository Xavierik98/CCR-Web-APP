// Numéro réel à fournir (format international, ex. 212612345678) via la
// variable d'environnement NEXT_PUBLIC_WHATSAPP_NUMBER. Tant qu'elle n'est
// pas définie, buildWhatsAppLink renvoie null : jamais de lien inventé.
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

export function buildWhatsAppLink(message: string): string | null {
  if (!WHATSAPP_NUMBER) return null;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
