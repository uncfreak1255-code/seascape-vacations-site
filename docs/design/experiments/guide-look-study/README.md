# Guide look study

**Status: nonpublic study. Nothing in this folder is published or linked from the site.**

The question: what should a long-read guide look like? The test page is the
beaches guide (`src/guides/anna-maria-island-beaches.html`). The study showed it
four ways (`control`, `a`, `b`, `c`) so Sawyer could answer "which one", "keep X,
lose Y" or "none of these". He picked the map and then its toggle, so view `d`
draws that pick as one page. Tracking issues: #1036 (the study, closed) and
#1040 (view `d` and the Stage 2 spec).

| View | Idea | Main move |
| --- | --- | --- |
| `control` | Today's page | Nothing changed |
| `a` Map first | Orient before reading | A drawn island map with the five beaches numbered in the opening; the comparison table moves up as a "which beach" chooser |
| `b` Photo cards | Browse by picture | One large opening photo; each beach is a card with its own photo and credit |
| `c` Fact strips | Read less | Each beach opens with a ruled Best for / Facilities / Parking strip; its paragraphs sit behind a "More about this beach" toggle |
| `d` Map with toggle | The pick | View `a`, with each beach's paragraphs behind view `c`'s "More about this beach" toggle, under its map panel |

## Look at it

    npm run build
    node docs/design/experiments/guide-look-study/serve.cjs

Open `http://127.0.0.1:8794/`. The dark bar at the top, or the left and right
arrow keys, flips between the five views. The bar is study tooling, not design.

## How it is built

No version holds a copy of the guide's words. `serve.cjs` serves the built
guide from `_site` and adds one stylesheet and one script per view
(`views/<view>/view.css` and `view.js`). The script moves the page's own
elements into a new arrangement; it never retypes them. Anything a view adds
(a toggle label, a map label, a photo credit) is named in that view's
`strings.json` with the reason.

View `d` holds no copy of view `a`: `serve.cjs` loads both views' files
(`BASE`): `a`'s stylesheet before `d`'s, and `d`'s script before `a`'s, because
`a`'s script calls `d`'s once the map is built. Views `c` and `d` share one
toggle, `views/toggle.css` and `views/toggle.js` (`TOGGLE`). View `d` is held to
`a`'s string list plus its own.

## Check it

    node docs/design/experiments/guide-look-study/verify.cjs

`verify.cjs` starts its own server and compares each view with today's page at
1440, 393, 375 and 360 pixels wide, three times each: with motion on, with the
visitor's reduced-motion setting, and with every animation switched off. Each
page is judged at rest, with its toggles open. A view fails if it:

- drops, retypes or hides any text, even behind a closed toggle;
- adds text, a link or an image that its `strings.json` does not name;
- changes a heading's level, a link, a form field, a tracked element, the page
  title, a meta tag or a JSON-LD block;
- is wider than the screen, sets text under 12px, has a tap target under 44px,
  or adds an accessibility violation that today's page does not have;
- needs an animation to show any of its text, or runs an animation that never
  ends;
- has an image that does not load, or a script error.

The run first damages today's page on purpose in sixteen ways (a deleted
paragraph, a hidden one, a retagged heading, text that only an animation
reveals, a photo that cannot load and so on) and fails unless the check reports
every one. `PROOF_DIR=<folder>` also writes screenshots.

What the check cannot see, so a person has to look:

- text that is partly cut off inside a box (it counts a paragraph as shown when
  any line of it shows);
- text drawn by a stylesheet, not the page (view `a` draws its marker numbers
  that way below 1050px);
- contrast of text over a photograph (view `b`'s desktop title, judged by eye
  only and not measured);
- the size of the labels inside view `a`'s map drawing, which is hidden from
  screen readers and so skipped (the smallest are 12px today).

    node docs/design/experiments/guide-look-study/record.cjs <folder>

`record.cjs` records a short clip of the moving moment in views `a`, `c` and `d`
(and a GIF when ffmpeg is installed). A clip shows that the motion plays, not
how it feels on a real phone.

## Motion

Motion was added only where it has a job, chosen with the four questions in
Emil Kowalski's method (how often, what for, how fast, does it work without it)
and built with CSS and browser features only. Every view is complete without it.

| View | Moment | Catalog pattern |
| --- | --- | --- |
| `a` | The five map markers arrive once, in guide order; pointing at a name in the key grows its marker | none (new) |
| `b` | None. A photo "settle" was built, reviewed and removed | none |
| `c` | The paragraphs grow out of the row that was pressed, and fold back into it | Disclosure |
| `d` | Both of the above, unchanged: `a`'s markers in the opening, `c`'s row on each beach. Nothing new | Disclosure |

`review.md` lists what was considered and rejected, and why.

## Files

- `serve.cjs`, `switcher.css`, `switcher.js`: the local server and the view bar.
- `contract.cjs`, `verify.cjs`: the copy contract and the checks.
- `record.cjs`: records the motion clips in `proof/`.
- `views/a`, `views/b`, `views/c`, `views/d`: one stylesheet, script and string
  list each. `views/toggle.css`, `views/toggle.js`: the toggle `c` and `d` share.
- `island-data.json`: the island outline and marker positions for views `a` and `d`.
- `photos/`, `photo-sources.md`: the photos in view `b`, with source, licence
  and credit for each, and the source of the map outline.
- `proof/`, `review.md`: screenshots and the review record.

## Rules this study bends on purpose

They are the question, so the versions are allowed to break them: the
type-only opening for moved guides (`docs/design/planning-guides.md`), the fixed
section order, "cards are separated by rules, not shadows" for photo cards, and
always-visible paragraphs (views `c` and `d`). Picking a version narrows Sawyer's own
2026-11-14 choice of the type-only guide frame.

The motion also goes past `DESIGN.md`, which names three jobs for motion: view
`a` plays one 300ms entrance on its map markers when the page loads.
`docs/agents/rules/design.md` allows a labeled exploration to propose this; it
changes no production default.

Everything else holds: Waterline colors and fonts, the size and tap-target
floors, every word, link, title, meta tag and JSON-LD block, the booking box as
it is, no animation library, no loop, no scroll hijacking, and a complete page
under reduced motion.

## Result

Sawyer, 2026-11-22, in the session chat: "I like the map." That picks out view
`a` (map first). He did not rule on `b` or `c`, and did not take the recommended
mix (`b` with `c`'s fact strip and toggle).

Sawyer, 2026-11-22, on agent-issues #90: "Yes to both". That approves the map
look with `c`'s "More about this beach" toggle for guides about places, and fact
strips for guides that are not about places. View `d` is the first of those
drawn as a page, for him to look at before the spec is written (#1040).

Nothing here is a production rule. The recipe, the written exception to the
type-only opening and any `src/` change wait for the Stage 2 spec and his
approval of it. The four held guides (weather, best time to visit, Anna Maria vs
Siesta Key, shelling) are not touched until their measurement ends.
