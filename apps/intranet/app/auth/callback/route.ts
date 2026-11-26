import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

// Retour du lien de connexion reçu par e-mail : échange le code contre une
// session, puis ouvre le tableau de bord.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = (await supabase?.auth.exchangeCodeForSession(code)) ?? {
      error: true,
    };
    if (!error) {
      return NextResponse.redirect(new URL("/tableau-de-bord", request.url));
    }
  }
  return NextResponse.redirect(new URL("/login?erreur=lien", request.url));
}
