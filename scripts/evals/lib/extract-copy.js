"use strict";

/**
 * extractReaderCopy(raw, {type}) -> plain reader text
 *
 * Strips:
 * - YAML frontmatter (between leading --- lines)
 * - Nunjucks/Liquid tags {%...%} and {{...}}
 * - <script> and <style> blocks and their contents
 * - All remaining HTML tags
 * - HTML comments
 * - Collapses whitespace to single spaces and trims
 */
function extractReaderCopy(raw, { type } = {}) {
  if (!raw || typeof raw !== "string") return "";

  let text = raw;

  // Strip YAML frontmatter: only when the document STARTS with ---
  // Anchored to string start (no /m flag), so mid-doc --- blocks are not eaten.
  text = text.replace(/^---\r?\n[\s\S]*?\r?\n---[ \t]*\r?\n?/, "");

  // Strip <script>...</script> blocks (case-insensitive, multiline)
  text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");

  // Strip <style>...</style> blocks
  text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");

  // Strip HTML comments <!-- ... -->
  text = text.replace(/<!--[\s\S]*?-->/g, "");

  // Strip Nunjucks/Liquid tags {%...%}
  text = text.replace(/\{%[\s\S]*?%\}/g, "");

  // Strip Nunjucks/Liquid expressions {{...}}
  text = text.replace(/\{\{[\s\S]*?\}\}/g, "");

  // Strip remaining HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // Collapse whitespace (spaces, tabs, newlines) to single spaces
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

module.exports = { extractReaderCopy };
