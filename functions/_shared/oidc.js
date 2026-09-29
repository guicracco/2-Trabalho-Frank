import { PROVIDERS } from "./providers.js";
function b64urlDecode(str) {
str = str.replace(/-/g, "+").replace(/_/g, "/");
while (str.length % 4) str += "=";
const bin = atob(str);
const bytes = new Uint8Array(bin.length);
for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
return bytes;
}
function b64urlDecodeJson(str) {
return JSON.parse(new TextDecoder().decode(b64urlDecode(str)));
}
export async function verifyGoogleIdToken(idToken, expectedClientId, expectedNonce) {
const parts = idToken.split(".");
if (parts.length !== 3) throw new Error("id_token malformado");
const [headerB64, payloadB64, sigB64] = parts;
const header = b64urlDecodeJson(headerB64);
if (header.alg !== "RS256") throw new Error("algoritmo inesperado");
const discoveryRes = await fetch(PROVIDERS.google.discovery);
const discovery = await discoveryRes.json();
if (discovery.issuer !== PROVIDERS.google.issuer) throw new Error("issuer de descoberta inválido");
const jwksRes = await fetch(discovery.jwks_uri);
const jwks = await jwksRes.json();
const jwk = jwks.keys.find((k) => k.kid === header.kid);
if (!jwk) throw new Error("chave não encontrada no JWKS");
const key = await crypto.subtle.importKey(
"jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]
);
const signature = b64urlDecode(sigB64);
const signedData = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, signedData);
if (!valid) throw new Error("assinatura inválida");
const payload = b64urlDecodeJson(payloadB64);
const now = Math.floor(Date.now() / 1000);
if (payload.iss !== PROVIDERS.google.issuer && payload.iss !== "accounts.google.com")
throw new Error("iss inválido");
if (payload.aud !== expectedClientId) throw new Error("aud inválido");
if (typeof payload.exp !== "number" || payload.exp < now) throw new Error("token expirado");
if (typeof payload.iat !== "number" || payload.iat > now + 60) throw new Error("iat inválido");
if (payload.nonce !== expectedNonce) throw new Error("nonce inválido");
return payload; // contém sub, email, name, etc.
}
