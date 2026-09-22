---
name: seascape-aeo-evaluation
description: Use when running a TypeSafe-assisted AEO fixture evaluation, previewing approved external payloads, or producing shadow findings for Seascape.
---

# Seascape AEO Evaluation

Run a bounded, advisory comparison over the repository's AEO golden fixtures. This skill does not replace `npm run eval:aeo`, change a release gate, or prove that Seascape gained AI citations.

## Scope

- Repository: `seascape-vacations-site`.
- Inputs: only the checked-in non-guest fixtures under `scripts/evals/golden/aeo/`.
- Provider role: TypeSafe supplies five independent Score judgments over each fixture.
- Code role: the canonical rubric, weights, auto-fail patterns, expectation bands, arithmetic, and findings format stay deterministic.
- Output: a private temporary `findings.json` plus `findings.md`, both bound to the source commit and hashed payload manifest.

## Preflight

1. Read `docs/process/aeo-citability-rubric.md` and `scripts/evals/evals.config.json`.
2. Read the live TypeSafe API, Score, composite-scoring, and confidence documentation. Confirm the endpoint, `jev-latest` alias, response fields, and current input-token price before using a cost estimate.
3. Run the preview without credentials:

   ```bash
   eval_dir="$(mktemp -d)"
   printf 'AEO findings directory: %s\n' "$eval_dir"
   npm run eval:aeo:typesafe -- --preview --output "$eval_dir"
   ```

4. Inspect `$eval_dir/findings.md`. The manifest must name exactly three fixtures, five judgments per fixture, byte counts, and SHA-256 digests. A preview sends no request.

Stop if the fixture set contains guest data, credentials, live customer content, unapproved source text, or anything beyond the manifest's `copy` field.

## Credential and spend boundary

Use an existing `TYPESAFE_API_KEY` supplied through an approved secret channel to the process environment. The key stays out of Git, repo config, `.env` files, command arguments, findings, logs, and chat.

A missing key is a successful fail-closed result: the runner writes `BLOCKED_NO_CREDENTIAL` findings and sends nothing. Creating, saving, rotating, or revoking a key is a separate credential action. If a trial-specific key should be revoked, match its exact dashboard name and verify the post-action dashboard readback; suffixes and clipboard state are not proof.

Before every billed provider execution, confirm approval to transmit the three fixture copies and incur that run's bounded provider usage. A prior run's approval does not authorize a retry or later evaluation unless a separately approved aggregate cap and expiry cover it.

## Run

With the approved key already present in the environment, replace `<findings-directory>` with the directory printed during the preview (do not rely on a shell variable from an earlier tool call):

```bash
npm run eval:aeo:typesafe -- --output <findings-directory>
```

If current official pricing was verified during this run, add:

```bash
npm run eval:aeo:typesafe -- --output <findings-directory> --input-cost-per-million-usd <verified-current-rate>
```

Without a verified current rate, leave cost unset. Token usage and latency still remain measured.

## Interpret

Read both findings files and report:

- source commit, requested alias, and returned model version;
- fixture matches, per-dimension scores, and confidence;
- input tokens, latency, and cost only when its rate was freshly verified;
- credential lifecycle as `verified revoked`, `verified retained`, or `unresolved`;
- every mismatch, especially a high-quality fixture scored into a low band.

The result remains `SHADOW_ONLY` even at 3/3. Three fixtures are regression probes, not enough evidence to replace the canonical evaluator, gate releases, tune production copy automatically, or claim business impact.

## OpenSEO pairing

Use `openseo-review` before this skill only when current query, cited-source, competitor, or rank evidence is needed to choose the next representative fixture or explain a live citation gap. OpenSEO remains the measurement input; this skill remains the local semantic regression check.

For an unchanged fixture regression, run this skill alone. OpenSEO unavailability does not block it. Do not add OpenSEO rows, exports, or page observations to the TypeSafe payload without a new exact payload preview and approval.

## Completion

Complete only when the preview manifest is retained, the provider outcome or fail-closed state is recorded, both findings files exist with restrictive local permissions, no secret appears in them, and the recommendation states `keep shadow-only` or names the separate evidence needed for an adoption decision.
