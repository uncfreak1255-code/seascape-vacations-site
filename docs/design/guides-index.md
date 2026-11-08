# Guides index on Waterline

`/guides/` (`src/guides/index.njk`) is the hub that links every travel guide,
the stay collections and the owner research. In November 2026 Sawyer chose
the "frame" direction (variant A, with design-critic polish) from rendered
desktop and phone variants; the numbered "ledger" alternative was not chosen.

- Body: `guest-site guides-index`, so the whole page sits inside the F1/F2
  design floors. Styles: `src/css/guides-index.css` after `guest.css`; fonts
  come from the local Poppins partial and the Instrument Serif in `guest.css`.
- Opening: label, Instrument Serif title and 17px lede on paper. No photo
  hero; the featured story carries the first photograph.
- Stories: the featured story is a flat card with a 1px rule, a tall photo and
  a clay "Featured story" label; the two side stories are photo/text cards
  with the same rule. No shadows, no radius.
- Section heads: an ink top rule, label, title and note in two columns.
- Start here: four columns separated by rules, clay tag, serif title and a
  44px "Read this first" line. One column on phones.
- Categories: a soft (`--g-soft`) band, four ruled columns, each link a 44px
  ruled row. Stay collections: 4px chips at 44px. Local resources: ruled rows.
- Hover and press: [hover motion](hover-motion.md).
- Words, links, JSON-LD and the internal-link set are unchanged from the
  legacy page; `scripts/enforcement/internal-link-floor.test.js` guards the
  hub's links.
