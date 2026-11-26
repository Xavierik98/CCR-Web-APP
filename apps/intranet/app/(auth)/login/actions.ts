"use server";

import { prisma } from "@ccr/database";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) redirect("/login?erreur=email");

  // Lien envoyé seulement aux adresses enregistrées par un administrateur ;
  // la réponse affichée reste la même dans tous les cas, pour ne pas révéler
  // quelles adresses ont un compte.
  const allowed = await prisma.user.findUnique({ where: { email } });
  if (allowed) {
    const supabase = await createSupabaseServerClient();
    const h = await headers();
    const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
    await supabase?.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/auth/callback` },
    });
  }
  redirect("/login?envoye=1");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/login");
}
