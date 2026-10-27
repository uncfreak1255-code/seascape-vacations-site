const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..", "..");
function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

test("Bradenton comparison FAQ schema matches the visible questions and answers", () => {
  const source = read("src/guides/bradenton-vs-sarasota.html");
  const { extractReaderCopy } = require("../evals/lib/extract-copy");
  const plain = (value) => extractReaderCopy(value)
    .replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  const section = source.match(/<section id="faq"[^>]*>([\s\S]*?)<\/section>/);
  assert.ok(section, "the comparison needs a visible FAQ section");
  const visible = [...section[1].matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>\s*<p\b[^>]*>([\s\S]*?)<\/p>/g)]
    .map((match) => ({ question: plain(match[1]), answer: plain(match[2]) }));
  assert.ok(visible.length > 0, "FAQ questions must have visible answers");
  const faq = [...source.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1])).find((value) => value["@type"] === "FAQPage");
  assert.ok(faq, "the comparison needs FAQPage data");
  const structured = faq.mainEntity.map((entry) => ({
    question: plain(entry.name), answer: plain(entry.acceptedAnswer.text)
  }));
  assert.deepEqual(structured, visible, "search engines and readers must receive the same FAQ");
});
