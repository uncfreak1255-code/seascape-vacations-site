---
date: 2026-03-30
topic: ai-guest-concierge
---

# AI Guest Concierge for Seascape Vacations

## Problem Frame

Sawyer spends significant daily time answering repetitive guest questions — split roughly evenly between pre-booking ("Is the pool heated?" "Can I bring my 25lb dog?" "How far is Bradenton Beach?") and post-booking logistics ("WiFi password?" "Best restaurant nearby?" "Where's the nearest grocery store?").

Meanwhile, website visitors browsing seascape-vacations.com have questions that go unanswered — they either email/call (slow) or bounce (lost booking). The site has 55+ local guides and a verified property database, but that knowledge sits in static pages. Guests have to find and read the right page themselves.

No competitor in the Bradenton/Sarasota vacation rental space offers an interactive, knowledgeable concierge on their website. Most have a generic contact form or nothing.

## User Flow

```
Guest lands on any page
        |
        v
  Chat widget visible
  (corner bubble, non-intrusive)
        |
        v
  Guest asks question ──────────────────────┐
        |                                    |
        v                                    v
  Pre-booking Q                       Post-booking Q
  "Which home allows dogs?"           "Best tacos near River House?"
        |                                    |
        v                                    v
  AI answers with property data        AI answers with local guide
  + links to relevant pages            knowledge + specific recs
  + soft CTA to book direct            + links to full guide
        |                                    |
        └──────────┬─────────────────────────┘
                   v
        Can't answer / complex request
                   |
                   v
        Graceful handoff: "Let me connect
        you with Sawyer" + captures context
```

## Requirements

**Core Concierge**
- R1. Chat widget embedded on every page of seascape-vacations.com via a single script tag
- R2. AI responds to guest questions using a knowledge base built from: property database (5 homes, all verified amenities), 55+ local guides, area information, and booking policies
- R3. Responses must ONLY use verified facts from the knowledge base — never hallucinate amenities, prices, or property details (critical given past issues with false waterfront claims)
- R4. When the AI cannot confidently answer, it hands off gracefully — offers to email Sawyer or provides the phone number (941) 704-8545
- R5. Widget is non-intrusive — small corner bubble that expands on click, does not block content or hurt mobile UX

**Conversion Features**
- R6. Pre-booking answers include a soft CTA linking to the relevant property's booking page
- R7. When a guest describes what they want (dates, group size, pets, preferences), the concierge recommends the best-fit property with reasoning
- R8. Concierge is aware of which page the guest is currently viewing and uses that as context ("I see you're looking at our fishing vacation rentals — Dockside Dreams has a private dock on the bay")

**Knowledge & Accuracy**
- R9. Knowledge base is built from existing site content at build time — no manual curation needed beyond keeping the site content accurate
- R10. The concierge must respect the same accuracy rules as the site: never claim all homes are waterfront (only Dockside Dreams), never invent amenities, never say "all homes sleep 12+" (Bradenton Pool Home sleeps 10)
- R11. Local recommendations should match the site's genuine, opinionated tone — specific restaurant names, real tips, not generic travel advice

**Analytics & Learning**
- R12. Log all conversations (question + response + page URL) so Sawyer can see what guests ask most often
- R13. Unanswered or low-confidence questions surface as a report — these become content gaps to fill on the site (feeding back into SEO)

## Phase 2 (Fast Follow — Not in V1 Scope)
- Hostaway API integration for real-time availability and pricing checks
- SMS channel for post-booking guests
- Hostaway messaging integration for auto-responding to OTA inquiries
- Proactive suggestions ("Planning a fishing trip? Here's what our guests recommend...")

## Success Criteria
- Reduces Sawyer's daily guest inquiry volume by 30%+ within 60 days
- At least 5% of website chat interactions result in a click to a booking page
- Zero false claims about properties in concierge responses (verified by spot-checking logs weekly)
- Guests find it useful — measured by conversation completion rate (guest gets an answer vs. abandons)

## Scope Boundaries
- V1 is website chat widget only — no SMS, no Hostaway messaging integration
- V1 uses static knowledge base — no real-time API calls to Hostaway
- No payment processing or booking completion inside the chat — it directs to booking pages
- No user accounts or conversation history across sessions (keep it simple)
- Does not replace email/phone — it supplements them and reduces volume

## Key Decisions
- **Website widget first, other channels later**: Simplest to ship, directly impacts conversions, proves the AI "brain" before expanding to SMS/Hostaway
- **Static knowledge over live API in V1**: The property data changes rarely (5 homes, stable amenities). Real-time availability is high-value but adds complexity — better as a proven fast-follow
- **Build-time knowledge extraction**: Knowledge base is generated from existing site content during Eleventy build, not manually maintained. This means improving the site content automatically improves the concierge
- **Strict accuracy guardrails**: Given the March 2026 incident with false waterfront claims across 14 pages, the concierge must be constrained to verified facts only. This is a hard requirement, not a nice-to-have

## Dependencies / Assumptions
- Claude API (or similar) for the AI responses — requires an API key and usage budget
- Hosting for the API endpoint — could be Netlify Functions (serverless) to stay within existing infrastructure
- The existing site content is accurate enough to serve as a knowledge base (the March cleanup addressed the biggest issues)

## Outstanding Questions

### Resolve Before Planning
- [Affects R1, R5][User decision] What's the monthly budget ceiling for AI API costs? Chat interactions with Claude API typically cost $0.01-0.05 per conversation. At current traffic (~11-30 visitors/day, estimated 2-5 conversations/day), expect ~$2-10/month. Budget should account for growth.
- [Affects R12, R13][Architectural] Where to store conversation logs? The site is static (Eleventy + Netlify) with no database. This choice determines build complexity and whether R12/R13 are feasible in V1.

### Deferred to Planning
- [Affects R2][Technical] Best approach for knowledge base: RAG with embeddings vs. structured prompt with full context? Depends on total knowledge base size vs. context window limits
- [Affects R1][Technical] Chat widget framework: build custom vs. use an open-source widget (e.g., chatbot-ui) with custom backend?
- [Affects R8][Technical] How to pass current page URL/context to the API — query parameter, referrer header, or widget JavaScript?
- [Affects R12][Needs research] Where to store conversation logs — Netlify Functions + a lightweight DB (SQLite/Turso), or a managed service?
- [Affects R9][Technical] Build-time knowledge extraction: Eleventy plugin that processes all pages into a knowledge base JSON, or separate build step?

## Next Steps
→ Resume `/ce:brainstorm` to resolve the budget question, then `/ce:plan` for implementation planning
