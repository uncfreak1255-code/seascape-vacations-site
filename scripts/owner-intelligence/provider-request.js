"use strict";

function required(env, key) {
  if (!env[key]) throw new Error("missing_" + key);
  return env[key];
}

async function request(url, token, options = {}, fetchImpl = fetch) {
  let response;
  try {
    response = await fetchImpl(url, {
      ...options, redirect: "error", signal: AbortSignal.timeout(30000),
      headers: { authorization: "Bearer " + token, "content-type": "application/json" }
    });
  } catch (_error) { throw new Error("private_api_transport_failed"); }
  if (!response.ok) throw new Error("private_api_http_" + response.status);
  try { return await response.json(); }
  catch (_error) { throw new Error("private_api_invalid_json"); }
}

module.exports = { required, request };
