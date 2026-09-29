export function getCookie(request, name) {
const h = request.headers.get("Cookie") || "";
for (const part of h.split(";")) {
const [k, ...v] = part.trim().split("=");
if (k === name) return v.join("=");
}
return null;
}

export const txCookie = (v) =>
`__Host-oauth-tx=${v}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`;
export const clearTxCookie =
"__Host-oauth-tx=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
export const sessionCookie = (v) =>
`__Host-session=${v}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`;
export const clearSessionCookie =
"__Host-session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0";

