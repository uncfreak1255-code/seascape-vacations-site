# DataForSEO Use-Case Packet

Date: 2026-06-18

Status: bounded decision packet. No live DataForSEO API calls were made while
writing this file. The credential path was checked separately with the repo's
no-API wrapper check.

## Decision

Enable `AI_OPTIMIZATION` and `BUSINESS_DATA` in the repo-local DataForSEO MCP.

This is not a new SEO operating system. It is a narrow expansion of the existing
DataForSEO MCP so the current five-role workflow can answer two questions it
already needs to answer:

1. Is Seascape cited or visible in AI-search-style answers for its real money
   pages?
2. Does Google understand Seascape and nearby competitors correctly as local
   businesses?

Keep `ONPAGE`, `CONTENT_ANALYSIS`, `APP_DATA`, `MERCHANT`, and broad extra
modules off for now. OnPage overlaps with local release checks unless a specific
external crawl gap repeats. Content Analysis is useful later for brand/citation
monitoring, but it is not needed for this first packet.

## Proof Lane

- Current site read is `fresh but below threshold`, so this packet does not open
  a new owner, stay, guide, GEO, or SEO expansion branch.
- DataForSEO is Gate 0 evidence only. It can name competitors, SERP shape,
  AI-source gaps, local entity gaps, and candidate briefs. It cannot authorize
  public claims, demand claims, impact claims, redirects, or page creation by
  itself.
- `seascape-analytics` still owns recurring pulls, GSC, GA4, joined receipts,
  AI-visibility measurement, and any readback that claims movement.

## Attack Lane

Use DataForSEO to make the next decision smaller:

1. Refresh live SERP and AI-search shape for the six core guest pages.
2. Run local/entity checks for Seascape and visible local competitors.
3. Run owner-money SERP and AI checks only to prepare candidate notes while the
   owner cluster remains below the threshold.
4. Use backlink and competitor-domain data only for specific link-gap or local
   citation work, not broad authority theater.

## First Tight Run

Run this in three passes. Stop after any pass that clearly answers the page's
job.

### Pass 1: Six Core Guest Pages

| Page | Page job | Primary query | DataForSEO surfaces | Decision it can support |
| --- | --- | --- | --- | --- |
| `/` | Brand/entity home and path into browsing | `seascape vacations` | SERP Organic, Business Data, Maps | Entity/GBP cleanup, not homepage rewrite by default |
| `/properties/` | Move broad shoppers into the right home or collection | `vacation rentals near anna maria island` | SERP Organic, AI Mode, LLM Mentions | Inventory angle, direct-book trust gap, or no change |
| `/stays/book-direct-anna-maria-island/` | Win book-direct intent without OTA fees | `book direct anna maria island vacation rentals` | SERP Organic, AI Mode, LLM Mentions | Answer/CTA clarity, not local-pack work unless Maps appears |
| `/stays/anna-maria-island-vacation-rentals/` | Match AMI stay intent with honest near-island value | `anna maria island vacation rentals` | SERP Organic, AI Mode, LLM Mentions, Maps if local pack appears | Regression rescue notes or direct-book handoff gaps |
| `/stays/bradenton-vacation-rentals-near-beaches/` | Sell Bradenton as the easier beach-access base | `bradenton vacation rentals near beaches` | SERP Organic, Maps, Local Finder | Local operator gap or city-angle fit |
| `/stays/sarasota-vacation-rentals-with-pool/` | Match Sarasota pool-home intent clearly | `sarasota vacation rentals with pool` | SERP Organic, Maps, Local Finder, AI Mode | Pool-home angle fit or Sarasota entity/local gap |

Record for each row:

- top 3 visible competitors or SERP types
- AI Overview or AI Mode source domains, when present
- whether OTAs, directories, local operators, or maps dominate the click path
- whether Seascape appears and which URL appears
- recommended action: `keep`, `candidate note`, `rescue brief`, `local entity
  work`, or `hold`

### Pass 2: Owner-Money Pages

| Page | Page job | Primary query | DataForSEO surfaces | Decision it can support |
| --- | --- | --- | --- | --- |
| `/property-management/vacation-rental-management-fees-florida/` | Explain fee ranges and owner economics | `vacation rental management fees Florida` | SERP Organic, Labs Keyword Overview, AI Keyword Data, LLM Mentions | Candidate notes for fee-range answer gaps |
| `/property-management/vacation-rental-licensing-florida/` | Answer licensing and DBPR intent | `vacation rental license Florida` | SERP Organic, Labs Keyword Overview, AI Mode | Source/proof notes and DBPR phrasing checks |
| `/property-management/vrbo-management-services-florida/` | Support channel-mix owner decisions | `VRBO management services Florida` | SERP Organic, Labs, LLM Mentions | Keep as support/conversion page unless demand proves more |
| `/property-management/vacation-rental-management-bradenton/` | Bradenton owner-service fit | `vacation rental management Bradenton` | SERP Organic, Maps, Local Finder, Business Data | Local trust and GBP/entity gap notes |
| `/property-management/vacation-rental-management-sarasota/` | Sarasota owner-service fit | `vacation rental management Sarasota` | SERP Organic, Maps, Local Finder, Business Data | Local trust and GBP/entity gap notes |
| `/property-management/vacation-rental-management-anna-maria-island/` | AMI-area owner-service fit | `Anna Maria Island property management` | SERP Organic, Maps, Local Finder, Business Data | Local proof and service-area clarity notes |

Do not rewrite titles, meta, or owner copy from these rows while owner-money
impressions remain below the current gate. The output should be candidate notes,
source checks, internal-link ideas, or an owner-outbound handoff, not public
claim movement.

### Pass 3: Local Entity And Competitor Truth

Use `BUSINESS_DATA` for:

- Seascape Google Business Profile title, category, description, phone, domain,
  booking/contact URL, photo count, claimed status, rating, and review count.
- Review themes that can inform internal proof or FAQ notes only when the claim
  is visible and compliant.
- Competitor GBP comparison for local operators that repeatedly appear in Maps,
  Local Finder, or organic SERPs.
- Q&A and updates checks when a local SERP or AI result suggests Google is
  answering from stale business data.

Do not use Business Data to scrape private contacts, create guessed owner
prospects, or count owner demand. Owner prospect work stays inside the outbound
rules and must avoid private or guessed contact data.

## What Is Underused Now

1. `AI_OPTIMIZATION`: should be used for LLM Mentions and AI Keyword Data on the
   six guest pages and the three owner-money pages before more copy is written.
2. `BUSINESS_DATA`: should be used for GBP/local entity truth, especially the
   Business Info, Reviews, Q&A, and Updates flows visible in the DataForSEO UI.
3. `BACKLINKS`: already enabled, but it should be turned into a specific link
   intersection run against recurring local operators and directories.
4. `SERP` Maps and Local Finder: already available through SERP, but not
   promoted clearly enough in the repo workflow.

## What Stays Out

- No recurring DataForSEO jobs in this repo.
- No analytics receipts in this repo.
- No new page volume from DataForSEO volume alone.
- No public owner-demand, direct-booking, revenue, or AI-visibility claims
  without source proof or a current `seascape-analytics` receipt.
- No new SEO personas. The existing five roles are enough.

## First Reader Output

Each run should produce one compact row per page:

```text
Page:
Query:
SERP shape:
AI/local pressure:
Top competitors:
Seascape visible:
Gap:
Action:
Owner repo:
Receipt path:
```

`Action` must be one of:

- `keep`
- `candidate note`
- `rescue brief`
- `local entity work`
- `analytics reread`
- `hold`

## Implementation Notes

This branch enables the two missing modules in the project MCP:

- `AI_OPTIMIZATION`
- `BUSINESS_DATA`

The no-API check remains the proof that credentials can be resolved without
printing secrets or spending DataForSEO credits.
