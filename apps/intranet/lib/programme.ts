// Programme hebdomadaire publié sur le site (apps/public/app/_data/programme.ts).
// À garder identique tant que le programme n'est pas éditable depuis le CMS.
export const PROGRAMME = [
  { jours: [1, 2, 3, 4, 5], titre: "Prière de minuit", horaire: "00h00 - 00h30" },
  { jours: [1], titre: "Cours d'affermissement", horaire: "20h30 - 21h30" },
  { jours: [2], titre: "Intercession", horaire: "19h30 - 21h30" },
  { jours: [3], titre: "Église de maison", horaire: "19h30 - 21h00" },
  { jours: [5], titre: "Culte de délivrance", horaire: "19h30 - 21h30" },
  { jours: [6], titre: "Prière de la jeunesse", horaire: "21h00 - 21h30" },
  { jours: [0], titre: "Rassemblement dominical", horaire: "10h30 - 13h30", culte: true },
] as const;

export type Occurrence = { titre: string; horaire: string; date: Date; culte: boolean };

// Heure murale de Casablanca représentée comme une date UTC : les calculs et
// l'affichage se font ensuite en UTC, quel que soit le fuseau du serveur.
export function casablancaNow(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Casablanca",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  return new Date(Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute));
}

export function upcoming(count = 5): Occurrence[] {
  const now = casablancaNow();
  const list: Occurrence[] = [];
  for (const item of PROGRAMME) {
    const [h, m] = item.horaire.split(" - ")[0].split("h").map(Number);
    for (const jour of item.jours) {
      const d = new Date(now);
      d.setUTCDate(now.getUTCDate() + ((jour - now.getUTCDay() + 7) % 7));
      d.setUTCHours(h, m, 0, 0);
      if (d <= now) d.setUTCDate(d.getUTCDate() + 7);
      list.push({ titre: item.titre, horaire: item.horaire, date: d, culte: "culte" in item });
    }
  }
  return list.sort((a, b) => +a.date - +b.date).slice(0, count);
}

export function nextCulte(): Occurrence {
  return upcoming(20).find((o) => o.culte)!;
}

export function formatOccurrence(d: Date, withDay = true) {
  return d.toLocaleDateString("fr-FR", {
    weekday: withDay ? "long" : undefined,
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

const iso = (d: Date) => d.toISOString().slice(0, 10);

// Dimanches à pointer (dates AAAA-MM-JJ, heure de Casablanca) : le dimanche du
// jour ou le prochain, puis les `weeks` dimanches précédents.
export function recentSundays(weeks = 4) {
  const now = casablancaNow();
  const next = new Date(now);
  next.setUTCDate(now.getUTCDate() + ((7 - now.getUTCDay()) % 7));
  return Array.from({ length: weeks + 1 }, (_, i) => {
    const d = new Date(next);
    d.setUTCDate(next.getUTCDate() - 7 * i);
    return iso(d);
  });
}

export function casablancaToday() {
  return iso(casablancaNow());
}

export function isSunday(day: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(day) && new Date(`${day}T12:00:00Z`).getUTCDay() === 0;
}

export function formatDay(day: string) {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
