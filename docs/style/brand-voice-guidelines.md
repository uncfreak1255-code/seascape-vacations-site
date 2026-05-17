# Brand Voice Guidelines — Seascape Vacations

*Source of truth for all agent-generated copy. Read this before writing any guest or owner page.*

---

## Voice in One Line

Sound like a sharp local operator who knows the Gulf Coast corridor and is willing to name the tradeoff — direct, specific, and useful even if the reader doesn't book.

---

## Who We're Writing For

### Guest Decision-Maker

The **trip organizer**: a parent, spouse, or group coordinator (ages 30–55) planning a Gulf Coast beach trip for 8–16 people. They own the booking decision and have done this before. They're comparing options, doing the math on fees, and trying to verify whether the photos match reality.

**What they're actually solving:**
- Find a private-pool home big enough for the whole group without splitting across two rentals
- Book direct to avoid the $400–700 in OTA service fees that stack up on large-group trips
- Get honest guidance on Bradenton vs. Sarasota vs. on-island AMI — they don't want to pick wrong
- Feel confident before arrival that the home is what it claims to be

**Emotional state:** "I'm spending $3,000+ on this vacation and I can't afford to get it wrong."

### Owner Decision-Maker

A vacation rental owner in the Bradenton–Sarasota corridor who suspects the current setup is underperforming. They are already running the property — self-managed or with another manager. Their calendar is full but net revenue feels thin. They're evaluating a switch, not browsing.

**What they're actually solving:**
- Understand why occupancy is high but net revenue is disappointing (OTA fee drag, weak premium-week pricing, turnover issues)
- Find a manager who protects premium weeks, not just fills nights
- Get local follow-through, not a call center

---

## Core Voice Rules

**1. Answer the real question in the first paragraph.**
The page should be useful even if the reader bounces after 20 seconds. Don't warm up. Don't open with methodology notes, feature lists, or a generic destination hook.

**2. Name the tradeoff.**
Good Seascape copy says what you gain and what you give up. Bradenton is not "just as good as AMI" — it's different, cheaper, and 10–15 minutes from the island. Say that. The reader trusts you more when you don't pretend everything is ideal.

**3. Lead with the visitor's problem or decision, not your positioning.**
Guest pages: beach access, group fit, drive time, fee math. Owner pages: the revenue leak, the gap between occupancy and net income, what local execution actually means.

**4. Use specifics instead of adjectives.**
Drive times, bedroom counts, fee amounts, actual amenity names. "Private pool, 12-person capacity, 10 minutes from AMI" beats "luxury family getaway" every time.

**5. Use trip-shape logic for guests.**
Organize recommendations around who's in the group and what they want to do: beach-first, family-heavy, value pool, culture-first, near-island, Sarasota arts/food. Match the base to the trip, then explain why.

**6. Use owner-economics logic for owner pages.**
Lead with the leak, not the service list. OTA fee drag, weak dynamic pricing during premium weeks, turnover quality, channel mix — these are the things that matter. "Full service" tells them nothing.

**7. Write with skin in the result.**
If a recommendation would waste the reader's time or money, say so. If a property isn't right for a particular trip shape, say that too. Being right about the edge case earns trust on the conversion case.

---

## Banned Patterns

### AI-Sludge Adjectives (never use)
These words signal generic marketing and kill credibility immediately:
- `curated`, `nestled`, `elevate`, `boasts`, `myriad`, `seamless`, `unparalleled`, `paradise` (exception: sparingly in hero only), `world-class`, `luxury` (as a standalone descriptor)
- `resort-style amenities` — name the actual amenities instead
- `your perfect getaway`, `dream vacation`

### Internal-Documentation Language in Visible Copy
Agent-mode language that reads as a methodology note, not copy:
- `keeps X separate`, `planning math`, `marketplace-fee exposure`, `source-bounded`, `accepted formulas`, `proof boundaries`
- `Proof boundary: This calculator is a planning tool, not a quote.` — belongs in a source box, not the intro

### Funnel-Mechanics Language Written as Guest Copy
These describe internal navigation logic, not guest decisions:
- `fastest path into direct dates`
- `move straight from comparison into live availability`
- `filter by fit, then open dates or the property page for one more look`
- `jump into direct dates`
- `short booking window` — say "book this week" instead

### Agent Meta-Commentary
When the copy explains its own positioning to the reader:
- `with the tradeoff stated clearly`
- `without pretending every stay is on-island`
- `instead of assuming the collection disappeared`

### Owner Page Filler
- Saying `full service` five different ways without naming the leak
- Generic hospitality positioning that avoids explaining why the current setup is underperforming

### Proof Bans
- Stale sitewide review counts used as universal proof across unrelated pages
- Invented amenities or equipment not in `src/_data/properties.js`
- Plural waterfront language when only one property is actually waterfront
- Direct-beach claims on near-island pages that are intentionally not beachfront
- Stats not backed by current source or `src/_data/ownerProofAssets.json`
- Amenity labels, bedroom/bathroom counts, or feature claims that differ across `properties-fallback.json`, `src/properties/<slug>/index.njk`, and `src/llms.txt` — pick one authority and propagate

---

## Guest Copy Rules

- Help the reader decide where to stay, not just admire the destination.
- Keep framing practical: drive time to AMI, beach access route, parking reality, group fit, what the fee math actually looks like.
- When comparing locations (Bradenton vs. Sarasota vs. AMI), explain who should choose which base and why — don't imply every home is right for every trip.
- CTAs should name the next decision, not the generic action. "See Bradenton homes near AMI" beats "Contact us to learn more."
- Keep proof language (methodology notes, calculator disclaimers, source limits) below the hook in a clearly labeled source/proof box — never in the opening paragraph.
- "Near AMI" means 10–15 min drive from Anna Maria Island. Do not use language that implies on-island beach access for Bradenton properties.

---

## Owner Copy Rules

- Speak to switchers, not casual browsers. The reader already has a property and already suspects something is wrong.
- Lead with owner economics: OTA fee drag, rate discipline, premium-week protection, turnover quality, channel mix.
- Treat "busy but underperforming" as the default owner problem — the page should name this pattern explicitly.
- Never flatten every owner concern into "we offer full service." Describe the specific leak the reader is probably experiencing.
- The conversion action is a revenue review or a call — route the page toward that, not a generic inquiry form.
- All owner proof claims must trace to `src/_data/ownerProofAssets.json`. Do not invent occupancy figures, revenue benchmarks, or review counts.

---

## Before / After Examples

### 1. Homepage / Meta Description — Specificity over position-statement

**Bad:** Gulf Coast vacation rentals for direct booking.

**Good:** Gulf Coast vacation rentals in Bradenton and Sarasota. Book direct and skip the OTA fees.

*Why:* The bad version describes what we are. The good version names where we are and what the guest gets — immediately actionable.

---

### 2. Location Guidance — Trip-shape logic vs. UX instruction

**Bad:** Filter by fit, then open dates or the property page for one more look.

**Good:** Use Bradenton when AMI beach access matters most. Use Sarasota when the city is the destination.

*Why:* The bad version narrates a UI action. The good version tells the guest how to route based on their actual trip shape.

---

### 3. Sarasota Page Context — Guest-framing vs. meta-commentary

**Bad:** Use this when Sarasota is the real destination and you want to move straight from comparison into live availability.

**Good:** Use this when Sarasota is the destination — restaurants, arts, and a cleaner downtown-to-beach drive.

*Why:* The bad version describes how the page functions in a funnel. The good version tells the guest what kind of trip Sarasota fits.

---

### 4. Property Feature Copy — Named amenities vs. label words

**Bad:** Downtown Sarasota location with resort-style amenities.

**Good:** Downtown location, private pool, close to St. Armands and Siesta Key.

*Why:* "Resort-style amenities" is a banned abstraction. Named specifics — pool, proximity, district — let the reader actually picture the stay.

---

### 5. Empty-State / Filter Copy — Short and direct vs. narrated UI logic

**Bad:** No homes match that filter right now. Reset to All stays instead of assuming the collection disappeared.

**Good:** No homes match that filter. Reset to All stays.

*Why:* The bad version explains the reader's presumed mental error. The good version gives the instruction and stops.

---

### 6. Research Page Intro — Reader decision first vs. methodology opening

**Bad:** Interactive planning estimate for Bradenton, Sarasota, and Anna Maria Island trips using the accepted cost-index formulas and proof boundaries.

**Good:** Compare Bradenton, Sarasota, and Anna Maria Island trip costs before you book, then use the source notes below to see what the estimate can and cannot claim.

*Why:* The bad version opens as if the reader is an internal reviewer. The good version leads with the reader's job, then signals where the proof lives.

---

### 7. Guest CTA — Named decision vs. generic action

**Bad:** Contact us to learn more.

**Good:** See Bradenton homes near AMI.

*Why:* Generic CTAs make the reader guess what happens next. Named CTAs describe the next step in the actual decision the reader is making.

---

### 8. Source Note — Labeled context vs. positioned opener

**Bad:** Proof boundary: This calculator is a planning tool, not a quote.

**Good:** Source note: Use this as a planning estimate, not a quote.

*Why:* "Proof boundary" is internal jargon. The revised version uses a label the reader recognizes, keeps the caveat honest, and belongs below the hook — not in the intro.

---

## The Test

Before publishing any copy, ask:

1. **Does the first paragraph make the page useful if the reader bounces in 20 seconds?**
   If the opening is about the brand, the methodology, or a vague destination promise — rewrite it around the visitor's actual decision.

2. **Does every adjective have a named specific behind it?**
   For every word like "luxury," "resort-style," or "beautiful," check whether there is a drive time, amenity name, fee amount, or room count that does the same job better. If yes, cut the adjective.

3. **Would this sentence appear in an internal operations document or an agent prompt?**
   If yes — "proof boundaries," "filter by fit," "fastest path into direct dates," "without pretending every stay is on-island" — it does not belong in visible copy. Rewrite it as something the guest or owner would say out loud.
