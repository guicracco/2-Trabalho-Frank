import { getCookie } from "../_shared/cookies.js";
import { sha256B64Url } from "../_shared/crypto.js";
export async function onRequestGet({ request, env }) {
const h = { "Cache-Control": "no-store" };
const raw = getCookie(request, "__Host-session");
if (!raw) return Response.json({ error: "unauthorized" }, { status: 401, headers: h });
const idHash = await sha256B64Url(raw);
const now = Math.floor(Date.now() / 1000);
const row = await env.DB.prepare(
"SELECT email, display_name FROM sessions WHERE id_hash = ? AND expires_at > ?"
).bind(idHash, now).first();

if (!row) return Response.json({ error: "unauthorized" }, { status: 401, headers: h });
return Response.json({ email: row.email, displayName: row.display_name }, { headers: h });
}
