// Reader-visible text of one seoPages.json entry: every string a reader can
// see, skipping URL-like fields and URL values. The vendor-name, compliance and
// performance-claim guards all scan this text. Change the field list here, and
// every guard picks up the change (site #1077).
const NON_READER_SEO_FIELDS = new Set([
  "slug",
  "canonical",
  "image",
  "ogImage",
  "url",
  "ctaPath",
  "benchmarkUrl",
  "sourceUrl"
]);

function readerVisibleSeoText(entry) {
  const parts = [];
  const walk = (key, value) => {
    if (typeof value === "string") {
      if (NON_READER_SEO_FIELDS.has(key)) return;
      if (/^(https?:)?\/\//i.test(value.trim())) return;
      parts.push(value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => walk(key, item));
      return;
    }
    if (value && typeof value === "object") {
      for (const [childKey, childValue] of Object.entries(value)) {
        walk(childKey, childValue);
      }
    }
  };
  walk("", entry);
  return parts.join("\n");
}

module.exports = { NON_READER_SEO_FIELDS, readerVisibleSeoText };
