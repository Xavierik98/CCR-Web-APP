"use server";

import { prisma } from "@ccr/database";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { recordAuthEvent } from "@/lib/audit";
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
    await recordAuthEvent("LINK_SENT", email, allowed.id);
  } else {
    // Demande avec une adresse sans accès : gardée pour repérer les tentatives.
    await recordAuthEvent("LINK_REFUSED", email);
  }
  redirect("/login?envoye=1");
}

export async function signOut() {
  const user = await getCurrentUser();
  if (user) await recordAuthEvent("LOGOUT", user.email, user.id);
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/login");
}
