"use strict";

const JEV_PRICE_PER_MILLION_INPUT_TOKENS = 0.042;

const AEO_SCORE_LEVELS = {
  "standalone-answer": [
    "No answer to the page's core question is present.",
    "An answer is only implied or buried and cannot stand alone.",
    "A partial answer appears, but it depends heavily on surrounding context.",
    "A clear answer appears reasonably early, with minor context needed.",
    "A self-contained answer appears near the top and is readily quotable.",
    "The first one or two substantive sentences immediately give a complete, self-contained answer.",
  ],
  "question-structure": [
    "There are no question-shaped headings or question-and-answer structure.",
    "Headings are topical labels rather than questions a traveler would ask.",
    "One question-like heading appears, but most of the page is undifferentiated prose.",
    "Several headings reflect traveler questions and lead to relevant answers.",
    "The key traveler decisions are organized as clear, natural questions with direct answers.",
    "The page consistently mirrors the exact questions travelers ask and answers each one directly.",
  ],
  "named-entity": [
    "Neither Seascape Vacations nor a specific Gulf Coast place is named.",
    "Only a generic region, unnamed operator, or vague place reference appears.",
    "Either Seascape Vacations or a specific place is clear, but not both.",
    "Seascape Vacations and a specific place both appear, but their relationship or attribution is weak.",
    "Seascape Vacations is clearly associated with a specific named place in attributable copy.",
    "The central answer is consistently attributable to Seascape Vacations and a precise named place without surrounding context.",
  ],
  "factual-density": [
    "The copy is generic and contains no useful specific facts.",
    "The copy contains an isolated detail but is dominated by generic padding.",
    "The copy has some specific facts or named places, with substantial generic material.",
    "The copy provides a useful mix of concrete facts, numbers, distances, prices, seasons, or named places.",
    "Most of the copy is specific and verifiable, with little padding.",
    "The copy is densely packed with relevant, verifiable specifics and almost no generic padding.",
  ],
  "no-fluff-intro": [
    "A generic throat-clearing introduction substantially delays the answer.",
    "A long, mostly generic introduction comes before useful substance.",
    "Some generic setup delays the answer, though useful substance eventually appears.",
    "A brief setup comes before the answer without seriously obscuring it.",
    "The opening is direct and substantive, with only minor unnecessary framing.",
    "The copy begins immediately with the substantive answer and contains no generic preamble.",
  ],
};

function buildAeoQuestions(rubric) {
  const questions = {};
  for (const dimension of rubric.dimensions) {
    const criteria = AEO_SCORE_LEVELS[dimension.id];
    if (!criteria) {
      throw new Error(`No Jev score levels defined for AEO dimension: ${dimension.id}`);
    }
    if (criteria.length !== dimension.max + 1) {
      throw new Error(`Jev score levels for ${dimension.id} must cover 0-${dimension.max}`);
    }
    questions[dimension.id] = {
      type: "score",
      instructions: `Rate \`copy\` only on the AEO dimension "${dimension.id}". ${dimension.criteria}`,
      criteria,
    };
  }
  return questions;
}

function scoresFromTypeSafeResponse(response, rubric) {
  const scores = {};
  const confidence = {};

  for (const dimension of rubric.dimensions) {
    const answer = response.answers[dimension.id];
    if (!answer || answer.type !== "score") {
      throw new Error(`TypeSafe response is missing score answer: ${dimension.id}`);
    }
    if (typeof answer.score !== "number" || answer.score < 0 || answer.score > dimension.max) {
      throw new Error(`TypeSafe score for ${dimension.id} is outside 0-${dimension.max}`);
    }
    if (typeof answer.confidence !== "number" || answer.confidence < 0 || answer.confidence > 1) {
      throw new Error(`TypeSafe confidence for ${dimension.id} is outside 0-1`);
    }
    scores[dimension.id] = answer.score;
    confidence[dimension.id] = answer.confidence;
  }

  return { scores, confidence };
}

function fixtureMatchesExpectation(fixture, overall) {
  if (fixture.expect.band === "high") return overall >= fixture.expect.minOverall;
  return overall <= fixture.expect.maxOverall;
}

function inputCostUsd(inputTokens) {
  return (inputTokens / 1_000_000) * JEV_PRICE_PER_MILLION_INPUT_TOKENS;
}

module.exports = {
  AEO_SCORE_LEVELS,
  JEV_PRICE_PER_MILLION_INPUT_TOKENS,
  buildAeoQuestions,
  fixtureMatchesExpectation,
  inputCostUsd,
  scoresFromTypeSafeResponse,
};
