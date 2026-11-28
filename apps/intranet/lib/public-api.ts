// Points d'entrée appelés par le site public (formulaires) : seule l'adresse
// du site est autorisée à les appeler depuis un navigateur.
const ALLOWED = (process.env.PUBLIC_SITE_ORIGINS ?? "https://ccr-famille-public.vercel.app,http://localhost:3200")
  .split(",")
  .map((s) => s.trim());

export function cors(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED.includes(origin) ? origin : ALLOWED[0],
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

export async function preflight(request: Request) {
  return new Response(null, { status: 204, headers: cors(request) });
}
