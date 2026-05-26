# AI Citation Audit

Use this when the job is not just ranking in search, but being cited or summarized correctly in AI answers.

## Scorecard

- `Discoverable`: can the assistant find the right page from a plain-language prompt.
- `Citable`: does one page answer the question in a clean sentence without needing extra internal context.
- `Consistent`: do the page, schema, proof note, and entity details agree.
- `Actionable`: does the answer lead cleanly into the right next step or route.

## Audit Loop

- Capture the exact prompts used for ChatGPT, Claude, Gemini, Perplexity, or other assistants.
- Log which URL, if any, each system cited.
- Note the wrong page, missing proof, wrong entity detail, or missing next step when the answer fails.
- Write a small fix pack: page copy, proof note, schema, internal link, or canonical cleanup.
- Re-run the same prompts after the fix and keep the before/after receipt together.

## Lost Prompt Log

- Keep a flat list of prompts that should have cited Seascape but did not.
- For each prompt, record the expected winner URL, the actual cited URL, and the likely failure mode.
- Do not mark a prompt fixed until the same prompt has been rerun.
