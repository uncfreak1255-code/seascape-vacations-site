# SEO GEO Remediation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Validate live SEO state, remediate high-impact GEO/content gaps on priority pages, and operationalize the March 15 strategy docs without redesigning the site.

**Architecture:** Use live-site validation to identify the delta since the March 15 audit, then fix reusable template/content patterns in Eleventy source so the improvements survive rebuilds and deploys. Keep design frozen except for low-risk content/layout polish required to improve clarity, citations, and internal linking.

**Tech Stack:** Eleventy, Nunjucks, Node.js verification scripts, Netlify static deploy

---

## Chunk 1: Validation
- [ ] Audit live priority URLs and technical files
- [ ] Compare live findings to March 15 audit and current source

## Chunk 2: GEO / SEO Remediation
- [ ] Fix template-level metadata, schema, and answer-block structure issues
- [ ] Improve internal linking on priority guides and commercial pages
- [ ] Add/update reusable audit guards where regression risk is high

## Chunk 3: Strategy Execution Assets
- [ ] Turn backlink/outreach docs into trackable operating assets inside the repo
- [ ] Add a short execution checklist for weekly outreach/link work

## Chunk 4: Verification
- [ ] Build the site and run release/recovery verification
- [ ] Summarize remaining live risks and next wave work
