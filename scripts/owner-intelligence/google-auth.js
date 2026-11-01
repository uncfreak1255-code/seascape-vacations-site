"use strict";

const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const { request, required } = require("./provider-request");

// Opt-in reuse of the installed operator's credentials. Never logs/export-saves
// a credential, opens login, requests scopes, or creates another credential.
async function googleToken(env, { run = promisify(execFile), fetchImpl = fetch } = {}) {
  const mode = env.OWNER_INTELLIGENCE_GOOGLE_AUTH || "token";
  if (mode === "token") return required(env, "OWNER_INTELLIGENCE_GOOGLE_ACCESS_TOKEN");
  if (mode !== "gws") throw new Error("google_auth_mode_invalid");
  const account = required(env, "OWNER_INTELLIGENCE_GOOGLE_ACCOUNT").trim().toLowerCase();
  let token = env.GOOGLE_WORKSPACE_CLI_TOKEN;
  try {
    if (!token) {
      const result = await run(env.OWNER_INTELLIGENCE_GWS_BIN || "gws", ["auth", "export", "--unmasked"],
        { env, timeout: 15000, maxBuffer: 65536 });
      const credentials = JSON.parse(result.stdout);
      if (credentials.type !== "authorized_user" ||
          ![credentials.client_id, credentials.client_secret, credentials.refresh_token]
            .every(value => typeof value === "string" && value.trim() && !value.includes("***"))) {
        throw new Error("invalid_existing_credentials");
      }
      const response = await fetchImpl("https://oauth2.googleapis.com/token", {
        method: "POST", redirect: "error", signal: AbortSignal.timeout(15000),
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ grant_type: "refresh_token", client_id: credentials.client_id,
          client_secret: credentials.client_secret, refresh_token: credentials.refresh_token }).toString(),
      });
      if (!response.ok) throw new Error("existing_refresh_failed");
      const value = await response.json();
      if (typeof value.access_token !== "string" || !value.access_token || value.token_type !== "Bearer") {
        throw new Error("invalid_existing_token");
      }
      token = value.access_token;
    }
    const about = await request("https://www.googleapis.com/drive/v3/about?fields=user(emailAddress)", token, {}, fetchImpl);
    if (about.user?.emailAddress?.toLowerCase() !== account) throw new Error("wrong_operator_account");
    return token;
  } catch (_error) {
    // execFile errors can contain stdout, stderr and decrypted credentials.
    // Discard them completely; no cause, provider text or command output escapes.
    throw new Error("existing_google_auth_unavailable_or_account_mismatch");
  }
}

module.exports = { googleToken };
