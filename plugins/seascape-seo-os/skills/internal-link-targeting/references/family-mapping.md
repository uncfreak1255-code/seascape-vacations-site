# Family Mapping

Default URL prefix mapping:

- `/property-management/` -> `owner`
- `/guides/` -> `guide`
- `/stays/` -> `stay`
- `/research/` -> `research`
- everything else -> `other`

If route ownership changes, update
`.agents/skills/internal-link-targeting/scripts/analyze_internal_link_graph.py`.
