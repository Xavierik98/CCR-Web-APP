import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@ccr/database";
import { recordAuthEvent } from "@/lib/audit";
import { createSupabaseServerClient } from "@/lib/supabase";

// Retour du lien de connexion reçu par e-mail : échange le code contre une
// session, puis ouvre le tableau de bord.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const supabase = await createSupabaseServerClient();
    const result = await supabase?.auth.exchangeCodeForSession(code);
    const email = result?.data.user?.email?.toLowerCase();
    if (result && !result.error && email) {
      const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
      if (user) await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
      await recordAuthEvent(user ? "LOGIN" : "LOGIN_FAILED", email, user?.id);
      return NextResponse.redirect(new URL("/tableau-de-bord", request.url));
    }
    await recordAuthEvent("LOGIN_FAILED", email ?? "lien expiré ou invalide");
  }
  return NextResponse.redirect(new URL("/login?erreur=lien", request.url));
}
