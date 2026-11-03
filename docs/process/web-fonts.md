# Manual web-font optimization

The fonts are committed build inputs. The Site build never runs FontTools,
subsets a font, hashes a font, downloads a font, or installs Python dependencies.
It only resolves committed HTML asset references from `references.json`, leaving
page source timestamps unchanged, and versions the existing font-bearing CSS URLs. Its existing
CSS assembly concatenates `guest-fonts.css`, `guest.css` and `motion.css` into
the same public `/css/guest.css` request. Design Sync reads the committed
manifest and copies the same fonts; it does not regenerate them.

Run from a guarded Site task worktree. Preserve a baseline **before** changing
fonts, styles or content. Use the same source/content revision, availability
fixture, browser, viewport, scale and clock on both sides. The scripts block
non-font external traffic and freeze upstream font responses for repeatability;
they do not submit forms, navigate checkout or emit analytics.

```bash
npm ci --legacy-peer-deps
SEASCAPE_VISUAL_TEST=1 npm run build
# Copy this baseline outside the worktree, or build the same base in a second worktree.
cp -R _site /private/tmp/seascape-font-baseline
python3 -m venv /private/tmp/seascape-font-tools
/private/tmp/seascape-font-tools/bin/pip install -r scripts/fonts/requirements.txt
node scripts/fonts/audit.js /private/tmp/seascape-font-baseline /private/tmp/fonts-before.json /private/tmp/font-responses
/private/tmp/seascape-font-tools/bin/python -B scripts/fonts/subset.py
SEASCAPE_VISUAL_TEST=1 npm run build
node scripts/fonts/audit.js _site /private/tmp/fonts-after.json /private/tmp/font-responses
node scripts/fonts/compare.js /private/tmp/seascape-font-baseline _site /private/tmp/font-pixels /private/tmp/font-responses
node --test scripts/enforcement/font-subsets.test.js
```

Use an empty baseline destination. `--legacy-peer-deps` matches the existing
lockfile; plain `npm ci` currently fails resolving optional peer dependencies.
That dependency issue is separate from font generation. No package or lockfile
change is needed for these scripts.

Commit the generated WOFF2 files, CSS/templates, `manifest.json` and
`original-inventory.json`. Keep the raw page audits, frozen responses and
screenshots outside the worktree. Publish a concise report with the per-page
before/after bytes, preload lists and exact pixel results. Run the repository's
normal release checks too. Do not update visual baselines to accept a font
regression.

## When to rerun

Rerun the audit and manual generator after changing font sources, page text,
JavaScript-generated text, CSS `content`, inline/component typography, weights,
axis settings, feature/variant settings, language, hyphenation, or font-face
ordering. Recheck mobile overrides, native bold inside italics and user-entered
text. Preserve existing `font-display`, fallback families and synthesis. A new
weight/feature is a reason to reevaluate the retained source, not to silently
clamp or synthesize it differently. New Cyrillic/Greek/Vietnamese content needs
new source/coverage review; CJK remains system-rendered. Changing FontTools or
Brotli versions requires new binary inspection and pixel proof.

Immutable inputs are in `scripts/fonts/originals/` (the seven previously served
Latin WOFF2 files) and `extended-originals/` (the existing Google Fonts Latin
Extended-A layer). `original-styles/` freezes the eight former Google stylesheet
responses. `upstream.json` records their URLs, byte-equivalent Latin mappings,
and extension/compatibility hashes. These are offline inputs to the generator; it performs
no network access. The license notices remain beside public font assets.

## Rendering decisions

Appearance outranks the smallest byte count. The default intentionally does
not implement every aggressive optimization:

- Instrument Serif regular and italic use core/extended pairs. Their cores
  include Latin letters connected by kerning, rather than splitting those
  shaping runs at accented letters. Extended punctuation/currency remains
  demand-loaded. Core and extended URLs include content hashes. Existing preload choices are preserved and their links resolve
  to the smaller core files. Legacy pages with no preloads keep that behavior. Original immutable URLs retain their original bytes
  for cached stylesheets; generation never deletes previously published assets.
- Poppins remains one optimized Latin file per weight. Splitting it introduced
  symbol raster changes in the probe. Playfair also remains one Latin file;
  even isolating its down-arrow changed those pixels. Its original 400–900
  internal axis is retained because limiting it to 400–700 changed intermediate
  weight rasterization. The CSS still advertises exactly its original 400–700.
- Existing upstream Latin Extended-A faces remain a separate, local coverage
  layer only on pages which formerly requested them. They are not inserted
  globally: doing so would replace existing system fallback on other pages.
  Unused Inter and Poppins 300 declarations are removed. Characters and marks
  needed by Latin-A are also retained from the Vietnamese- and Cyrillic-labelled
  Playfair subsets; provider labels are not a reliable coverage boundary. No source rule uses Inter; computed Poppins use
  needs 400/500/600/700, including 800/900 synthesis through 700.
- All supported Latin-1/Extended-A characters survive. Canonical decomposition
  marks also survive: a precomposed character can render through a base letter
  and mark even when its nominal cmap entry is missing. No fuller TTF is used
  to add new Latin glyphs to pages which formerly fell back.
- U+2010 gets an explicit mapping to the font's existing hyphen glyph, matching
  the browser's former missing-hyphen behavior. Otherwise a strict unicode
  partition can change automatic-hyphen rendering. The probe exercises both
  `hyphens:auto` and explicit U+2010; production CSS currently enables neither
  custom axis/features nor automatic hyphenation.
- Default Latin shaping features remain (`calt`, `ccmp`, `liga`, `locl`, `rlig`,
  `kern`, `mark`, `mkmk`, where present). Optional Playfair fractions and lining
  numerals are not enabled by the corpus and are removed. Glyph hint instructions and the fpgm/prep/cvt tables are dropped from processed files. The original gasp smoothing/grid-fit policy remains. Two
  distinct upstream Instrument Latin compatibility builds retain their exact
  original bytes and declaration order; their payload was zero on all audited
  real routes, and replacing their build identity is not necessary for those savings. Glyph names, original global metrics/bounds,
  naming metadata and `.notdef` outlines remain because aggressive stripping
  changed rasterization. CSS fallback families and font-display are unchanged.
- Playfair's OFL Reserved Font Name is replaced in internal name records by
  `Seascape Display Subset`; the existing CSS family is an alias. Copyright and
  OFL notices are retained. The other font notices declare no reserved name.

`--split-poppins` and `--limit-weight` generate comparison candidates that have
known rendering changes. Use them only in an isolated experiment, record the
savings and diffs, and restore the default output. They are not approved for
publication. Core embedding and idle precaching were not implemented.

## Proof and tool quirks

The generator verifies reopened cmap contents and axes and records glyphs,
features and hinting. It removes FontTools' extra bidi mirror cmap entries from
each partition, fills missing invariant `gvar` entries after experimental
instancing, and preserves canonical decomposition coverage. New partition ranges list only actual cmap entries. Provider ranges are
intersected with both actual cmap coverage and the original declaration, so a
subset cannot steal characters from another original layer. Four existing
Instrument provider eligibility ranges are retained verbatim: tightening them
changes 215 rare-accent pixels in the probe, with no WOFF2-byte saving. This is
an explicit compatibility exception to exact cmap-only ranges. Existing unsplit
owner inline faces also keep their original unrestricted matching. No broad
fallback face is inserted between paired partitions.

`compare.js` compares every RGB channel with **zero** pixel tolerance, checks
text and text-node rectangles, then tests zero extended requests for an
ASCII-only provider document and explicit demand-loading for Poppins/Playfair Ł.
The synthetic pages cover code, all Latin-1/Extended-A characters, every retained
weight, bold inside italics, CJK, native hyphenation and upstream coverage.
Real pages include legacy/component font overrides and accented content.
Screenshots disable motion and settle scroll observers before comparison.

The committed `font-subsets.test.js` checks output sizes against the manifest,
font-face ranges and the absence of extended preloads. It was observed red
against the original built site and green against the generated site. It does
not process fonts or require FontTools in the build/CI environment.

Pixel proof is specific to the tested browser/OS. Record the engine version;
do not describe Mac Chromium evidence as Windows, Firefox or Safari proof.
For a release with exact appearance requirements on another platform, run the
same comparison there before making that broader claim.

FontTools reference: https://fonttools.readthedocs.io/en/latest/subset/
Variable-font reference: https://fonttools.readthedocs.io/en/latest/varLib/instancer.html

The native screenshot suite originally blocked all Google Fonts. Its fixture
continues to block the eight equivalent localized provider stylesheet paths,
so stored screenshots retain the same network conditions. Do not mistake this
fixture for proof of actual web fonts: the frozen-original `compare.js` run is
the real-font appearance gate. Neither that fixture nor a screenshot baseline
update may replace the real-font before/after proof.
