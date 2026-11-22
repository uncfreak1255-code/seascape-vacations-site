# Guide look study

**Status: nonpublic study. Nothing in this folder is published or linked from the site.**

The question: what should a long-read guide look like? The test page is the
beaches guide (`src/guides/anna-maria-island-beaches.html`). The study shows it
four ways so Sawyer can answer "which one", "keep X, lose Y" or "none of these".
Tracking issue: #1036.

| View | Idea | Main move |
| --- | --- | --- |
| `control` | Today's page | Nothing changed |
| `a` Map first | Orient before reading | A drawn island map with the five beaches numbered in the opening; the comparison table moves up as a "which beach" chooser |
| `b` Photo cards | Browse by picture | One large opening photo; each beach is a card with its own photo and credit |
| `c` Fact strips | Read less | Each beach opens with a ruled Best for / Facilities / Parking strip; its paragraphs sit behind a "More about this beach" toggle |

## Look at it

    npm run build
    node docs/design/experiments/guide-look-study/serve.cjs

Open `http://127.0.0.1:8794/`. The dark bar at the top, or the left and right
arrow keys, flips between the four views. The bar is study tooling, not design.

## How it is built

No version holds a copy of the guide's words. `serve.cjs` serves the built
guide from `_site` and adds one stylesheet and one script per view
(`views/<view>/view.css` and `view.js`). The script moves the page's own
elements into a new arrangement; it never retypes them. Anything a view adds
(a toggle label, a map label, a photo credit) is named in that view's
`strings.json` with the reason.

## Check it

    node docs/design/experiments/guide-look-study/verify.cjs

`verify.cjs` starts its own server and compares each view with today's page at
1440, 393, 375 and 360 pixels wide. A view fails if it:

- drops, retypes or hides any text, even behind a closed toggle;
- adds text, a link or an image that its `strings.json` does not name;
- changes a heading's level, a link, a form field, a tracked element, the page
  title, a meta tag or a JSON-LD block;
- is wider than the screen, sets text under 12px, has a tap target under 44px,
  or adds an accessibility violation that today's page does not have.

The run first damages today's page on purpose in twelve ways (a deleted
paragraph, a hidden one, a retagged heading and so on) and fails unless the
check reports every one. `PROOF_DIR=<folder>` also writes screenshots.

## Files

- `serve.cjs`, `switcher.css`, `switcher.js`: the local server and the view bar.
- `contract.cjs`, `verify.cjs`: the copy contract and the checks.
- `views/a`, `views/b`, `views/c`: one stylesheet, script and string list each.
- `island-data.json`: the island outline and marker positions for view `a`.
- `photos/`, `photo-sources.md`: the photos in view `b`, with source, licence
  and credit for each, and the source of the map outline.
- `proof/`, `review.md`: screenshots and the review record.

## Rules this study bends on purpose

They are the question, so the versions are allowed to break them: the
type-only opening for moved guides (`docs/design/planning-guides.md`), the fixed
section order, "cards are separated by rules, not shadows" for photo cards, and
always-visible paragraphs (view `c`). Picking a version narrows Sawyer's own
2026-11-14 choice of the type-only guide frame.

Everything else holds: Waterline colors and fonts, the size and tap-target
floors, every word, link, title, meta tag and JSON-LD block, and the booking
box as it is.

## Result

Pending Sawyer's pick. It will be recorded here.
