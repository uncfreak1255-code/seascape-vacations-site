# Guide look study: review record

Nonpublic study. Base: `origin/main` at `d51e61d1`. The critic and the
screenshots in `proof/` are from commit `c88d79df`; the checker output below is
from the scripts as they are now. Tracking issue: #1036. Date: 2026-11-22.

## What the checker says

    node docs/design/experiments/guide-look-study/verify.cjs

    today's page: 257 text nodes, 20 headings, 65 links
    today's page at 1440: axe [clean], text under 12px 0, tap targets under 44px 0, overflow 0px
    today's page at 393: axe [clean], text under 12px 0, tap targets under 44px 0, overflow 0px
    PASS self-test: the contract caught all 16 deliberate breaks
    PASS a (A · Map first) at 1440, 393, 375, 360, each with motion on, reduced and off
    PASS b (B · Photo cards) at 1440, 393, 375, 360, each with motion on, reduced and off
    PASS c (C · Fact strips) at 1440, 393, 375, 360, each with motion on, reduced and off
    PASSED

The checker proves the words, links, headings, metadata, size floors, image
loading and overflow. It does not judge how a page looks, how spacing reads, or
how motion feels. `README.md` lists four things it cannot see.

A pre-PR bug review of the study's scripts ran once after the critic's final
pass. Four findings were fixed (the server now answers a malformed address
without stopping; the checker loads every photo and fails on a broken one; view
`a` reports a failed build as a script error; the recorder cleans up after a
failed run). View `a`'s script was the only view file touched: a phone
screenshot of its first beach section taken before and after the edit is the
same file byte for byte, so the screenshots and the critic's verdicts stand.
The rest are the checker limits in `README.md` and the pull request's findings
list.

## Design critic

An independent critic (the `seascape-design-critic` method) judged every view
against the homepage, twice. Round 1 was a fresh read. Round 2 was the same
critic, told what had changed and given fresh screenshots, so it is weaker
evidence than a second fresh read.

| View | Round 1 | Round 2 (final) |
| --- | --- | --- |
| `control` | Reject | not re-judged |
| `a` Map first | Needs another pass | Approved with edge |
| `b` Photo cards | Needs another pass | Approved with edge |
| `c` Fact strips | Approved with edge | Approved with edge |

The critic's confidence: medium for `a` and `b`; for `c`, "Medium (low-medium on
'looks high end')".

Round 1, in the critic's words: "none of the three reaches the homepage bar.
Each makes one strong move in the first screen ... and then falls back to the
same paragraphs, same rhythm and same section furniture as today." And: "three
different first screens, but only c is a different page." Its blockers, and
what the fix round did:

- `a`: the beach sections were today's page with a sliver of map. Now every
  beach has a panel: the whole island with that beach's marker lit, beside its
  Best for, Facilities and Parking lines. The opening stacks between 900 and
  1049px, where it used to leave empty paper.
- `b`: the photo-less Manatee Beach card was stretched and half empty. It is now
  a full-width ink band set in type. The desktop title sits on the photograph,
  as on the homepage. Each card has a designed facts block and a larger name.
- `b`, not changed: the Bradenton Beach photo shows the Bridge Street Pier clock
  tower, not sand. The guide names the pier in that section and no other
  rights-cleared photo was found. One of Sawyer's own photos would fix it.
- `c`: opening "More about the island" pushed the desktop title down. The
  opening now hangs from the top. Lead-in labels in sections 6 and 7 no longer
  wrap from 1200px.

Round 2, in the critic's words: "None is plain Approved: none matches the
homepage's photographic confidence, and each has a visible edge below." Every
round 1 blocker is closed, or
accepted as a named edge (the pier photo, which "must be replaced before
anything ships"). On whether these are now different pages: "the beach half is
three different pages and the lower half is one frame with a small c
variation." Sections 6 to 10 are still today's page in `a` and `b`.

The critic's order for showing Sawyer: `b` (closest to the homepage), then `a`
(the most distinctive idea), then `c` (the only one that cuts the wording, and
the least high end because it has no picture).

The plan asked for "Approved" or "Approved with edge" on every view, and has it.
The fix round was capped at one pass, so these edges from round 2 are left open:

- `a`: the opening map's outline is rougher than the outline in the section
  panels. On a phone the lit marker hangs left of the text column. The critic
  reported it as cut off. The study's author measured the offset at about 14px
  and saw the marker whole in a 390px full-screen render
  (`proof/a-390-pg1-viewport.png`); that reading is the author's, not the
  critic's.
- `b`: the ink wash over the desktop opening photo is heavy and dulls the sky.
  It switches off below 900px, so 768 and 1000 look like two designs.
- `c`: with "More about the island" open at 1440, about 300px of empty paper
  sits under "8 min read". No picture anywhere in the view.

## Rendered check (`design-review`)

Looked at by the study's author, at 390 and 1440: the four-view phone board, the
top of every view at 1440, view `a`'s first beach section on a phone, and the
whole page of `a` and `b` at 1440. Nothing looked at had a blank area, clipped
text or a broken stack. The three findings worth acting on match the critic's: `b`'s heavy wash
over the opening photo, sections 6 to 10 unchanged in `a` and `b`, and the empty
paper in `c` when the island row is open at 1440.

Not run: `npm run test:visual`. Its baselines cover site routes, and this study
changes none.

## Motion

Reviewed with Emil Kowalski's method, read from `emilkowalski/skills` at
`64eb3deb` (reference copy outside the repo; nothing installed):
`find-animation-opportunities` and `animate` (with its recipes) to choose and
build, `review-animations` (with its standards) and `choreograph` to review.
The site's own `emil-design-eng` skill and `DESIGN.md` set the limits.

Each candidate was put through the method's four questions: how often it is
seen, what it is for, how fast it is, and whether the page works without it.

| Candidate | Result | Reason |
| --- | --- | --- |
| `c`: paragraphs grow out of the pressed row (catalog: Disclosure) | Kept | Occasional; shows where the text came from; 200ms height and opacity; native toggle, no script; opens at once where the browser cannot animate it |
| `a`: pointing at a name grows its marker | Kept | Ties each name to its place; 150ms; fine pointers only; keyboard focus gets the outline and no scaling |
| `a`: the five markers arrive once, in guide order | Kept | Seen once per visit; orders the eye through 01 to 05; 300ms each, staggered 70, 60, 50 and 40ms; names are readable before it starts |
| `b`: each photo settles from 104% to full size | Built, then removed | Decoration only; not visible in a recording; doubted by the motion review and by the critic |
| Page-turn booklet, photographic folio | Rejected | The catalog marks both as wrong for long articles and comparisons |
| Photo lightbox | Rejected here | Needs a new button and dialog, which this study's copy contract counts as a forms change. First candidate when the shelf is built out |
| Filter or selection pill | Rejected | Five beaches; the chooser table already does the job |
| Responsive call to action | Rejected | The booking box and sticky bar are frozen in this study |
| Title entrance, parallax, photo hover zoom, carousel | Rejected | Delays the first read, decorates, promises a click that is not there, or hides copy |

The motion review's verdict was "Approve with changes", with no automatic-block
item. Its changes were applied: the toggle's gaps moved inside the box that
grows, the feature test now needs both browser features, and the fold mark
matches the panel's 200ms.

## Component catalog (`docs/design/component-patterns.md`)

Used: Disclosure (`c`), Editorial decision card (`b`, as the photo card). Looked
at and not used: Page-turn booklet, photographic folio, Photo lightbox,
Filter/selection pill, Responsive CTA, for the reasons in the table above. New
in this study and not yet on the shelf: the island locator panel (`a`), the type
band for an entry with no photo (`b`), the ruled fact strip (`c`).

## Reference sites

- `a`: Herb Lester Associates' printed maps with a numbered key; nps.gov park
  "Maps" pages, which put the map before the prose.
- `b`: Sawday's (sawdays.co.uk): a full-width photo opening, then serif text on a
  pale ground.
- `c`: the mobile Wikipedia article layout: a facts box first, sections folded
  behind toggles.

Each was opened and captured before the views were built.

## Rules bent, on purpose

- Type-only opening for moved guides (`a` map, `b` photo).
- Fixed section order (`a` moves the comparison table up).
- "Cards are separated by rules, not shadows" (`b` photo cards).
- Always-visible paragraphs (`c`).
- `DESIGN.md`'s three jobs for motion (`a`'s marker entrance on load).

Picking `a` or `b` needs a written exception in the guide rules before any
production work. Picking any view narrows Sawyer's 2026-11-14 choice of the
type-only guide frame.

## Where this departs from the written process

1. `docs/agents/rules/design.md` expects reference sites from
   `npm run design:donors`. That command returns skills, not sites, and prefers
   Anthropic's `frontend-design`. Real sites were named by hand and
   `frontend-design` was not loaded.
2. `npm run design:lane` could not run in a worktree the Claude harness pins.
   The study followed the same steps by hand.
3. The accessibility check is narrower than the plan and than criterion 2 in
   #1036, in two ways. It fails a view only when the view has more violations
   of a rule than today's page, and it runs at 1440 and 393 only, not at 375 or
   360 (`DEEP` in `verify.cjs`). Today's page is clean at both widths, so each
   view had zero violations there. The copy and overflow checks run at all
   four widths.
4. The builders shared one worktree with separate write sets, not one worktree
   each.
5. The builders' first brief banned entrance animations. The motion pass bent
   that after Sawyer asked for motion and varied components.
6. The critic pass was capped at two rounds; its round 2 polish items are
   listed above and were not fixed.
7. `AGENTS.md` calls Emil's craft skill "required"; the site has 2 of the 20
   upstream skills, and most of the rest need trimming for a site with no
   animation library. Left as a Stage 2 item.

## Findings that are not design

- The comparison table's rows do not match the five beach sections one for one.
  It is a copy question and was left alone.
- "8 min read" sits on the rule at desktop in every view, as on today's page.

## Not checked

- Safari, Firefox and any real phone. Where a browser cannot animate the
  toggle in `c`, the code opens it at once; that path was not run in Safari.
- How any motion feels in the hand. Recordings show that it plays.
- The Claude Studio artifact Sawyer mentioned: this session could not open it.
- Screen-reader reading order. In `a` the fact lines now come before the prose.
- `a`'s outline is simplified from OpenStreetMap; marker positions are by
  latitude and were not checked on the ground.
- The pier photo's author asks reusers to send him a message. It was not sent:
  contacting a third party is Sawyer's call, and only matters if `b` ships.

## View `d`, map with toggle (added 2026-11-22, #1040)

Everything above this heading is the record of the first study and is left as
it was. Sawyer then picked the map ("I like the map") and approved its toggle
("Yes to both", agent-issues #90). View `d` draws that pick: view `a` down to
the first beach; in each beach, the paragraphs that are not fact lines sit
behind "More about this beach" under the map panel, and the section ends at
that row. From 900px the section is one column (`a` has prose left, panel
right); from 1200px each fact's label sits beside its line.

Checker, every view, with `d` and the shared toggle in place:

    PASS self-test: the contract caught all 16 deliberate breaks
    PASS a (A · Map first) at 1440, 393, 375, 360, each with motion on, reduced and off
    PASS b (B · Photo cards) at 1440, 393, 375, 360, each with motion on, reduced and off
    PASS c (C · Fact strips) at 1440, 393, 375, 360, each with motion on, reduced and off
    PASS d (D · Map with toggle) at 1440, 393, 375, 360, each with motion on, reduced and off
    PASSED

Building `d` moved `c`'s toggle into `views/toggle.css` and `views/toggle.js`
and added one hook line to `a`'s script. A fresh run writes the same
`a`, `b`, `c` and `control` screenshots as the files already in `proof/`, byte
for byte (18 files), so those views and their verdicts stand.

Critic: one fresh read of `d` by an independent critic (the
`seascape-design-critic` method), one round. Verdict: "Approved with edge",
confidence medium, no blockers. "Not plain Approved: it has no photography, and
next to the homepage it reads as a well-made reference sheet, not a place." On
a phone it judged `d` better than `a` (same map and facts, a shorter page: about
12,000px against 14,800) and better than `c` (which loses the "where"). Edges it
named, none fixed here:

- `a`'s two opening edges carry over (rougher outline on the opening map; the
  lit marker hangs about 14px left of the text column on a phone).
- No picture in the beach half; five beaches use one module.
- A beach with one fact line (Bradenton Beach) leaves empty paper beside or
  under its map.
- At 1440 the plus mark is small and far from its label.
- The closed row does not say what is inside. The critic suggests a label that
  names the beach. The label is copy Sawyer approved, so it is a spec question.
- A production build must put the paragraphs inside the toggle in the built
  HTML. This study moves them with a script.

Motion: nothing new. `d` plays `a`'s marker arrival and `c`'s toggle, both
reviewed above. `proof/motion-d.gif` shows the toggle on a phone. Not checked
for `d`: the same list as under "Not checked", and the critic did not watch the
motion.

## Proof

View `d`: `proof/d-390-screen-2-map.png`, `-3-beach-closed.png` and
`-4-beach-open.png` are three phone screens (the map, the first beach, the first
beach with its row open); `d-1440-pg1.png` is the first beach on a desktop;
`d-390-top.jpg`, `d-1440-top.jpg` and the `d-*-full.jpg` files show the rest.

From the first study, without `d`:
`proof/board-phone.jpg` shows the four views side by side on a phone.
`proof/<view>-390-top.jpg`, `-1440-top.jpg` and the `-full.jpg` files show each
view; `c-*-open-full.jpg` shows `c` with every row open. `proof/motion-a.gif`
and `proof/motion-c.gif` are the two moving moments.
`proof/a-390-pg1-viewport.png` is view `a`'s first beach section on a 390px
phone screen, the evidence for the marker note above.
