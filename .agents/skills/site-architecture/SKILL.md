---
name: site-architecture
description: Use when planning site architecture, navigation, URL hierarchy, or visual sitemaps; excludes XML sitemaps.
metadata:
  version: 1.1.0
---

# Site Architecture

Plan page hierarchy, navigation, URLs, breadcrumbs, and internal links so the
intended audience can find important pages and complete its task.

## Scope and constraints

Ground the plan in existing routes, the active brief, and `docs/portfolio/`.
Use `next-batch-gate` for proposed Seascape expansion; a hierarchy proposal does
not authorize new pages. Ask for missing audience or goal choices only when
they change the plan.

Preserve established URL conventions and useful existing URLs. For moved
routes, specify redirects and update dependent links, canonicals, and
breadcrumbs. Prefer a clear, shallow structure without forcing a click-depth,
menu-size, or links-per-word quota. Important indexable pages need contextual
inbound paths; footer links alone are not the remediation plan.

- For family/page inbound gaps and donor priorities, use `internal-link-targeting`.
- For breadcrumb JSON-LD, use `schema-markup`.
- For XML sitemap or crawl errors, use the existing technical source and
  Search Operator lane; this skill does not perform a general SEO audit.
- Shared header/footer/navigation changes also need a fresh build and
  `node --test scripts/enforcement/internal-link-floor.test.js`, plus the
  design workflow for visible changes.

## Conditional references

- [Navigation patterns](references/navigation-patterns.md): when choosing a
  header, footer, sidebar, breadcrumb, or mobile navigation pattern.
- [Site-type templates](references/site-type-templates.md): when a new hierarchy
  needs a starting example. These are donor examples, not Seascape page mandates.
- [Mermaid templates](references/mermaid-templates.md): when a visual sitemap or
  relationship diagram helps review the plan.

## Completion

A full architecture plan includes hierarchy, URL/parent/navigation/priority map,
navigation specification, internal-link plan, and a visual sitemap. A narrow
URL or navigation request needs only the relevant deliverables. Use a tree or
diagram that makes the relationships clear rather than duplicating formats.

Planning is read-only. When implementation is authorized, complete the affected
redirect, link, schema, and rendered checks and repair in-scope failures.
