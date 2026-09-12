---
name: accessibility
description: Use when auditing or fixing Seascape accessibility, including WCAG, screen reader, and keyboard navigation behavior.
license: MIT
metadata:
  author: web-quality-skills
  version: "1.0"
---

# Accessibility

Audit or fix the requested Seascape surface against WCAG 2.1 A/AA. AAA criteria
are additional guidance when requested. Prefer native HTML controls and the
existing design system over custom ARIA or new styles.

## Choose the relevant reference

- For criterion coverage or conformance questions, use [WCAG.md](references/WCAG.md).
- For component implementation details, use [component-patterns.md](references/component-patterns.md).
- For interactive behavior or a full manual audit, use [manual-checks.md](references/manual-checks.md).
- For visual changes, follow `DESIGN.md` and `docs/process/design-review-workflow.md`.

Automated axe checks cannot establish full accessibility. Pair the affected
repo checks with keyboard and assistive-technology evidence for the behavior
claimed. Use the installed Playwright/axe tools; global installation is not
part of this skill.

## Completion

An audit returns findings ordered by user impact: critical, serious, moderate,
or minor. Include route, viewport, browser/assistive technology, current and
expected behavior, evidence, and the smallest fix. State coverage limits when
manual proof is unavailable; do not label untested behavior accessible.

For an authorized fix, continue through the affected checks and correction of
in-scope failures. Report the resulting behavior and remaining limitations.
