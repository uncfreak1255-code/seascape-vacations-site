"use strict";

const DEFAULT_MODEL = "claude-sonnet-4-6";
const ANTHROPIC_API_VERSION = "2023-06-01";
const MAX_TOKENS = 1500;

/**
 * createClient({apiKey, model}) -> { complete(systemPrompt, userPrompt) }
 *
 * complete() POSTs to https://api.anthropic.com/v1/messages and returns
 * the assistant text string.
 *
 * Throws synchronously if model matches /opus/i.
 */
function createClient({ apiKey, model = DEFAULT_MODEL } = {}) {
  if (/opus/i.test(model)) {
    throw new Error(
      `Opus models are banned for eval judging (cost control). ` +
        `Use a Sonnet/Haiku model. Received: ${model}`
    );
  }

  async function complete(systemPrompt, userPrompt) {
    const body = {
      model,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    };

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_API_VERSION,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Anthropic API error ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();
    // Extract text from content array
    const textBlocks = (data.content || []).filter((b) => b.type === "text");
    if (textBlocks.length === 0) {
      throw new Error("Anthropic API returned no text content");
    }
    return textBlocks.map((b) => b.text).join("");
  }

  return { complete };
}

module.exports = { createClient };
