// Resolve committed asset references only. No font generation or network in builds.
const references = require('./references.json');
function fontReferences(content, outputPath) {
  if (!outputPath?.endsWith('.html')) return content;
  for (const [from, to] of Object.entries(references.urls)) content = content.replaceAll(from, to);
  content = content.replace(/<link\b[^>]*>/gi, tag =>
    /\brel=["'](?:preconnect|dns-prefetch)["']/i.test(tag) && /\bhref=["']https:\/\/fonts\.(?:googleapis|gstatic)\.com\/?["']/i.test(tag) ? '' : tag);
  return content.replace(/\bhref=(["'])(\/css\/[^"'?]+\.css)(?:\?[^"']*)?\1/g, (match, quote, file) =>
    references.css_paths.includes(file) ? `href=${quote}${file}?fonts=${references.css_revision}${quote}` : match);
}
module.exports = { fontReferences };
