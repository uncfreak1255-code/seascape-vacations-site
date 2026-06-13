# AI-SEO Stack Audit — condensed (2026-06-13)

Durable summary of the whole-stack AI-SEO/AEO/GEO audit run on 2026-06-13. Full
research lived in the session that produced this note; this is the reference
copy plus the source list. Backs the batch brief
`docs/briefs/2026-06-ai-seo-quality-rubric.md`.

## Verdict

**Partially — strongest on safety, weakest on upside.** For owner-acquisition
(#1) and direct-book conversion (#2) the stack is well-tuned: the banned-phrase
linter + "No Brief, No Writing" gate + owner-proof-integrity stat-binding are an
unusually disciplined defense against the failure modes that sink AI-SEO
programs (slop, fabricated stats, page sprawl). For *winning AI-engine citations
and ranking under the information-gain era*, it is **not** best-achievable,
because it is all negative gate with **no positive quality rubric**, and the one
piece that could push toward citation-rewarded structure (`humanizer`) is in
mild tension with what AEO rewards.

## 2026 best-practice baseline

- **Information gain** is now a heavily-weighted ranking signal (Google
  "Contextual Estimation of Link Information Gain" patent, US20200349181A1):
  novel contribution beyond what the reader already saw; duplication penalized.
- **AI-citation pattern:** answer-first extractable structure (40-60-word
  answer blocks; core answer in first ~200 words — ~55% of AI-Overview
  citations come from the first 30% of content), tables for comparison queries,
  named-source statistical density, freshness (~83% of AI citations are pages
  updated <12 months), schema as an *extraction* aid (Google retired FAQ/HowTo
  rich-result display in 2025, but the markup still aids parsing).
- **LLM-as-judge is the actual selection mechanism** — candidate sources scored
  on helpfulness/relevance/reliability/completeness/coherence/extractability. A
  rubric-based positive eval is therefore current best practice.
- **llms.txt is likely overrated** as a citation lever (crawlers mostly skip it;
  real value is agent routing). The repo already ships one — treat as agent
  hygiene, not AEO.

## Repo gaps (vs that baseline)

1. **No positive quality rubric (biggest gap).** A page can pass `lint:content`
   and still be a derivative, citation-invisible restatement. Nothing scores
   information gain, intent coverage, answer-extractability, or
   citation-worthiness.
2. **AEO citation-worthiness eval accidentally deferred to analytics.**
   Deferring GSC/GA4 *analytics* to the analytics repo is correct, but
   "is this draft structured to be extracted and cited" is an *authoring-time*
   check (answer-block presence, answer-in-first-200-words, table-for-comparison,
   named-source density) — it belongs at draft time, not in the analytics repo.
3. **Ungoverned, unpinned voice chain.** `enterprise-ui-writing` and `humanizer`
   are global, unversioned skills; enforcement only checks the three skill
   *names* appear in order in workflow docs — never that they ran or improved
   output. An ungoverned dependency sits on the critical copy path, against the
   repo's own "governed, not reflexive" doctrine.
4. **`humanizer` vs AEO formatting tension (medium confidence).** Citation data
   favors structured, scannable, declarative content; a humanizer tuned for
   conversational warmth can push away from extractability on guide/stay pages
   where citation matters most. Unverifiable from the repo because the skill is
   unversioned.

## Strengths (keep)

The deterministic banned-phrase linter (runs in CI, actually blocks), the
owner-proof stat-binding (best-in-class for citation reliability), and the
"No Brief, No Writing" + page-volume freeze (forces depth over volume, exactly
what both the novelty signal and AEO completeness reward).

## Banned donor packs — re-evaluation

All six are real and actively maintained in mid-2026. The install bans are
mostly still correct (each pack reintroduces sprawl, hosted lock-in, or the
analytics layer the repo deliberately externalized). The policy's flaw is
binary: "don't install" silently became "don't learn from," so the repo never
harvested the positive-rubric IP inside the donors it correctly refuses to
install. The repo bar — "repeated site-specific need + smoke-tested win, not
novelty" — supports **harvesting ideas, not installing**.

| Pack | 2026 status | Verdict |
|---|---|---|
| geo-optimizer-skill (Auriti-Labs) | v4.14, very active, 468★ | Keep banned; harvest its 8-category authoring scorecard |
| claude-seo (AgricIDaniel) | v2.2, 8.8k★, very active | Keep banned (25 skills + 18 agents = sprawl); harvest its QRG-aligned E-E-A-T gate + passage-citability scorer |
| gtm-engineer-skills (onvoyage-ai) | active, 1.2k★ | Keep banned; replicate its deterministic zero-dependency 16-check AEO crawler pattern |
| aeo.js (multivmlabs) | active, modest | Keep banned — redundant (Eleventy already builds these), zero content upside |
| searchstack-aeo / akii | unverified in 2026 | Keep banned (low confidence — no verified maintenance, no site-specific need) |

## searchfit

Real and credible (free MIT Claude Code plugin `searchfit-seo`: 11 skills, 3
agents + a paid AEO-tracking SaaS at searchfit.ai). **Do not install** — it
heavily overlaps and would reintroduce the sprawl the repo bans (its
schema/internal-linking/content-brief skills duplicate existing local skills),
and its content generator bypasses the negative linter. Its one additive idea
(competitor-differentiation / AI-visibility) is better as a small local
advisory eval. Adoption signals are modest and its AI-visibility mechanism is
undocumented (the directory's "6,168 installs" is contradicted by ~3 GitHub
stars / 0 GitHub-App / <10 WordPress installs).

## Recommendations

Do-now (this batch):
1. Add an advisory-first LLM-as-judge content rubric (one local skill, no CI
   block yet) scoring drafts on the 2026 citation dimensions. Harvest criteria
   from claude-seo + geo-optimizer without installing them. **Control-plane
   change — gate behind `agent-surface-audit` + explicit approval.**
2. Pin/vendor `enterprise-ui-writing` + `humanizer` into the repo and add a
   smoke test that they actually ran on changed copy. **Control-plane change —
   same gate.**
3. Add a `humanizer`↔AEO reconciliation rule: humanizer may not dissolve answer
   blocks, comparison tables, or first-200-word answers on guide/stay
   (citation-target) content. **Doc rule, no control-plane change — safe to
   ship now.**

Defer: `agent-surface-audit` on benched `seo-geo`/`ai-seo` to promote authoring
tactics (keep measurement benched); a deterministic local `aeo-audit` script
(gtm-engineer pattern), gated on Rec 1 showing repeated need.

Keep as-is: the install bans, page-volume freeze, owner-proof-integrity, the
negative linter, llms.txt-as-hygiene.

**Honest caveat:** Recs 1/4/5 add authoring surface — the exact thing the
anti-sprawl doctrine guards. Keep them advisory and singular (one rubric skill,
not a pack) to stay inside the ≤2 hr/week ceiling.

## Sources

- Google Information Gain patent (US20200349181A1) coverage — Search Engine
  Journal (searchenginejournal.com/googles-information-gain-patent-for-ranking-web-pages/524464/),
  DigitalApplied, Hobo Web.
- AEO citation-format studies — Search Engine Journal
  (aeo-in-2026-which-content-formats-earn-ai-citations), Yotpo
  (yotpo.com/blog/chatgpt-seo-geo-tips/), Ritner Digital.
- LLM-as-judge eval guidance — Confident AI
  (confident-ai.com/blog/why-llm-as-a-judge-is-the-best-llm-evaluation-method),
  Langfuse (langfuse.com/docs/evaluation/evaluation-methods/llm-as-a-judge),
  Lumar (lumar.io/blog/best-practice/aeo-geo-content-quality-how-ai-chooses-sources-llm-as-a-judge/).
- llms.txt skepticism — Contentful
  (contentful.com/blog/llms-txt-search-visibility/), ALLMO.
- Donor packs (fetched directly): github.com/Auriti-Labs/geo-optimizer-skill,
  github.com/AgricIDaniel/claude-seo, github.com/onvoyage-ai/gtm-engineer-skills,
  github.com/multivmlabs/aeo.js.
- searchfit: github.com/searchfit/searchfit-seo, searchfit.ai,
  claude.com/plugins/searchfit-seo.
- GEO research spine: Aggarwal et al., "GEO: Generative Engine Optimization,"
  KDD 2024 (arXiv:2311.09735) — cited by several donor packs; treat as one
  source, not independent validation.

**Low-confidence flags:** searchstack-aeo and akii could not be resolved to
authoritative 2026 sources; the `humanizer`↔AEO tension is inferred from the
skill's purpose + AEO formatting data, not measured; searchfit's AI-visibility
mechanism is undocumented.
