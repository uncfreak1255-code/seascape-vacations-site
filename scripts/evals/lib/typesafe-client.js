"use strict";

const DEFAULT_MODEL = "jev-1.13.0";
const SYSTEM_ONE_URL = "https://api.typesafe.ai/v1/systemone";

function createTypeSafeClient({ apiKey, model = DEFAULT_MODEL, fetchImpl = globalThis.fetch } = {}) {
  if (!apiKey) {
    throw new Error("TYPESAFE_API_KEY is required for the Jev AEO trial");
  }
  if (typeof fetchImpl !== "function") {
    throw new Error("A fetch implementation is required for the Jev AEO trial");
  }

  async function evaluate(state, questions) {
    const response = await fetchImpl(SYSTEM_ONE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ state, model, questions }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TypeSafe API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    if (!data || typeof data !== "object" || !data.answers || !data.usage) {
      throw new Error("TypeSafe API response is missing answers or usage");
    }
    if (!Number.isInteger(data.usage.input_tokens) || data.usage.input_tokens < 0) {
      throw new Error("TypeSafe API response has invalid input-token usage");
    }
    return data;
  }

  return { evaluate };
}

module.exports = { createTypeSafeClient, DEFAULT_MODEL, SYSTEM_ONE_URL };
