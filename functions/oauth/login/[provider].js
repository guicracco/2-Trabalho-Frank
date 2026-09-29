import { randomB64Url, sha256B64Url } from "../../_shared/crypto.js";
import { txCookie } from "../../_shared/cookies.js";
import { PROVIDERS } from "../../_shared/providers.js";
export async function onRequestGet({ params, env }) {
const p = params.provider;
if (!Object.hasOwn(PROVIDERS, p)) {
return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
}
const cfg = PROVIDERS[p];
const txRaw = randomB64Url();
const state = randomB64Url();
const verifier = randomB64Url();
const nonce = p === "google" ? randomB64Url() : null;
const challenge = await sha256B64Url(verifier);
const now = Math.floor(Date.now() / 1000);
await env.DB.prepare(
`INSERT INTO oauth_transactions (id_hash, provider, state_hash, nonce, code_verifier, expires_at)
VALUES (?, ?, ?, ?, ?, ?)`
).bind(
await sha256B64Url(txRaw),
p,
await sha256B64Url(state),
nonce,
verifier,
now + 600
).run();
const authUrl = new URL(cfg.authUrl);
authUrl.searchParams.set("client_id", cfg.clientId(env));
authUrl.searchParams.set("redirect_uri", `${env.PUBLIC_BASE_URL}/oauth/callback/${p}`);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("state", state);
authUrl.searchParams.set("code_challenge", challenge);
authUrl.searchParams.set("code_challenge_method", "S256");
if (p === "google") {
authUrl.searchParams.set("scope", "openid email profile");
authUrl.searchParams.set("nonce", nonce);
}
const headers = new Headers({
Location: authUrl.toString(),
"Cache-Control": "no-store",
});
headers.append("Set-Cookie", txCookie(txRaw));

return new Response(null, { status: 302, headers });
}

