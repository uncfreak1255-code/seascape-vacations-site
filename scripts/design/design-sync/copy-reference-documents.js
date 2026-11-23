// Keep the standalone design bundle's editorial references together.
// Every docs/design/*.md that DESIGN.md links to is copied to waterline/<name>.md,
// so a rule moved out of DESIGN.md (such as the phone surfaces) cannot be dropped.
// A copied doc's own links to a doc beside it (`](photo-lightbox.md)` in the catalog) are followed
// the same way, so no such link in the bundle is dead.
const fs = require("fs");
const path = require("path");

const read = (rel) => fs.readFileSync(path.resolve(__dirname, "../../..", rel), "utf8");

module.exports = function copyReferenceDocuments(copy, designMd) {
  copy("DESIGN.md", "waterline/DESIGN.md");
  const linked = new Set([...designMd.matchAll(/docs\/design\/([a-z0-9-]+\.md)/g)].map((m) => m[1]));
  if (!linked.has("cards-and-phone-surfaces.md")) throw new Error("DESIGN.md no longer links docs/design/cards-and-phone-surfaces.md; the link scan is broken");
  for (const queue = [...linked]; queue.length;) {
    for (const [, name] of read(`docs/design/${queue.pop()}`).matchAll(/\]\(([a-z0-9-]+\.md)(?:#[^)]*)?\)/g)) {
      if (!linked.has(name)) queue.push(name);
      linked.add(name);
    }
  }
  const reserved = ["DESIGN.md", "design-review-workflow.md", "design-rules.md", "writing-style-guide.md", "voice.md", "banned-patterns.md", "approved-examples.md"];
  for (const name of linked) if (reserved.includes(name)) throw new Error(`docs/design/${name} would overwrite waterline/${name}; rename one of them`);
  for (const name of [...linked].sort()) copy(`docs/design/${name}`, `waterline/${name}`);
  copy("docs/process/design-review-workflow.md", "waterline/design-review-workflow.md");
  copy("docs/agents/rules/design.md", "waterline/design-rules.md"); // design-review-workflow.md "Source Order" points here
  for (const name of ["writing-style-guide.md", "voice.md", "banned-patterns.md", "approved-examples.md"]) {
    copy(`docs/style/${name}`, `waterline/${name}`);
  }
};
