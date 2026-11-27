import { prisma, type AuthEventType } from "@ccr/database";
import { headers } from "next/headers";

// Résumé lisible de l'appareil à partir de l'identifiant du navigateur.
export function describeDevice(ua: string | null) {
  if (!ua) return null;
  const os = /iPhone/.test(ua)
    ? "iPhone"
    : /iPad/.test(ua)
      ? "iPad"
      : /Android/.test(ua)
        ? "Android"
        : /Windows/.test(ua)
          ? "Windows"
          : /Mac OS X|Macintosh/.test(ua)
            ? "Mac"
            : /CrOS/.test(ua)
              ? "Chromebook"
              : /Linux/.test(ua)
                ? "Linux"
                : "Appareil inconnu";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\/|Opera/.test(ua)
      ? "Opera"
      : /SamsungBrowser/.test(ua)
        ? "Samsung Internet"
        : /Firefox|FxiOS/.test(ua)
          ? "Firefox"
          : /Chrome|CriOS/.test(ua)
            ? "Chrome"
            : /Safari/.test(ua)
              ? "Safari"
              : null;
  const kind = /iPad|Tablet/.test(ua) ? "tablette" : /Mobile|iPhone|Android/.test(ua) ? "téléphone" : "ordinateur";
  return [os, browser].filter(Boolean).join(", ") + ` (${kind})`;
}

function decode(v: string | null) {
  if (!v) return null;
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

// Enregistre un événement de connexion. Le lieu vient des en-têtes ajoutés
// par Vercel (ville, région, pays déduits de l'adresse IP) : il est donc
// approximatif et absent en local. Ne bloque jamais la connexion en cas
// d'erreur d'écriture.
export async function requestInfo() {
  const h = await headers();
  const ua = h.get("user-agent");
  return {
    ip: (h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "").split(",")[0].trim() || null,
    city: decode(h.get("x-vercel-ip-city")),
    region: decode(h.get("x-vercel-ip-country-region")),
    country: h.get("x-vercel-ip-country"),
    userAgent: ua?.slice(0, 500) ?? null,
    device: describeDevice(ua),
  };
}

// Identifiant de la session Supabase, lu dans le jeton déjà vérifié.
export function sessionIdFromToken(token: string | undefined | null) {
  if (!token) return null;
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    return typeof payload.session_id === "string" ? payload.session_id : null;
  } catch {
    return null;
  }
}

// Met à jour la dernière activité d'un utilisateur (au plus une fois par
// minute) ; une session jamais vue (ouverte avant la mise en place du
// journal, ou depuis un autre appareil) est inscrite comme connexion.
export async function trackActivity(
  user: { id: string; email: string; lastSeenAt: Date | null; lastSessionId: string | null },
  sessionId: string | null,
) {
  const newSession = !!sessionId && sessionId !== user.lastSessionId;
  const stale = !user.lastSeenAt || Date.now() - user.lastSeenAt.getTime() > 60_000;
  if (!newSession && !stale) return;
  try {
    const info = await requestInfo();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastSeenAt: new Date(),
        lastSeenIp: info.ip,
        lastSeenCity: info.city,
        lastSeenCountry: info.country,
        lastSeenDevice: info.device,
        ...(newSession ? { lastSessionId: sessionId } : {}),
      },
    });
    if (newSession) await recordAuthEvent("LOGIN", user.email, user.id);
  } catch (error) {
    console.error("Suivi d'activité impossible", error);
  }
}

export async function recordAuthEvent(type: AuthEventType, email: string, userId?: string | null) {
  try {
    const info = await requestInfo();
    await prisma.authEvent.create({
      data: { type, email: email.slice(0, 200), userId: userId ?? null, ...info },
    });
    // Conservation limitée à douze mois.
    await prisma.authEvent.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 365 * 86400000) } } });
  } catch (error) {
    console.error("Journal des connexions : écriture impossible", error);
  }
}
