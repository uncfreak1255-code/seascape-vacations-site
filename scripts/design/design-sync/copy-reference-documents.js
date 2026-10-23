// Keep the standalone design bundle's editorial references together.
module.exports = function copyReferenceDocuments(copy) {
  copy("DESIGN.md", "waterline/DESIGN.md");
  copy("docs/design/legacy-gold-ctas.md", "waterline/legacy-gold-ctas.md"); // DESIGN.md "Legacy gold CTAs" points here
  copy("docs/process/design-review-workflow.md", "waterline/design-review-workflow.md");
  for (const name of ["writing-style-guide.md", "voice.md", "banned-patterns.md", "approved-examples.md"]) {
    copy(`docs/style/${name}`, `waterline/${name}`);
  }
};
