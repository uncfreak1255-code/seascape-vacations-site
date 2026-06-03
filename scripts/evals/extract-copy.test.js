const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const { extractReaderCopy } = require(path.resolve(__dirname, "lib/extract-copy.js"));

test("extractReaderCopy: strips YAML frontmatter", () => {
  const raw = `---
title: "Hello"
layout: base.njk
---
This is the body.`;
  const result = extractReaderCopy(raw, { type: "njk" });
  assert.ok(!result.includes("title:"), "should strip frontmatter key");
  assert.ok(!result.includes("layout:"), "should strip layout key");
  assert.ok(result.includes("This is the body."), "should keep body text");
});

test("extractReaderCopy: strips Nunjucks tags", () => {
  const raw = `{% extends "base.njk" %}{% block content %}
Hello world
{% endblock %}`;
  const result = extractReaderCopy(raw, { type: "njk" });
  assert.ok(!result.includes("{%"), "should remove {% tags");
  assert.ok(!result.includes("%}"), "should remove %} tags");
  assert.ok(result.includes("Hello world"), "should keep text content");
});

test("extractReaderCopy: strips Nunjucks variable expressions", () => {
  const raw = `The name is {{ property.name }} and it rocks.`;
  const result = extractReaderCopy(raw, { type: "njk" });
  assert.ok(!result.includes("{{"), "should remove {{ expressions");
  assert.ok(result.includes("The name is"), "should keep surrounding text");
  assert.ok(result.includes("and it rocks."), "should keep text after expression");
});

test("extractReaderCopy: strips script and style blocks", () => {
  const raw = `<p>Good copy here.</p>
<script>
  var x = 1;
  console.log("secret");
</script>
<style>
  body { color: red; }
</style>
<p>More copy.</p>`;
  const result = extractReaderCopy(raw, { type: "html" });
  assert.ok(!result.includes("var x"), "should strip script content");
  assert.ok(!result.includes("console.log"), "should strip script content");
  assert.ok(!result.includes("body { color"), "should strip style content");
  assert.ok(result.includes("Good copy here."), "should keep paragraph text");
  assert.ok(result.includes("More copy."), "should keep second paragraph");
});

test("extractReaderCopy: strips HTML tags", () => {
  const raw = `<h1>Main Title</h1><p class="intro">Some text here.</p>`;
  const result = extractReaderCopy(raw, { type: "html" });
  assert.ok(!result.includes("<h1>"), "should strip h1 tag");
  assert.ok(!result.includes("<p"), "should strip p tag");
  assert.ok(result.includes("Main Title"), "should keep heading text");
  assert.ok(result.includes("Some text here."), "should keep paragraph text");
});

test("extractReaderCopy: strips HTML comments", () => {
  const raw = `<p>Real content.</p><!-- This is a comment --><p>More real.</p>`;
  const result = extractReaderCopy(raw, { type: "html" });
  assert.ok(!result.includes("This is a comment"), "should strip HTML comment content");
  assert.ok(result.includes("Real content."), "should keep real copy");
  assert.ok(result.includes("More real."), "should keep second paragraph text");
});

test("extractReaderCopy: collapses whitespace to single spaces and trims", () => {
  const raw = `<p>  Hello   world  </p>

  <p>  Another   line  </p>  `;
  const result = extractReaderCopy(raw, { type: "html" });
  assert.ok(!result.match(/\s{2,}/), "should collapse multiple whitespace");
  assert.equal(result, result.trim(), "should be trimmed");
});

test("extractReaderCopy: handles empty input gracefully", () => {
  const result = extractReaderCopy("", { type: "njk" });
  assert.equal(result, "");
});

test("extractReaderCopy: handles frontmatter-only input", () => {
  const raw = `---
title: Hello
---`;
  const result = extractReaderCopy(raw, { type: "njk" });
  assert.equal(result, "");
});

test("extractReaderCopy: handles complex mixed njk template", () => {
  const raw = `---
title: "Dock Homes on Lake Norman"
layout: base.njk
---
{% extends "base.njk" %}
{% block content %}
<h1>{{ page.title }}</h1>
<p>Rent a real dock home on Lake Norman. No gimmicks.</p>
<!-- SEO note: keep this above fold -->
<script>
  trackPageView();
</script>
{% endblock %}`;
  const result = extractReaderCopy(raw, { type: "njk" });
  assert.ok(result.includes("Rent a real dock home on Lake Norman."), "should keep body copy");
  assert.ok(!result.includes("trackPageView"), "should strip script");
  assert.ok(!result.includes("SEO note"), "should strip comment");
  assert.ok(!result.includes("{%"), "should strip block tags");
  assert.ok(!result.includes("{{"), "should strip var expressions");
});

// Fix 1: frontmatter regex must not eat mid-document ---
test("extractReaderCopy: mid-body horizontal rules (---) are NOT stripped", () => {
  const raw = `Some intro text here.

---

Some section text.

---

More body text at the end.`;
  const result = extractReaderCopy(raw, { type: "md" });
  assert.ok(result.includes("Some intro text here."), "should keep intro text");
  assert.ok(result.includes("Some section text."), "should keep section text");
  assert.ok(result.includes("More body text at the end."), "should keep trailing text");
});

test("extractReaderCopy: genuine leading frontmatter is stripped but mid-body --- is kept", () => {
  const raw = `---
title: Test Page
layout: base.njk
---
This is the body.

---

After the horizontal rule.`;
  const result = extractReaderCopy(raw, { type: "md" });
  assert.ok(!result.includes("title:"), "should strip frontmatter key");
  assert.ok(!result.includes("layout:"), "should strip layout key");
  assert.ok(result.includes("This is the body."), "should keep body text");
  assert.ok(result.includes("After the horizontal rule."), "should keep text after mid-body ---");
});
