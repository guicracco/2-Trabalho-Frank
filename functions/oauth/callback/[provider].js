import { getCookie, clearTxCookie, sessionCookie } from "../../_shared/cookies.js";
import { randomB64Url, sha256B64Url } from "../../_shared/crypto.js";
import { PROVIDERS } from "../../_shared/providers.js";
import { verifyGoogleIdToken } from "../../_shared/oidc.js";
export async function onRequestGet({ request, params, env }) {
const noStore = { "Cache-Control": "no-store" };
const p = params.provider;
if (!Object.hasOwn(PROVIDERS, p)) {
return new Response("Not found", { status: 404, headers: noStore });
}
const cfg = PROVIDERS[p];
const url = new URL(request.url);
const code = url.searchParams.get("code");
const state = url.searchParams.get("state");
const error = url.searchParams.get("error");
if (error || !code || !state) {
return new Response("Requisição inválida", { status: 400, headers: noStore });
}
const txRaw = getCookie(request, "__Host-oauth-tx");
if (!txRaw) {
return new Response("Transação ausente", { status: 400, headers: noStore });
}
const txHash = await sha256B64Url(txRaw);
const now = Math.floor(Date.now() / 1000);
const tx = await env.DB.prepare(
"SELECT * FROM oauth_transactions WHERE id_hash = ? AND provider = ? AND expires_at > ?"
).bind(txHash, p, now).first();
if (!tx) {
return new Response("Transação inválida ou expirada", { status: 400, headers: noStore });
}
const stateHash = await sha256B64Url(state);
if (stateHash !== tx.state_hash) {
return new Response("State inválido", { status: 400, headers: noStore });
}
// Apaga a transação ANTES de trocar o código (impede reuso)
await env.DB.prepare("DELETE FROM oauth_transactions WHERE id_hash = ?").bind(txHash).run();
// Troca o código pelos tokens
const tokenBody = new URLSearchParams({
grant_type: "authorization_code",
code,
redirect_uri: `${env.PUBLIC_BASE_URL}/oauth/callback/${p}`,
client_id: cfg.clientId(env),

client_secret: cfg.clientSecret(env),
code_verifier: tx.code_verifier,
});
const tokenRes = await fetch(cfg.tokenUrl, {
method: "POST",
headers: {
"Content-Type": "application/x-www-form-urlencoded",
Accept: "application/json",
},
body: tokenBody.toString(),
});
if (!tokenRes.ok) {
return new Response("Falha na troca de tokens", { status: 400, headers: noStore });
}
const tokenData = await tokenRes.json();
let issuer, subject, email, displayName;
if (p === "google") {
if (!tokenData.id_token) {
return new Response("id_token ausente", { status: 400, headers: noStore });
}
let payload;
try {
payload = await verifyGoogleIdToken(tokenData.id_token, cfg.clientId(env), tx.nonce);
} catch (e) {
return new Response("id_token inválido", { status: 400, headers: noStore });
}
issuer = "https://accounts.google.com";
subject = payload.sub;
email = payload.email ?? null;
displayName = payload.name ?? null;
} else {
const accessToken = tokenData.access_token;
const tokenType = (tokenData.token_type || "").toLowerCase();
if (!accessToken || tokenType !== "bearer") {
return new Response("Resposta de token inválida", { status: 400, headers: noStore });
}
const userRes = await fetch("https://api.github.com/user", {
headers: {
Authorization: `Bearer ${accessToken}`,
Accept: "application/vnd.github+json",
"X-GitHub-Api-Version": "2026-03-10",
"User-Agent": "oauth-pages-lab",
},
});
if (userRes.status !== 200) {
return new Response("Falha ao consultar perfil GitHub", { status: 400, headers: noStore });
}
const userData = await userRes.json();
if (!Number.isInteger(userData.id)) {
return new Response("Perfil GitHub inválido", { status: 400, headers: noStore });
}

// Revoga a autorização concedida
const clientId = cfg.clientId(env);
const clientSecret = cfg.clientSecret(env);
const basicAuth = btoa(`${clientId}:${clientSecret}`);
const revokeRes = await fetch(
`https://api.github.com/applications/${clientId}/grant`,
{
method: "DELETE",
headers: {
Authorization: `Basic ${basicAuth}`,
Accept: "application/vnd.github+json",
"X-GitHub-Api-Version": "2026-03-10",
"Content-Type": "application/json",
"User-Agent": "oauth-pages-lab",
},
body: JSON.stringify({ access_token: accessToken }),
}
);
if (revokeRes.status !== 204) {
return new Response("Falha ao revogar autorização", { status: 400, headers: noStore });
}
issuer = "https://github.com";
subject = String(userData.id);
email = null;
displayName = userData.name ?? userData.login ?? null;
}
// Cria a sessão local
const sessionRaw = randomB64Url();
const sessionHash = await sha256B64Url(sessionRaw);
const expiresAt = now + 28800; // 8 horas
await env.DB.prepare(
`INSERT INTO sessions (id_hash, issuer, subject, email, display_name, expires_at, created_at)
VALUES (?, ?, ?, ?, ?, ?, ?)`
).bind(sessionHash, issuer, subject, email, displayName, expiresAt, now).run();
const headers = new Headers({
Location: env.PUBLIC_BASE_URL,
"Cache-Control": "no-store",
});
headers.append("Set-Cookie", sessionCookie(sessionRaw));
headers.append("Set-Cookie", clearTxCookie);
return new Response(null, { status: 302, headers });
}
