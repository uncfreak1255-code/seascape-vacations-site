# Homepage design review, 2026-10-03

Status: review only. No live page changed. Evidence: local build of `main` at this branch base, desktop 1440 and mobile 390 screenshots. The live URL could not be reached from the cloud session, so the check used the built source, which is what Netlify deploys.

## Why it feels cluttered

1. **The homepage has 9 sections plus a pop-up.** Opening photo, home picker, trip form, collection, organizer steps, local guides, reviews, email signup, owner call, "Been here before". Each section repeats the same pattern: small label, two-line serif heading, paragraph, link. The repeat makes every section the same weight, so nothing leads.
2. **The opening screen carries seven text layers.** Label, headline, two-line subline, home name, home tagline, "Explore this home" link, "01/06" counter, round "One good getaway" seal, and the six-home picker bar. Source: `src/index.njk` lines 12-24.
3. **The same six homes appear three times**: picker bar, postcard row, review links.
4. **Two email forms** (inline and exit pop-up) and **two owner calls** (section plus "Been here before"). The exit pop-up breaks the DESIGN.md rule "no unsolicited popup" in spirit; check with Sawyer before keeping it.
5. **Explanation copy.** Sections say what the page will do ("Choose a few homes, compare the rooms...") before the guest can do it. A polished site shows the thing, not a paragraph about it.

## What an elite team would do in six months

- **Cut to 5 moments.** Opening, collection, one proof (one quote), one direct-booking offer, one owner path. Move organizer steps and local guides into one slim strip. Drop "Been here before".
- **One idea per screen.** The trip form joins the opening photo as one bar. The picker becomes dots or a scroll progress mark.
- **Motion that explains, not decorates.** Slow image settle on load, line-by-line headline reveal, image zoom on hover, scroll-linked scene change for the collection, shared-photo transition to the home page (already in the repo as a progressive enhancement). Every effect needs a reduced-motion path and must never delay booking.
- **Quiet system.** One type size ladder, fewer labels, more space between sections, one accent use per screen (citron stays on buttons over photos).
- **Performance as polish.** `guest.css` is 35 KB and `arrival.css` is 15 KB on this page; the first photo is the largest paint. Preload it, keep the rest lazy.
- **Measure.** Hold each variant against the current page for owner lead starts and book-direct handoffs before any change goes live (analytics repo owns the numbers).

## Prototypes

Three variants, same real photos and copy, in `docs/mockups/2026-10-03-homepage-calm/`.

- **A, Calm.** Trip form in the opening photo, six homes in one grid, one quote, one closing band for signup and owners. Motion: slow image settle, soft reveals, hover zoom.
- **B, Cinematic.** The opening photo scales as you scroll. The collection becomes a full-screen scene that changes as you scroll, one home per screen.
- **C, Editorial.** Large serif headline reveals line by line. The collection is a numbered list with a photo that follows the pointer (thumbnails on phones).

## Open points

- Prototypes use a stand-in for the booking calendar; the real trip form stays as is.
- The `design:sync` mock surface in AGENTS.md is the approved contract for build. These prototypes are choices to pick from, not that contract.
- Floors F1-F6 in DESIGN.md were not run on the prototypes. Any chosen variant must pass them before it ships.
