import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Noms fournis par l'intégration Supabase de Vercel (les deux variantes de
// clé publique existent selon la version de l'intégration).
export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

export async function createSupabaseServerClient() {
  const env = supabaseEnv();
  if (!env) return null;
  const cookieStore = await cookies();
  return createServerClient(env.url, env.key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          for (const { name, value, options } of toSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Appelé depuis un composant serveur : le middleware rafraîchit déjà
          // la session, l'écriture des cookies peut être ignorée ici.
        }
      },
    },
  });
}
