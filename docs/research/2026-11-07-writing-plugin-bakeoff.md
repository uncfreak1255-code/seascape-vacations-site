# Writing plugin bake-off: guides hub teaser lines

Date: 2026-11-07. Asked by Sawyer, who said agent-written teaser lines on
`/guides/` read as AI-written and approved loading any writing plugin to test.
Feeds fix 4 of `docs/briefs/2026-11-guides-index-label-cleanup.md`.

## Method

Six `claude -p` runs, one per arm, read-only, same prompt, same four lines:
the Bradenton vs Sarasota featured excerpt, the Anna Maria Island vs Siesta Key
excerpt, the booking-direct excerpt and the hurricane Start Here description.
Every arm read `docs/style/voice.md`, `banned-patterns.md` and
`approved-examples.md`, read the linked guide, wrote each line from the guide's
own conclusion and quoted the guide sentence behind it. Plugins were installed
at local scope in this worktree only. The run's stream log confirmed each
plugin arm called its skill.

| Arm | Skill loaded | Publisher |
| --- | --- | --- |
| baseline | none | — |
| marketing | `marketing:draft-content`, then `marketing:brand-review` | Anthropic |
| brand-voice | `brand-voice:brand-voice-enforcement` | Tribe AI (in Anthropic's plugin repo) |
| anti-ai-writing | `anti-ai-writing:anti-ai-writing` | community |
| writing-quality | `writing-quality:writing-quality-router` | community |
| writing-skills | `writing-skills:plain-language` | partner |

"Website Copywriting & Positioning" (community) could not be installed by name
from the CLI and was not tested. Compound Writing is enabled for Codex only and
was not run.

## Result

The plugins made little difference. All six arms produced lines with the same
structure and the same facts, because the prompt made each one start from the
guide's verdict and quote it. Examples for the featured card:

- baseline: "Stay on the Bradenton side for Anna Maria Island beach days, or the
  Sarasota side for Siesta, Lido and The Ringling. Then check the exact address
  and full price."
- anti-ai-writing: "Want Anna Maria Island beach days? Look on the Bradenton
  side. Planning around Siesta Key or Lido Key? Look in Sarasota, then check the
  exact address and final price."
- plain-language: "Stay on the Bradenton side for Anna Maria Island beach days,
  or the Sarasota side for Siesta Key, Lido and St. Armands. Then check the
  address and final price."

Small differences: plain-language was the only arm to open the booking-direct
line with the guide's own "There's no fixed saving", and it added the guide's
hurricane season dates. brand-voice and writing-quality added "storms usually
give several days' warning", which paraphrases "forecast lead times" more
loosely than the others. No arm invented a number.

All six arms independently flagged the same claim problem: the hub card title
"Why Booking Direct Saves You Hundreds" contradicts its guide, whose FAQ answer
reads "There is no fixed saving."

Cost: about $0.63 to $0.72 per arm, about $4.04 in all (reported by
`claude -p`).

## Conclusion

What made the old lines sound like AI was missing input, not a missing skill.
They were written without the guide's verdict in hand, so they described the
guide in the abstract. The method that fixed it in every arm was to read the
linked page, take its conclusion and quote the sentence behind each line. The
brief's fix 4 already requires that. No plugin is adopted from this test; the
site's existing lane (`docs/style/`, content lint, Voice Editor) stays the
authority. On one small sample, plain-language came out slightly ahead on
staying close to the source.

Limits: one run per arm, four short lines, judged by the agent that ran the
test rather than a blind reviewer.
