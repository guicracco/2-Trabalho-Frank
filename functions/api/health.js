export function onRequestGet({ env }) {
  return Response.json(
    {
      status: "ok",
      debug_public_base_url: env.PUBLIC_BASE_URL ?? "NAO_DEFINIDA",
      debug_google_client_id: env.GOOGLE_CLIENT_ID ? "DEFINIDA" : "NAO_DEFINIDA",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
