export const PROVIDERS = {
google: {
authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
tokenUrl: "https://oauth2.googleapis.com/token",
issuer: "https://accounts.google.com",
discovery: "https://accounts.google.com/.well-known/openid-configuration",
clientId: (env) => env.GOOGLE_CLIENT_ID,
clientSecret: (env) => env.GOOGLE_CLIENT_SECRET,
},
github: {
authUrl: "https://github.com/login/oauth/authorize",
tokenUrl: "https://github.com/login/oauth/access_token",
issuer: "https://github.com",
clientId: (env) => env.GITHUB_CLIENT_ID,
clientSecret: (env) => env.GITHUB_CLIENT_SECRET,
},
};

