import { getCookie, clearSessionCookie } from "../_shared/cookies.js";
import { sha256B64Url } from "../_shared/crypto.js";
export async function onRequestPost({ request, env }) {
const noStore = { "Cache-Control": "no-store" };

if (request.headers.get("Origin") !== env.PUBLIC_BASE_URL) {
return new Response("Origem não autorizada", { status: 403, headers: noStore });
}
const raw = getCookie(request, "__Host-session");
if (raw) {
const idHash = await sha256B64Url(raw);
await env.DB.prepare("DELETE FROM sessions WHERE id_hash = ?").bind(idHash).run();
}
const headers = new Headers({
Location: env.PUBLIC_BASE_URL,
"Cache-Control": "no-store",
});
headers.append("Set-Cookie", clearSessionCookie);
return new Response(null, { status: 302, headers });
}
