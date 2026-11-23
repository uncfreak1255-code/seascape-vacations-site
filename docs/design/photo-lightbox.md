# Photo lightbox (November 2026)

The reader's job: follow a home's photos room by room, and see any one of them
whole. One macro, `photoLightbox(id, title, rooms, eyebrow)` in
`src/_includes/partials/photo-lightbox.njk`, prints a native `dialog`. Styles:
`src/css/photo-lightbox.css`. Script: `src/assets/js/photo-lightbox.js`. The
macro's header comment is the data contract. Preview: the three `photo-lightbox`
cards from `npm run design:sync`. Tests: `scripts/enforcement/photo-lightbox.test.js`
(markup and stylesheet), `photo-lightbox-script.test.js` beside it (the script)
and, in a real browser, `tests/visual/photo-lightbox.spec.js`.

## Status: selected, on no page

Sawyer picked this direction, "Room by room", on November 14, 2026 from three
mocks on the Claude Design canvas
[Seascape Waterline Prototypes](https://claude.ai/artifact/H2irhgEsvdL3FAb7xjw6Fq):
"I like b for desktop", then "B is fine" for the phone. The record of that
choice names the two layouts and no motion. On November 22 he approved building
it as a catalog piece (site issue #1041, item 3).

Hold: the homes' pages keep the gallery they have. Before the lightbox goes on
a home page, `DESIGN.md` changes first and property truth gains a room for
every photo of all eight homes; it has no room field today. The preview's rooms
(`scripts/design/design-sync/photo-lightbox.fixture.json`) are the sample's own
grouping, not property truth. That page change is a separate visible change
with its own design review and content gate.

## Three layouts

| Viewport | Layout |
| --- | --- |
| 900px and up | A 320px rail (title, rooms as a ruled list in display type, the room's photos small, Close) beside one large photo with its caption, its position and previous/next buttons. A small photo picks the large one. The arrow keys walk every photo and the room follows. |
| 701 to 899px | One room's photos as a feed on paper, rooms as choice chips with their counts, and a full-width "Next: room" button. Neither mock shows this width. |
| 700px and narrower | The same feed on the phone surface of [cards and phone surfaces](cards-and-phone-surfaces.md): white canvas, 16px photo corners with the inner outline, the rooms in one pill track, a 12px Next button. |

## Limits

- The host page keeps every photo reachable without the script. The opener is
  the page's own `<button type="button" data-plb-open="<id>" hidden>`; the
  script shows it only where it can open the dialog. Load the script with
  `defer`.
- With the script running, a closed dialog loads no photo: every image is lazy,
  and a screen under 900px never fetches the large one. Pass `srcset` so the
  feed and the small photos take a small file. A browser with scripting off
  ignores `loading="lazy"` and fetches every photo of a dialog it cannot open
  (14 requests for the 13-photo sample, measured in Chromium). The page change
  that first uses the lightbox settles this, for example by printing the dialog
  inside a `template` the script unpacks.
- In the feed a photo is a plain link to its full-size file, in the same tab.
  Beside the large photo a click picks it, and a modified or middle click still
  opens the file.
- The control labels (Close, Rooms, Previous photo, Next photo, the counts) are
  the partial's own words. A photo's `label` and `alt` and the room names are
  the page's, and print escaped.
- The phone's pill track fits four short room names at 320px; the sample's
  longest is "Bedrooms". More rooms or longer names need another switcher. The
  rail has been rendered with four rooms only; each extra room takes 56px from
  the small photos.
- A room needs a name and one photo with `src` and `alt`; others are left out.
  One room prints no switcher, one photo no step buttons.
- Escape, the Close button and the return of focus to the opener are the
  browser's own (`showModal()` and `form method="dialog"`). It opens with Close
  focused (`autofocus`). The page behind stays still where the browser has
  `:has()`.
- Close is the first control in the markup, so a keyboard or screen-reader
  user can leave at once. At 900px and up it is drawn at the rail's foot, where
  the canvas has it, so there the tab order starts at the bottom of the rail.
- Beside the large photo, focus on a small photo goes with the pick; focus on
  Close or a step button stays. The picked small photo is scrolled inside the
  rail. The caption and its position are one live region, read as a whole.
- A step changes the caption at once and the large photo when its file
  arrives. On a slow connection the old photo sits under the new caption until
  then.
- The focus ring and the picked photo's ring name one class. On a guest page
  `guest.css`'s `.guest-site a:focus-visible` outranks them and draws the same
  3px clay ring at 4px.
- No mock shows a short window. A phone on its side (393px tall) gets a feed
  about 160px tall, under a third of a photo at a time; a shorter window, or a
  wide one under about 550px tall, scrolls the dialog as a whole. That view
  needs a design before the lightbox goes on a page.
- The script tells the feed from the wide layout by whether the large photo's
  box is laid out, so the stylesheet's 900px is the only copy of that width.

## Departures from the canvas

What the canvas shows at rest stays, such as the picked room in clay italic.
Where it and the law differ on a state or a surface, the law wins:

| Canvas | Built | Why |
| --- | --- | --- |
| Photos cropped to their boxes | The large photo whole in a 3:2 box; feed photos at their own ratio | A lightbox is where the reader sees the whole photo |
| Picked small photo in a 2px clay ring | A 2px ink ring | Clay at 3px is the focus ring; two clay rings read as one state |
| Phone focus ring offset 3px | 4px | [Scales, states and forms](scales-states-forms.md) |
| Phone Close: a white pill on a shadow ring | A soft-fill pill, no shadow | The phone rules name the controls that take the ring, and Close is not one |
| Small photos are buttons named "room, photo N of M" | Links to the full-size file, named by the photo's `alt` | One list serves the feed and the rail, and a modified click opens the file; the position is in the caption |
| No hover on any control | Hover on the buttons, chips and rail rows | The shipped controls' fine-pointer feedback |
| The dialog fills the window edge to edge | Padded by the safe-area insets | A full-window dialog has to clear a phone's notch and home bar |

## Motion record

Built: the state feedback `DESIGN.md` gives every control. A pressed button or
room scales to 97% (99% for a rail row) in 120ms `out`. A colour change on
these controls takes 200ms `out`. On a fine pointer's hover Close and Next fill
with muted ink, a step button takes the soft fill, and a room's border goes
ink: a chip's whole border, or the rule under a rail row. The picked rail row
has no hover, since a press there does nothing. The phone's pills have none:
they have no border, and no hover is designed for them. When a room is picked
in the feed, its chip's or pill's fill, border and label make the same 200ms
change; the catalog page's filter chips fade those three too
(`src/css/motion.css`). Reduced motion: no scale, and every change is
immediate. A room's photos, the rail's picked room, the large photo and the
dialog itself change at once.

In the canvas's source and not built; the record of Sawyer's choice does not
say he saw any of it move:

- Wide: the large photo fades in from opacity 0 over 200ms `out` on each change.
- Phone: the room pill glides to the picked room over 400ms on
  `cubic-bezier(.3,1.3,.5,1)`, which overshoots and is off the easing list, and
  stretches to 114% wide on the way; each photo of a new room rises 12px from
  opacity 0 over 250ms `out`, one after another; the feed snaps to photos
  (`scroll-snap-type: y proximity`) and hides its scrollbar. 250ms is off the
  duration scale.

None of it ships until Sawyer selects it from a working preview:
[pattern motion](pattern-motion.md).
