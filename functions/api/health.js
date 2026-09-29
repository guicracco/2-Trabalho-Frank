export function onRequestGet({ env }) {
  return Response.json(
    { status: "ok", debug: JSON.stringify(env.PUBLIC_BASE_URL) },
    { headers: { "Cache-Control": "no-store" } }
  );
}
