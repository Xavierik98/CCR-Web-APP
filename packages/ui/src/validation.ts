// Règles de saisie communes au site public et à l'intranet. Les mêmes
// fonctions servent dans le navigateur (message immédiat) et sur le serveur
// (aucune donnée non conforme n'est enregistrée, même en contournant le
// navigateur).

export type FieldKind = "name" | "phone" | "email";

export const FIELD_HINTS: Record<FieldKind, string> = {
  name: "Lettres uniquement, au moins 2 caractères.",
  phone: "Format : +212 6XX XX XX XX ou 06 XX XX XX XX",
  email: "Exemple : prenom.nom@gmail.com",
};

export const FIELD_PLACEHOLDERS: Record<FieldKind, string> = {
  name: "",
  phone: "+212 6XX XX XX XX",
  email: "prenom.nom@gmail.com",
};

const NAME = /^\p{L}(?:[\p{L}'’ .-]*[\p{L}.])?$/u;
const EMAIL = /^[a-z0-9._%+-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/i;
// Maroc : +212 / 00212 suivi de 5, 6 ou 7 et 8 chiffres (le 0 après 212 est
// toléré), ou 05/06/07 suivi de 8 chiffres. Ailleurs : indicatif + 8 à 15 chiffres.
const PHONE_MA = /^(?:(?:\+|00)2120?|0)[5-7]\d{8}$/;
const PHONE_INTL = /^(?:\+|00)(?!212)\d{8,15}$/;

export function cleanPhone(raw: string) {
  return raw.replace(/[\s.\-()]/g, "");
}

// Renvoie le message d'erreur à afficher, ou null si la saisie est conforme.
export function checkField(kind: FieldKind, raw: string | null | undefined, required = true): string | null {
  const v = (raw ?? "").trim();
  if (!v) return required ? "Ce champ est obligatoire." : null;
  if (kind === "name" && (v.replace(/[^\p{L}]/gu, "").length < 2 || !NAME.test(v))) {
    return "Saisie non conforme : au moins 2 lettres, sans chiffres ni symboles.";
  }
  if (kind === "phone") {
    const p = cleanPhone(v);
    if (!PHONE_MA.test(p) && !PHONE_INTL.test(p)) {
      return "Numéro non conforme. Format attendu : +212 6XX XX XX XX ou 06 XX XX XX XX.";
    }
  }
  if (kind === "email" && !EMAIL.test(v)) {
    return "Adresse e-mail non conforme. Exemple : prenom.nom@gmail.com";
  }
  return null;
}
