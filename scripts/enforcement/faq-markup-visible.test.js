// FAQPage markup must mark up only what the page shows (site #1016).
// Reads the built _site/ (run `npm run build` first): every Question name and
// acceptedAnswer text in a guide's FAQPage JSON-LD must appear in the page's
// visible text, outside elements marked `hidden` or aria-hidden="true". Guides
// outside this check are listed in EXCLUDED with why. It replaces
// faq-markup-parity.test.js (the 13 guides whose hidden FAQ markup was dropped in
// PR #1067): FAQPage may come back on one of them only for questions it shows.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const guidesDir = path.join(root, '_site/guides');

const EXCLUDED = {
  'anna-maria-island-weather': 'held guide (AGENTS.md)',
  'best-time-visit-anna-maria-island': 'held guide (AGENTS.md)',
  'anna-maria-island-vs-siesta-key': 'held guide (AGENTS.md)',
  'shelling-guide-florida': 'held guide (AGENTS.md)',
  'pet-friendly-anna-maria-island': 'tied up in #1024, #1025 and PR #1065',
  'sarasota-area-guide': 'settle window to 2026-12-17 (page ledger)',
  'anna-maria-island-beaches': 'settle window to 2026-12-22 (page ledger)',
};

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—', ndash: '–', rsquo: "'", lsquo: "'", ldquo: '"', rdquo: '"', hellip: '…', deg: '°' };
function decode(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => (n.toLowerCase() in ENTITIES ? ENTITIES[n.toLowerCase()] : m));
}
function norm(s) {
  return s.normalize('NFKC').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[‐-―−]/g, '-').replace(/\s+/g, ' ').replace(/ ([.,;:!?)])/g, '$1').trim().toLowerCase();
}
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
// Drop elements a reader cannot see: the `hidden` attribute or aria-hidden="true",
// with everything inside them (same-name tags are counted to find the matching close).
function stripHidden(html) {
  let out = '';
  let skip = null;
  let depth = 0;
  let last = 0;
  for (const m of html.matchAll(/<(\/?)([a-z][a-z0-9-]*)\b([^>]*)>/gi)) {
    const [tag, closing, rawName, attrs] = m;
    const name = rawName.toLowerCase();
    if (skip) {
      if (name === skip && !VOID.has(name) && !attrs.endsWith('/')) depth += closing ? -1 : 1;
      if (depth === 0) { skip = null; last = m.index + tag.length; }
      continue;
    }
    if (!closing && !VOID.has(name) && /\s(hidden(?=[\s=>/]|$)|aria-hidden=["']true["'])/i.test(attrs)) {
      out += html.slice(last, m.index) + ' ';
      skip = name;
      depth = 1;
    }
  }
  return skip ? out : out + html.slice(last);
}
function visibleText(html) {
  const body = html.replace(/<head[\s\S]*?<\/head>/i, ' ').replace(/<(script|style|noscript|template)[\s\S]*?<\/\1>/gi, ' ');
  return norm(decode(stripHidden(body).replace(/<[^>]+>/g, ' ')));
}
function isFaqPage(node) {
  const type = node['@type'];
  return Array.isArray(type) ? type.includes('FAQPage') : type === 'FAQPage';
}
// Walk the whole JSON-LD tree: FAQPage can sit at the top, in @graph, or nested
// (for example as an Article's mainEntity).
function collectFaqPages(node, out) {
  if (Array.isArray(node)) { for (const item of node) collectFaqPages(item, out); return; }
  if (!node || typeof node !== 'object') return;
  if (isFaqPage(node)) out.push(node);
  for (const value of Object.values(node)) collectFaqPages(value, out);
}
function faqPages(html) {
  const blocks = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  // Some guides build JSON-LD in an inline script as `const schemaData = {...};`
  // (a JavaScript object literal: drop trailing commas before parsing it as JSON).
  for (const m of html.matchAll(/const schemaData = (\{[\s\S]*?\});\s*\n/g)) blocks.push(m[1].replace(/,(\s*[}\]])/g, '$1'));
  const pages = [];
  for (const raw of blocks) collectFaqPages(JSON.parse(raw), pages);
  return pages;
}
function faqQuestions(html) {
  return faqPages(html).flatMap(page => [].concat(page.mainEntity || []).map(q => ({ name: q.name, answer: (q.acceptedAnswer || {}).text || '' })));
}
// The marked-up answer must be the text that starts right after one visible copy of its question.
function answerFollowsQuestion(text, name, answer) {
  for (let i = text.indexOf(name); i !== -1; i = text.indexOf(name, i + 1)) {
    if (text.slice(i + name.length).trimStart().startsWith(answer)) return true;
  }
  return false;
}

const routes = fs.existsSync(guidesDir)
  ? fs.readdirSync(guidesDir, { withFileTypes: true })
      .filter(d => d.isDirectory() && fs.existsSync(path.join(guidesDir, d.name, 'index.html')))
      .map(d => d.name)
  : [];

test('built guides exist (run npm run build first)', () => {
  assert.ok(routes.length > 20, `expected built guides under ${guidesDir}`);
});

for (const route of routes) {
  if (route in EXCLUDED) continue;
  test(`${route}: every FAQPage question and answer is visible on the page`, () => {
    const html = fs.readFileSync(path.join(guidesDir, route, 'index.html'), 'utf8');
    const text = visibleText(html);
    // Markup this test cannot parse must fail, not pass unchecked.
    const mentions = (html.match(/"@type"\s*:\s*(?:\[[^\]]*)?"FAQPage"/g) || []).length;
    assert.equal(faqPages(html).length, mentions, 'every FAQPage in the page source is parsed');
    for (const q of faqQuestions(html)) {
      assert.ok(text.includes(norm(q.name)), `question not visible: ${q.name}`);
      assert.ok(answerFollowsQuestion(text, norm(q.name), norm(q.answer)), `marked-up answer is not the visible text under: ${q.name}`);
    }
  });
}
