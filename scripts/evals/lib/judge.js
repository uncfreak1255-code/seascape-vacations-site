"use strict";

/**
 * judge({copy, rubric, client}) -> dimScores
 *
 * Builds a CoT prompt instructing the judge to:
 * 1. Reason step by step about each dimension against its criteria
 * 2. Output a SINGLE final fenced ```json block mapping every dimension id
 *    to an integer 0..max
 *
 * Parses the LAST ```json block from the response.
 * Validates every rubric dimension id is present and integer-in-range.
 */
async function judge({ copy, rubric, client }) {
  const systemPrompt = buildSystemPrompt(rubric);
  const userPrompt = buildUserPrompt(copy, rubric);

  const responseText = await client.complete(systemPrompt, userPrompt);

  return parseAndValidateScores(responseText, rubric);
}

function buildSystemPrompt(rubric) {
  const dimDescriptions = rubric.dimensions
    .map((d) => `  - ${d.id} (max ${d.max}): ${d.criteria}`)
    .join("\n");

  return `You are an expert copy evaluator for Seascape Vacations marketing pages.

Your job is to score reader-facing copy against a rubric. You will:
1. Reason step by step about each dimension
2. Output a final JSON block with integer scores

Rubric: ${rubric.id} v${rubric.version || "unknown"}

Dimensions to score:
${dimDescriptions}

Rules:
- Scores must be integers from 0 to the dimension max (inclusive)
- Reason carefully before scoring
- End your response with EXACTLY ONE fenced \`\`\`json block containing all dimension scores
- The JSON must map each dimension id to its integer score`;
}

function buildUserPrompt(copy, rubric) {
  const dimLines = rubric.dimensions
    .map((d) => `- ${d.id} (0-${d.max}): ${d.criteria}`)
    .join("\n");

  return `Please evaluate the following copy against each dimension of the rubric.

COPY TO EVALUATE:
"""
${copy}
"""

DIMENSIONS:
${dimLines}

Think step by step about each dimension. Then output your final scores as a single JSON block:

\`\`\`json
{"<dimension-id>": <integer score>, ...}
\`\`\``;
}

function parseAndValidateScores(responseText, rubric) {
  // Find ALL ```json blocks and take the LAST one.
  // Capture content between ```json and the closing fence, then TRIM before parsing
  // so that trailing spaces or blank lines before ``` do not cause a parse failure.
  const jsonBlockRegex = /```json\s*\n([\s\S]*?)```/g;
  let lastMatch = null;
  let m;
  while ((m = jsonBlockRegex.exec(responseText)) !== null) {
    lastMatch = m;
  }

  if (!lastMatch) {
    throw new Error(
      `Judge response contained no \`\`\`json block. Cannot parse scores. Response: ${responseText.slice(0, 200)}`
    );
  }

  let scores;
  try {
    scores = JSON.parse(lastMatch[1].trim());
  } catch (e) {
    throw new Error(`Failed to parse judge JSON block: ${e.message}. Content: ${lastMatch[1]}`);
  }

  // Validate all dimensions are present and valid
  for (const dim of rubric.dimensions) {
    if (!(dim.id in scores)) {
      throw new Error(
        `Judge response is missing dimension "${dim.id}". Got keys: ${Object.keys(scores).join(", ")}`
      );
    }

    const score = scores[dim.id];

    // Must be an integer (not float)
    if (typeof score !== "number" || !Number.isInteger(score)) {
      throw new Error(
        `Score for dimension "${dim.id}" must be an integer, got: ${score} (type: ${typeof score})`
      );
    }

    // Must be in range [0, max]
    if (score < 0 || score > dim.max) {
      throw new Error(
        `Score ${score} for dimension "${dim.id}" is out of range [0, ${dim.max}]`
      );
    }
  }

  return scores;
}

module.exports = { judge };
