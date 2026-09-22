"use strict";

const DEFAULT_MODEL = "jev-latest";
const SYSTEM_ONE_URL = "https://api.typesafe.ai/v1/systemone";

function createTypeSafeClient({
  apiKey,
  model = DEFAULT_MODEL,
  fetchImpl = globalThis.fetch,
  timeoutMs = 30_000,
} = {}) {
  if (!apiKey) {
    throw new Error("TYPESAFE_API_KEY is required for the Jev AEO trial");
  }
  if (typeof fetchImpl !== "function") {
    throw new Error("A fetch implementation is required for the Jev AEO trial");
  }
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
    throw new Error("A positive integer timeout is required for the Jev AEO trial");
  }

  async function evaluate(state, questions) {
    let response;
    try {
      response = await fetchImpl(SYSTEM_ONE_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ state, model, questions }),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch {
      throw new Error("TypeSafe API request failed");
    }

    let ok;
    let status;
    try {
      ok = response.ok;
      status = response.status;
    } catch {
      throw new Error("TypeSafe API response metadata could not be read");
    }
    if (ok !== true) {
      const safeStatus = Number.isInteger(status) && status >= 100 && status <= 599 ? ` ${status}` : "";
      throw new Error(`TypeSafe API error${safeStatus}`);
    }

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error("TypeSafe API response could not be parsed");
    }
    try {
      if (!data || typeof data !== "object" || !data.answers || !data.usage) {
        throw new Error("TypeSafe API response is missing answers or usage");
      }
      if (!Number.isInteger(data.usage.input_tokens) || data.usage.input_tokens < 0) {
        throw new Error("TypeSafe API response has invalid input-token usage");
      }
    } catch (error) {
      if (error.message === "TypeSafe API response is missing answers or usage" || error.message === "TypeSafe API response has invalid input-token usage") throw error;
      throw new Error("TypeSafe API response data could not be read");
    }
    return data;
  }

  return { evaluate };
}

module.exports = { createTypeSafeClient, DEFAULT_MODEL, SYSTEM_ONE_URL };
