// Dossiers de séjour : documents souvent demandés et signaux d'alerte.
export const RESIDENCY_DOCUMENTS = [
  "Passeport valide",
  "Photos d'identité",
  "Attestation de scolarité ou d'inscription",
  "Contrat de bail ou attestation d'hébergement",
  "Contrat ou attestation de travail",
  "Relevés bancaires",
  "Extrait de casier judiciaire",
  "Certificat médical",
  "Assurance maladie",
  "Timbre fiscal",
] as const;

// Au-delà de ce délai sans avancée, une procédure est signalée « stagnante ».
export const STAGNATION_DAYS = 60;
// Alerte quand le titre ou le récépissé expire dans moins de ce délai.
export const EXPIRY_WARNING_DAYS = 45;

type RecordLike = {
  residencyStatus: string;
  documentExpiry: Date | null;
  procedureStartedAt: Date | null;
  lastProgressAt: Date | null;
  missingDocuments: string[];
};

export type ResidencyAlert = { key: string; label: string; tone: "magenta" | "gold" };

export function residencyAlerts(r: RecordLike, now = Date.now()): ResidencyAlert[] {
  const out: ResidencyAlert[] = [];
  const day = 86400000;
  if (r.documentExpiry) {
    const left = Math.ceil((r.documentExpiry.getTime() - now) / day);
    if (left < 0) out.push({ key: "expire", label: `Document expiré depuis ${-left} j`, tone: "magenta" });
    else if (left <= EXPIRY_WARNING_DAYS) out.push({ key: "bientot", label: `Expire dans ${left} j`, tone: "gold" });
  }
  if (r.residencyStatus === "IN_PROGRESS") {
    const since = r.lastProgressAt ?? r.procedureStartedAt;
    if (since && now - since.getTime() > STAGNATION_DAYS * day)
      out.push({ key: "stagne", label: `Procédure sans avancée depuis ${Math.floor((now - since.getTime()) / day)} j`, tone: "magenta" });
  }
  if (r.residencyStatus === "NEVER_HAD") out.push({ key: "sans", label: "Sans carte de séjour", tone: "magenta" });
  if (r.missingDocuments.length) out.push({ key: "manquants", label: `${r.missingDocuments.length} document(s) manquant(s)`, tone: "gold" });
  return out;
}
