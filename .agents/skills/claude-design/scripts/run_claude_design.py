#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
from pathlib import Path
import subprocess
import sys
from typing import Iterable


DESIGN_URL = "https://claude.ai/design"


HANDOFF_PROPERTIES = {
    "transport": {
        "type": "string",
        "enum": ["claude-code-chrome-to-claude-ai-design"],
    },
    "workspace_status": {
        "type": "string",
        "enum": ["design-created", "design-updated", "design-reviewed", "workspace-reached-no-artifact"],
    },
    "workspace_url": {"type": "string"},
    "artifact_name": {"type": "string"},
    "design_system_status": {
        "type": "string",
        "enum": [
            "used-existing-design-system",
            "existing-design-system-not-visible",
            "not-applicable",
            "unknown",
        ],
    },
    "notes": {"type": "string"},
}


BASE_PROPERTIES = {
    "task_type": {
        "type": "string",
        "enum": ["explore", "critique", "compare", "implementation-spec"],
    },
    "objective": {"type": "string"},
    "current_state": {"type": "string"},
    "directions": {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "summary": {"type": "string"},
                "rationale": {"type": "string"},
                "key_moves": {"type": "array", "items": {"type": "string"}},
                "risks": {"type": "array", "items": {"type": "string"}},
                "references": {"type": "array", "items": {"type": "string"}},
            },
            "required": ["name", "summary", "rationale", "key_moves", "risks", "references"],
            "additionalProperties": False,
        },
    },
    "critique_findings": {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "severity": {"type": "string", "enum": ["high", "medium", "low"]},
                "issue": {"type": "string"},
                "why_it_matters": {"type": "string"},
                "suggested_fix": {"type": "string"},
            },
            "required": ["severity", "issue", "why_it_matters", "suggested_fix"],
            "additionalProperties": False,
        },
    },
    "recommended_direction": {"type": "string"},
    "implementation_brief": {
        "type": "object",
        "properties": {
            "layout": {"type": "string"},
            "typography": {"type": "string"},
            "color": {"type": "string"},
            "components": {"type": "array", "items": {"type": "string"}},
            "states": {"type": "array", "items": {"type": "string"}},
            "constraints": {"type": "array", "items": {"type": "string"}},
            "asset_notes": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["layout", "typography", "color", "components", "states", "constraints", "asset_notes"],
        "additionalProperties": False,
    },
    "questions": {"type": "array", "items": {"type": "string"}},
    "risks": {"type": "array", "items": {"type": "string"}},
    "handoff": {
        "type": "object",
        "properties": HANDOFF_PROPERTIES,
        "required": ["transport", "workspace_status", "workspace_url", "artifact_name", "design_system_status", "notes"],
        "additionalProperties": False,
    },
    "readiness": {
        "type": "string",
        "enum": ["needs-more-input", "design-ready-for-user-decision", "ready-for-codex-implementation"],
    },
    "next_codex_action": {"type": "string"},
}


PREFLIGHT_SCHEMA = {
    "type": "object",
    "properties": {
        "chrome_integration": {"type": "string", "enum": ["available", "unavailable"]},
        "design_workspace": {"type": "string", "enum": ["loaded", "signed_out", "blocked", "missing_access", "unknown"]},
        "workspace_summary": {"type": "string"},
        "design_system_visibility": {"type": "string", "enum": ["visible", "not_visible", "unknown"]},
    },
    "required": ["chrome_integration", "design_workspace", "workspace_summary", "design_system_visibility"],
    "additionalProperties": False,
}


def build_schema(mode: str) -> dict:
    required = [
        "task_type",
        "objective",
        "current_state",
        "recommended_direction",
        "implementation_brief",
        "questions",
        "risks",
        "handoff",
        "readiness",
        "next_codex_action",
    ]
    if mode in {"explore", "compare", "implementation-spec"}:
        required.append("directions")
    if mode == "critique":
        required.append("critique_findings")
    return {
        "type": "object",
        "properties": BASE_PROPERTIES,
        "required": required,
        "additionalProperties": False,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the Claude design bridge and capture structured output.")
    parser.add_argument("--repo", required=True, help="Absolute or relative path to the target repo.")
    parser.add_argument(
        "--mode",
        required=True,
        choices=["explore", "critique", "compare", "implementation-spec"],
        help="Claude design task mode.",
    )
    parser.add_argument("--task", required=True, help="Concrete design objective.")
    parser.add_argument(
        "--context",
        action="append",
        default=[],
        help="Relative or absolute file/dir path Claude should inspect first. Repeatable.",
    )
    parser.add_argument(
        "--summary",
        action="append",
        default=[],
        help="Codex-compressed summary of the relevant surface. Repeatable.",
    )
    parser.add_argument(
        "--constraint",
        action="append",
        default=[],
        help="Hard constraint to include in the packet. Repeatable.",
    )
    parser.add_argument("--output", help="Optional JSON output path.")
    parser.add_argument("--markdown-out", help="Optional markdown rendering output path.")
    parser.add_argument("--model", default="sonnet", help="Claude model alias or full name.")
    parser.add_argument(
        "--effort",
        default="low",
        choices=["low", "medium", "high", "xhigh", "max"],
        help="Claude reasoning effort. Low is the default for fast design packets.",
    )
    parser.add_argument("--max-budget-usd", type=float, default=1.0, help="Claude Design handoff budget cap.")
    parser.add_argument(
        "--context-limit-chars",
        type=int,
        default=2500,
        help="Max characters to inline per context file before truncation.",
    )
    parser.add_argument(
        "--timeout-seconds",
        type=int,
        default=300,
        help="Hard timeout for the Claude Design browser handoff.",
    )
    return parser.parse_args()


def resolve_paths(repo: Path, items: Iterable[str]) -> list[Path]:
    resolved: list[Path] = []
    for item in items:
        path = Path(item).expanduser()
        if not path.is_absolute():
            path = repo / path
        resolved.append(path.resolve())
    return resolved


def render_list(items: Iterable[str]) -> str:
    values = list(items)
    if not values:
        return "- none provided"
    return "\n".join(f"- {item}" for item in values)


def snapshot_text(text: str, limit: int) -> str:
    if len(text) <= limit:
        return text
    head = text[: int(limit * 0.65)].rstrip()
    tail = text[-int(limit * 0.25) :].lstrip()
    return f"{head}\n\n...[truncated for prompt budget]...\n\n{tail}"


def build_context_snapshot(repo: Path, path: Path, limit: int) -> str:
    rel = path.relative_to(repo) if path.is_relative_to(repo) else path
    if path.is_dir():
        children = sorted(item.relative_to(path) for item in path.rglob("*") if item.is_file())
        preview = "\n".join(f"- {item}" for item in children[:40]) or "- empty directory"
        return f"### {rel}\n(directory listing)\n{preview}"
    text = path.read_text(encoding="utf-8", errors="replace")
    if path.suffix.lower() in {".md", ".txt", ".css"}:
        snippet = text[:limit]
    else:
        snippet = snapshot_text(text, limit)
    return f"### {rel}\n```text\n{snippet}\n```"


def build_design_brief(
    args: argparse.Namespace,
    repo: Path,
    contexts: list[Path],
    summaries: list[str],
    constraints: list[str],
    context_limit_chars: int,
) -> str:
    context_lines = "\n".join(f"- {path}" for path in contexts) if contexts else "- none provided"
    constraint_lines = render_list(constraints)
    summary_blocks = render_list(summaries)
    context_blocks = "\n\n".join(build_context_snapshot(repo, path, context_limit_chars) for path in contexts)
    if not context_blocks:
        context_blocks = "No repo files were provided."
    return f"""Claude Design handoff brief

Mode: {args.mode}
Objective: {args.task}
Owning repo: {repo}

Relevant repo files:
{context_lines}

Hard constraints:
{constraint_lines}

Codex summary of the current surface:
{summary_blocks}

Embedded repo context:
{context_blocks}

Deliverables:
- 2-3 distinct directions or critique findings as appropriate for the mode
- one recommended direction
- an implementation-ready brief that Codex can build from
- explicit mobile/state coverage
- explicit callout of whether the existing Seascape design system was visible and used

Rules:
- stay grounded in the provided repo truth
- do not invent repo tokens, assets, or conventions
- if the Seascape design system is not visible in this workspace, say so plainly
- no code output
"""


def build_prompt(
    args: argparse.Namespace,
    repo: Path,
    contexts: list[Path],
    summaries: list[str],
    constraints: list[str],
    context_limit_chars: int,
) -> str:
    context_lines = "\n".join(f"- {path}" for path in contexts) if contexts else "- none provided"
    context_blocks = "\n\n".join(build_context_snapshot(repo, path, context_limit_chars) for path in contexts)
    if not context_blocks:
        context_blocks = "No repo files were provided."
    design_brief = build_design_brief(args, repo, contexts, summaries, constraints, context_limit_chars)
    return f"""/claude-design

This is a Codex-orchestrated browser handoff into Claude Design.
You must use the connected Chrome browser and the user's Claude Design workspace at
{DESIGN_URL}. Do not answer from Claude Code alone.

Mode: {args.mode}
Objective: {args.task}
Owning repo: {repo}

Inspect these repo files or directories first:
{context_lines}

Exact brief to send into Claude Design:
```text
{design_brief}
```

Embedded repo context follows. Use this to keep the browser handoff grounded.
{context_blocks}

Rules:
- Open {DESIGN_URL} in the connected Chrome browser before doing design work.
- Use Claude Design itself to generate or review the design, then summarize the result back here.
- If the page is unreachable, signed out, blocked, or missing, do not fake the handoff.
- If the Seascape design system is not visible in the Claude Design workspace, say so plainly in `handoff.design_system_status`, `questions`, and `risks`.
- Design thinking only. Do not write or edit code.
- Stay grounded in the provided repo truth. If context is missing, say so.
- Give distinct directions when in explore mode.
- Make the implementation brief concrete enough for Codex to build.
- Cover responsive and interaction/state implications when they matter.
- Return valid JSON matching the provided schema exactly.
"""


def build_claude_command(prompt: str, model: str, effort: str, max_budget: float, schema: dict) -> list[str]:
    return [
        "claude",
        "--chrome",
        "-p",
        prompt,
        "--model",
        model,
        "--effort",
        effort,
        "--output-format",
        "json",
        "--json-schema",
        json.dumps(schema),
        "--max-budget-usd",
        str(max_budget),
        "--tools",
        "",
    ]


def run_claude_json(
    cmd: list[str],
    repo: Path,
    timeout_seconds: int,
) -> dict:
    try:
        completed = subprocess.run(
            cmd,
            cwd=repo,
            capture_output=True,
            text=True,
            check=False,
            timeout=timeout_seconds,
        )
    except subprocess.TimeoutExpired as exc:
        raise RuntimeError(f"Claude browser handoff timed out after {timeout_seconds}s.") from exc
    if completed.returncode != 0:
        raise RuntimeError(completed.stderr.strip() or completed.stdout.strip() or "Claude browser handoff failed.")
    try:
        raw = json.loads(completed.stdout)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Claude browser handoff returned invalid JSON: {exc}") from exc
    return normalize_response(raw)


def build_preflight_prompt() -> str:
    return f"""Claude Design web handoff preflight.

Use the connected Chrome browser.
1. Confirm the Chrome integration is available.
2. Open {DESIGN_URL}.
3. Determine whether the Claude Design workspace loads in a signed-in state.
4. Determine whether a recent-projects or workspace surface is visible.
5. Note whether an existing design-system surface appears visible from this landing state.

Return JSON only.
"""


def ensure_web_handoff_ready(
    repo: Path,
    model: str,
    effort: str,
    max_budget: float,
    timeout_seconds: int,
) -> dict:
    payload = run_claude_json(
        build_claude_command(build_preflight_prompt(), model, effort, max_budget, PREFLIGHT_SCHEMA),
        repo,
        timeout_seconds,
    )
    if payload.get("chrome_integration") != "available":
        raise RuntimeError("Claude Design handoff blocked: Claude in Chrome is not connected for this shell session.")
    if payload.get("design_workspace") != "loaded":
        raise RuntimeError(
            "Claude Design handoff blocked: "
            f"{payload.get('workspace_summary', 'the Design workspace did not load in a signed-in state.')}"
        )
    return payload


def run_claude(
    prompt: str,
    repo: Path,
    model: str,
    effort: str,
    max_budget: float,
    timeout_seconds: int,
    schema: dict,
) -> dict:
    return run_claude_json(build_claude_command(prompt, model, effort, max_budget, schema), repo, timeout_seconds)


def normalize_response(raw: dict) -> dict:
    if isinstance(raw, dict) and isinstance(raw.get("structured_output"), dict):
        payload = dict(raw["structured_output"])
        payload["_meta"] = {
            "duration_ms": raw.get("duration_ms"),
            "total_cost_usd": raw.get("total_cost_usd"),
            "model_usage": raw.get("modelUsage"),
            "session_id": raw.get("session_id"),
        }
        return payload
    return raw


def render_markdown(payload: dict) -> str:
    meta = payload.get("_meta") or {}
    lines = [
        f"# Claude Design: {payload['objective']}",
        f"- Mode: {payload['task_type']}",
        f"- Readiness: {payload['readiness']}",
        *(
            [
                f"- Duration: {meta['duration_ms']} ms",
                f"- Cost: ${meta['total_cost_usd']:.4f}",
            ]
            if meta.get("duration_ms") is not None and meta.get("total_cost_usd") is not None
            else []
        ),
        "",
        "## Handoff",
        f"- Transport: {payload['handoff']['transport']}",
        f"- Workspace status: {payload['handoff']['workspace_status']}",
        f"- Workspace URL: {payload['handoff']['workspace_url']}",
        f"- Artifact: {payload['handoff']['artifact_name']}",
        f"- Design system: {payload['handoff']['design_system_status']}",
        f"- Notes: {payload['handoff']['notes']}",
        "",
        "## Current State",
        payload["current_state"],
        "",
    ]
    if payload.get("directions"):
        lines.append("## Directions")
        for direction in payload["directions"]:
            lines.extend(
                [
                    f"### {direction['name']}",
                    direction["summary"],
                    "",
                    f"Why: {direction['rationale']}",
                    "",
                    "Key moves:",
                ]
            )
            lines.extend(f"- {item}" for item in direction["key_moves"])
            if direction["risks"]:
                lines.append("")
                lines.append("Risks:")
                lines.extend(f"- {item}" for item in direction["risks"])
            lines.append("")
    if payload.get("critique_findings"):
        lines.append("## Critique Findings")
        for finding in payload["critique_findings"]:
            lines.extend(
                [
                    f"- [{finding['severity']}] {finding['issue']}: {finding['why_it_matters']} -> {finding['suggested_fix']}",
                ]
            )
        lines.append("")
    lines.extend(
        [
            "## Recommended Direction",
            payload["recommended_direction"],
            "",
            "## Implementation Brief",
            f"Layout: {payload['implementation_brief']['layout']}",
            f"Typography: {payload['implementation_brief']['typography']}",
            f"Color: {payload['implementation_brief']['color']}",
            "Components:",
        ]
    )
    lines.extend(f"- {item}" for item in payload["implementation_brief"]["components"])
    lines.extend(["", "States:"])
    lines.extend(f"- {item}" for item in payload["implementation_brief"]["states"])
    lines.extend(["", "Constraints:"])
    lines.extend(f"- {item}" for item in payload["implementation_brief"]["constraints"])
    if payload["implementation_brief"]["asset_notes"]:
        lines.extend(["", "Asset Notes:"])
        lines.extend(f"- {item}" for item in payload["implementation_brief"]["asset_notes"])
    if payload["questions"]:
        lines.extend(["", "## Questions"])
        lines.extend(f"- {item}" for item in payload["questions"])
    if payload["risks"]:
        lines.extend(["", "## Risks"])
        lines.extend(f"- {item}" for item in payload["risks"])
    lines.extend(["", "## Next Codex Action", payload["next_codex_action"]])
    return "\n".join(lines).strip() + "\n"


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def main() -> int:
    args = parse_args()
    repo = Path(args.repo).expanduser().resolve()
    if not repo.exists():
        raise SystemExit(f"Repo path does not exist: {repo}")
    contexts = resolve_paths(repo, args.context)
    constraints = list(args.constraint)
    preflight = ensure_web_handoff_ready(
        repo,
        args.model,
        args.effort,
        args.max_budget_usd,
        args.timeout_seconds,
    )
    prompt = build_prompt(args, repo, contexts, list(args.summary), constraints, args.context_limit_chars)
    payload = run_claude(
        prompt,
        repo,
        args.model,
        args.effort,
        args.max_budget_usd,
        args.timeout_seconds,
        build_schema(args.mode),
    )
    payload.setdefault("_meta", {})
    payload["_meta"]["preflight"] = preflight
    if args.output:
        write_text(Path(args.output).expanduser().resolve(), json.dumps(payload, indent=2) + "\n")
    if args.markdown_out:
        write_text(Path(args.markdown_out).expanduser().resolve(), render_markdown(payload))
    print(json.dumps(payload, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
