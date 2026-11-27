# v4 component specs

Authority: root `DESIGN.md`. This file holds the Airbnb-pattern component catalog so `DESIGN.md` stays under the file-size gate. Do not build a new surface from a retired pattern. PR 1 does not restyle these components; later PRs consume the tokens.

Default pattern source: Airbnb. Copy Airbnb’s pattern, behavior and proportions first, then apply Seascape tokens. Deviate only where this file names an exception.

## Exceptions

### Booklet gallery
Desktop property pages only (`>=1025px`). The single sanctioned exception to the Airbnb default.

Keep: open-book spread of two photos on paper pages (`#F6F3EB`), 14px page padding, center spine shadow, caption + two-digit number under each photo, Previous / `1-2 / 13` / Next controls, thumbnail strip with the current spread outlined, “View all 13 photos”.

Restyle around it (later PR): band behind the book = surface `#F7F7F7`. Controls use v4 buttons (8px, Inter 14/600; Previous = secondary, Next = accent). Thumbnails 56×40, 6px radius, current = 2px ink outline. Book shadow `0 20px 40px rgba(23,61,66,.12)` is allowed here only.

Not allowed: no booklet on phones, owner pages, guides or homepage. Phones use the Airbnb full-bleed swipe photo.

### Phone homepage list
Homepage at `<=600px`. Keep the live layout exactly: “Dates and guests / Flexible dates” search pill, wordmark row with phone button / Owners / Menu, horizontal filter chips, the count line, full-width home cards (photo with dots, location · guests, serif name, ★ rating (count), tagline, “Explore this home”).

Change (later token pass): body text Inter, ink `#1E2324`, selected chip ink fill with white text. No layout, spacing or order change.

## Components

Header: 80px white, 1px line bottom. Wordmark left (Instrument Serif logotype, accent), 4 nav links center 15/500, phone + 40px accent “Find your home” right; active link = 2px ink underline. Phone: the live homepage header on every page; detail pages on phone hide the header behind the photo and use a round back button.

Search pill: Desktop white 76px pill, float shadow, overlapping the hero by 44px: Arrival | Departure | Guests segments (13/600 label, 15 muted value) + 56px accent pill “Find my home”. Phone: one 56px pill “Dates and guests / Flexible dates” that opens a full-screen sheet.

Hero (desktop home): Inset 16px-radius photo of a named home, white serif H1 bottom-left over a left+bottom scrim, home name + tagline bottom-right with a manual scene control (round 36px prev/next + “1 of 8”). Optional motion: 250ms crossfade on manual change only. Never autoplay; never hides the homes grid.

Chips: 40px pills, 1px line, 14/500, horizontal scroll on phone (no wrap). Selected = ink fill, white text.

Listing card: Airbnb card: photo (20:19 desktop grid, live ratio on phone), 12px radius, no frame or shadow; name 16/600 (serif on the phone list as live) + “★ 5.0 (113)” right; “Bradenton · Up to 12 guests” and tagline in 15 muted. Desktop 4 columns.

Listing layout desktop: Breadcrumb → serif H1 + one meta line (★ rating · review count · city · facts) with text links right → booklet (exception) → `1fr + 380px`: content column and sticky booking card.

Listing layout phone: Full-bleed swipe photo (≈292px) with round back button and “1 / 13” pill → white sheet with 20px top radius overlapping 20px → centered serif title, subtitle, facts line → rating box (score + stars | review count, “Ratings from Airbnb”) → trust rows → description → Who sleeps where (horizontal tiles) → What this place offers (6 + “Show all N amenities”) → reviews (horizontal cards + button) → Where you’ll be (map) → Things to know (rows) → sticky bottom bar.

Trust row: Icon (24px line, ink) + 16/600 title + 15 muted line; max 3. Only facts already published on the site (local team + phone, full price incl. mandatory fees and taxes before paying, secure Hostaway checkout). No badges, awards or invented counts.

Booking card: 380px sticky, 1px line, 16px radius, float shadow, 24px padding: title 22/600, facts, combo field (Arrival|Departure / Guests, 1px line-strong, 8px radius), full-width 52px accent “Check dates”, 14px muted fine print, text link “A question before you choose?”.

Sticky bar phone: White, 1px top line, 12/20/22px padding + safe area: left facts summary 15/600 + underlined “Choose dates”; right 48px accent “Check dates”. Never covers form fields.

Reviews: Header “★ 5.0 · 137 reviews” (22-24/600) + “Ratings from Airbnb”. Cards: 44px initials avatar on surface, name 16/600, month year muted, 5 ink stars, quote 16/1.55. Desktop 2-col grid; phone horizontal scroll of 280px bordered cards + “Read reviews on the booking page”. Only real published reviews.

Map: 12px radius, 360px desktop / 220px phone, desaturated street map at city level, OSM (or provider) attribution, place name below. No exact pin; never imply a beach or water view the listing data doesn’t support.

Amenities: 2-col desktop / 1-col phone rows: 24px line icon + 16px label; show 6 on phone then secondary button “Show all N amenities”. Labels come from property data only.

Info tile: 1px line, 12px radius, 18-20px padding, 15/600 title + 15 muted (bedrooms, highlights).

Things to know: Icon + title + muted line; 3 columns desktop, ruled rows on phone. Source: canonical property data / Before-you-book copy.

Buttons: Primary = accent fill 48px (52 in booking card), 8px radius, 15-16/600, no arrows. Secondary = white with 1px ink border. Text link = 600 with 1px underline, 4px offset. One primary per view.

Forms: Airbnb host-onboarding pattern (Direction A) with the accent button. State and field rules: `docs/design/scales-states-forms.md`.

Owner pages: Same header, buttons, forms, cards, reviews and sticky bar. Hero = Airbnb-host style split: serif H1 + one line + the form card, photo of a managed home beside it. No near-black slab, no tinted bands.

Guide pages: Same shell and components: left-aligned serif title, one real photo (16px radius), 68ch reading column, optional contents rail, listing cards for homes, booking card or sticky bar for CTAs, 1px-line tables. No badges, stats strips, icon-card grids or centered hero overlays.

Divider: 1px line inside a content column (32px above/below); whitespace (96/48px) between page sections.

Type scale (target; live CSS still uses Waterline sizes until a later PR): display 96/0.98 desktop hero, 60 phone; h1-page 52/1.02 serif (34 phone); h2 44/1.05 homepage, 28-34 inside detail pages, 26 phone; h3 22-24/1.25/600; body 16/1.6 (guides 17/1.7, 68ch); small 15/1.4 meta, 14 chips; label 12-13/16/600 sentence case inside fields only. No all-caps tracked eyebrows. A kicker is 15px 500-600 muted sentence case, and most sections need none. One color per heading.

Layout: container 1360px max, 40px gutters desktop, 20px phone. Section gap 96px desktop, 48px phone. Booking/detail pages: content 1fr + 380px sticky booking card, 96px gap.
