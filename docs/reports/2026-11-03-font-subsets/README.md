# Web-font byte reduction and rendering proof — 2026-11-03

The verified candidate reduces cold-page font payloads while retaining the
original rendered appearance in Mac Chromium 156.0.8078.4. This is source/local
proof; publication and production readback are separate.

Baseline content: `96094344` (#862), with deterministic availability fixtures.
Final implementation proof: committed source `7f96c3a5` (followed only by this
report/evidence and measured CSS-byte baseline updates).
The candidate also incorporates `3e6b8eea` (#863), which changes design docs only.
No public copy, fallback family, font-display, weight synthesis or CJK font is
changed. Font generation is manual and its outputs are committed. Normal builds
only resolve committed asset references and concatenate the existing CSS.

## Font inventory and output

All numbers below are WOFF2 body bytes, excluding HTTP headers. Core is the
ordinary-page request. Extended is an additional request only when needed.

| Previously served local font | Before | Core after | Extended after |
|---|---:|---:|---:|
| instrument-serif-italic.woff2 | 21,140 | 13,484 | 1,608 |
| instrument-serif.woff2 | 19,976 | 12,824 | 1,580 |
| playfair-display-latin.woff2 | 38,460 | 34,184 | 0 |
| poppins-400-latin.woff2 | 7,900 | 7,664 | 0 |
| poppins-500-latin.woff2 | 7,740 | 7,556 | 0 |
| poppins-600-latin.woff2 | 7,992 | 7,740 | 0 |
| poppins-700-latin.woff2 | 7,848 | 7,604 | 0 |

The seven original Latin files total 111,056 bytes. Their new ordinary Latin
cores total 91,056 bytes (18.0% less); loading both Instrument extensions would
add 3,188 bytes. Cached original URLs remain byte-for-byte intact; new files
have content-hashed URLs. This increases repository/disk storage, not cold-page
font payload. Two unserved Instrument TTF files remain unchanged.

[fonts.csv](fonts.csv) contains every retained input's before/after bytes,
glyph count, variable axes, GSUB/GPOS features, hint tables and hinted-glyph count,
including existing provider fallback sources and unserved TTFs. Full cmap
coverage is in `scripts/fonts/original-inventory.json` and `manifest.json`.
Original provider URLs, hashes and declaration order are frozen in
`upstream.json` and `original-styles/`.

Existing provider extensions are local, demand-loaded and smaller:
Playfair Latin-A 20,980 → 15,904; Poppins 400/500/600/700 respectively
5,640 → 4,448 / 5,496 → 4,340 / 5,552 → 4,440 / 5,448 → 4,316;
Instrument normal 7,828 → 7,532 and italic 8,444 → 8,000.
Two Playfair mark/Latin-A layers labelled Cyrillic/Vietnamese become
21,144 → 1,800 and 9,056 → 4,104. Two distinct Instrument Latin compatibility
builds remain exactly 15,040 and 15,684 bytes and were not requested by any of
the 164 real pages.

## What the site uses

The source inspection includes stylesheets, inline styles, component overrides,
CSS-generated text and built/JavaScript text. [usage.json](usage.json) lists observed character ranges and font settings
for every computed family. The browser audit records computed
families, weight, style, variation/features, variants, kerning, optical sizing,
hyphenation and characters on all 164 routes. The generator conservatively
keeps supported source characters, Latin-1, Latin Extended-A and canonical
combining marks. Missing nominal Latin-A glyphs retain their original fallback
or canonical-decomposition behavior; fuller TTFs do not introduce new shapes.

- Poppins needs 400, 500, 600 and 700. Existing 800/900 requests synthesize from
  700; this is retained. Instrument is 400 normal/italic with existing synthetic
  weight overrides (including bold within italic). Playfair CSS advertises
  400–700; a one-off 300 request clamps to 400 as before.
- There are no production font-variation-settings/font-feature-settings
  overrides, custom variants or automatic hyphenation. The probes deliberately
  exercise automatic hyphenation and U+2010. The missing U+2010 maps explicitly
  to the existing hyphen glyph to preserve browser behavior across partitions.
- Retained default shaping features are calt/ccmp/liga/locl/rlig/kern/mark/mkmk,
  where present. Optional Playfair dnom/frac/lnum/numr are removed. Processed
  fonts drop glyph instructions and fpgm/prep/cvt tables; gasp raster-policy
  metadata remains to preserve smoothing behavior; the byte-identical compatibility builds retain metadata.
- CJK glyphs are not added to any web font and continue using system fallback.
  Playfair's Reserved Font Name is renamed internally to
  `Seascape Display Subset`; CSS keeps the existing external family alias.

## Page bytes and preloads

[pages.csv](pages.csv) lists **all 164 routes**, before/after font bytes, savings,
preload-set IDs, text equality and extension requests.
[preloads.json](preloads.json) expands every preload-set ID to actual URLs.
Cold navigation uses a fresh browser context per page, desktop 1440 × 1000.
These are payload measurements, not a claim about measured LCP or revenue.

| Page | Before | After | Saved |
|---|---:|---:|---:|
| Home | 56,756 | 41,528 | 15,228 (26.8%) |
| Property catalog | 64,748 | 49,268 | 15,480 (23.9%) |
| Coastal Stay | 35,616 | 28,044 | 7,572 (21.3%) |
| Owner management hub | 56,756 | 41,528 | 15,228 (26.8%) |
| AMI vacation cost guide | 64,748 | 49,268 | 15,480 (23.9%) |
| Best restaurants guide | 89,916 | 77,572 | 12,344 (13.7%) |
| Bradenton/Sarasota beaches | 89,916 | 77,572 | 12,344 (13.7%) |

The sum of 164 independent cold navigations is 11,005,996 → 9,290,692 bytes,
a 1,715,304-byte (15.6%) reduction; this sum is not a cached multi-page journey.
All 164 rendered text hashes match. Every route has identical computed text-font settings and characters, with
unchanged preload counts. No real route requests an extended font or
remote font after optimization. [demand-loading.json](demand-loading.json)
proves zero extended requests on ASCII-only probes, then exactly the expected
Poppins/Playfair files for Ł and Instrument normal/italic files for £.

Existing preload choices are preserved and target the new core URLs. Legacy
pages that did not preload fonts keep that behavior; no extended file is
preloaded. No core embedding, idle precaching or new preload planner is added.

## Pixel proof

[pixels.json](pixels.json): 17 routes × 2 viewports (1440 and 393 CSS pixels),
DPR 1, macOS, Chromium 156.0.8078.4, frozen clock 2026-11-03T20:00:00Z and
fixed availability fixtures. All 34 comparisons have equal text, equal text-node
rectangles in document coordinates, equal image dimensions and **0 changed pixels / 199,785,349 pixels**.
Every RGB channel is compared exactly, with no tolerance or baseline update.

Coverage includes home/catalog/property/owner components, a generated owner
page, old and new guide styles, accented restaurant content, chart/code
content, and two unpublished synthetic probes. The probes cover Latin-1/A,
all requested weights, italics and bold italics, native hyphens, symbols and
CJK. Screenshots and visual diff images are in the task's external font-proof
artifact directory. Representative homepage captures are committed here:
[desktop before](screenshots/home-1440-before.png),
[desktop after](screenshots/home-1440-after.png),
[desktop diff](screenshots/home-1440-diff.png),
[phone before](screenshots/home-393-before.png),
[phone after](screenshots/home-393-after.png),
[phone diff](screenshots/home-393-diff.png). Mac Chromium proof does not establish identical hinting or
rasterization on Windows, Safari or Firefox; those platforms were not tested.

No visible difference is accepted as harmless rounding. Rejected font trials
changed glyph rasterization and were reverted. Earlier invalid comparisons
included changing availability content, unsettled scroll observers, and a
concurrent build deleting the directory being read; those are fixture/run
failures, not accepted rendering evidence. The final proof uses a fixed built
snapshot with the same content on both sides.

## Deliberate deviations and their byte cost

1. Instrument's cores contain all Latin letters linked by kerning, rather than
   ASCII-only cores. Splitting accented shaping runs changes rendering. Only
   unused punctuation/currency is moved out. This is still smaller than whole
   optimized Instrument files: normal core saves another 756 bytes, italic 740.
2. Poppins stays one optimized Latin file per weight. The rejected split saves
   1,024/1,016/1,016/1,004 core bytes (400/500/600/700), but changes symbol edges;
   core+extended would actually add 900/872/884/852 total bytes. Existing Latin-A
   fallback files remain separate only on routes that already had that layer.
3. Playfair stays one Latin file; separating its down-arrow changed 45 pixels.
   Internal wght 400–900 remains because narrowing to 400–700 changes intermediate
   rendering. The rejected narrower-axis file saves 1,492 bytes (34,184 → 32,692).
   Its CSS range stays 400–700. [rejected-sizes.json](rejected-sizes.json) records
   the isolated candidates; none is published.
4. Glyph names, global metrics/bounds, name metadata and .notdef outlines stay
   where stripping them changed rasterization. No separate trustworthy byte
   attribution exists for each metadata component; those rejected trials are
   not presented as safe independent savings.
5. New partitions declare only their actual cmap. Provider ranges also intersect
   the old eligibility ranges, so a fallback face cannot steal base characters.
   Four existing Instrument provider eligibility ranges stay verbatim: tightening
   them changes 215 rare-accent pixels, with **zero WOFF2-byte saving**. Existing
   owner inline unsplit faces retain their original unrestricted matching/source
   timestamps. No broad generated fallback is inserted between a paired split.
6. The gasp smoothing/grid-fit policy is retained separately from removed glyph
   hint instructions. In an isolated recompression, removing it saves 84 bytes across the ordinary
   Instrument/Playfair cores and 36 bytes across all processed parts, while
   changing the original raster-policy metadata. [gasp-cost.json](gasp-cost.json) records the per-file costs.
7. Existing preload choices are preserved rather than preloading every core
   on every route. A broader generated per-page planner was rejected by automatic
   approval review as a loading-behavior expansion. This costs no font payload
   bytes on the audited pages; its latency benefit has not been measured.

## Rerun and delivery

Follow [the manual workflow](../../process/web-fonts.md). Rerun after changing
font inputs, supported text/languages, CSS/component font settings, weights,
features, variation axes, hyphenation or tool versions. Commit output and
re-prove it against same-content baseline. Do not put the generator in the build.

The native screenshot fixture preserves its original Google-stylesheet failure
condition for the equivalent localized provider CSS URLs. This avoids accepting
new baselines that compare real fonts with system fallback. The separate
frozen-original comparisons test actual fonts. No screenshot baseline changes.

Local verification: `verify:release`, `guardrail-merge-check`, recovery
remediation and the generated-font test passed. The 630-test native visual run
had 583 passes, 37 existing skips and 10 failures (provider fixture plus the
concurrent-build disruption); all 10 passed on the final `test:visual --
--last-failed` rerun. All affected screenshot/design-floor assertions were also
rerun: 262 passed, 34 existing skips. No visual baseline was changed. Manual
regeneration was byte-identical, including output hashes. Font binary inspection
confirmed exact cmap partitions, axes, glyph hints, CJK exclusion and Playfair
family/instance renaming. The pre-PR fresh-context bug review had no findings.
Current-head CI/review and publication status belong to the PR delivery readback.

## CSS metadata cost and performance gate

The exact core/extended font-face declarations add **995 uncompressed CSS bytes**
to guest.css on each of the eight budgeted routes. The stylesheet outside
font-face declarations/comments is byte-identical. The homepage therefore saves
14,233 uncompressed font-plus-CSS bytes after this cost (15,228 fewer font bytes
minus 995 metadata bytes). Other guide stylesheets gain 453–459 declaration
bytes; the page table deliberately reports font bytes rather than hiding CSS
inside those figures.

The initial CI performance job passed Lighthouse assertions on all eight routes
and failed only the separate CSS byte ratchet. Its measured reports reproduced
the ratchet failure locally. The existing reasoned-update flow records exactly
the 995-byte delta, with all script baselines and Lighthouse timing/transfer
ceilings unchanged; the same reports then pass the strict ratchet. Future
unrecorded CSS growth still fails. [lighthouse.json](lighthouse.json) records
the 24 runs: the existing aggregation passes, but one first-homepage run exceeded
individual LCP/TBT ceilings. No before/after LCP improvement is claimed.
