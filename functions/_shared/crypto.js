export function b64url(buf) {
const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
let s = "";
for (const b of bytes) s += String.fromCharCode(b);
return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function randomB64Url(n = 32) {
return b64url(crypto.getRandomValues(new Uint8Array(n)));
}
export async function sha256B64Url(text) {
const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
return b64url(d);
}
