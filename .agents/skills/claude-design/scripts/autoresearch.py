#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
from pathlib import Path
import subprocess
import sys
from typing import Any


PLUGIN_EVAL_CLI = Path(
    "/Users/sawbeck/.codex/plugins/cache/openai-curated/plugin-eval/ed8ce2ea/scripts/plugin-eval.js"
)
DEFAULT_SKILL_DIR = Path(__file__).resolve().parents[1]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run a bounded Claude Design evaluation loop.")
    parser.add_argument("--scenarios", required=True, help="JSON file containing test scenarios.")
    parser.add_argument("--out-dir", required=True, help="Directory to write evaluation artifacts.")
    parser.add_argument("--skill-dir", default=str(DEFAULT_SKILL_DIR), help="Codex skill path.")
    parser.add_argument("--model", default="sonnet", help="Claude model alias or full name.")
    parser.add_argument("--max-budget-usd", type=float, default=1.0, help="Budget cap per scenario.")
    return parser.parse_args()


def load_scenarios(path: Path) -> list[dict[str, Any]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError("Scenario file must be a JSON array.")
    return data


def run_bridge(script_path: Path, scenario: dict[str, Any], model: str, max_budget: float, run_dir: Path) -> dict[str, Any]:
    json_out = run_dir / "result.json"
    md_out = run_dir / "result.md"
    cmd = [
        sys.executable,
        str(script_path),
        "--repo",
        scenario["repo"],
        "--mode",
        scenario["mode"],
        "--task",
        scenario["task"],
        "--model",
        model,
        "--max-budget-usd",
        str(max_budget),
        "--effort",
        scenario.get("effort", "low"),
        "--timeout-seconds",
        str(scenario.get("timeout_seconds", 300)),
        "--output",
        str(json_out),
        "--markdown-out",
        str(md_out),
    ]
    for item in scenario.get("context_paths", []):
        cmd.extend(["--context", item])
    for item in scenario.get("summaries", []):
        cmd.extend(["--summary", item])
    for item in scenario.get("constraints", []):
        cmd.extend(["--constraint", item])
    if "context_limit_chars" in scenario:
        cmd.extend(["--context-limit-chars", str(scenario["context_limit_chars"])])
    completed = subprocess.run(cmd, capture_output=True, text=True, check=False)
    result: dict[str, Any] = {
        "name": scenario.get("name", "unnamed"),
        "mode": scenario["mode"],
        "repo": scenario["repo"],
        "command": cmd,
        "returncode": completed.returncode,
        "stdout": completed.stdout,
        "stderr": completed.stderr,
        "json_out": str(json_out),
        "markdown_out": str(md_out),
    }
    if completed.returncode == 0 and json_out.exists():
        result["payload"] = json.loads(json_out.read_text(encoding="utf-8"))
    return result


def score_result(result: dict[str, Any]) -> tuple[bool, list[str]]:
    failures: list[str] = []
    if result["returncode"] != 0:
        failures.append("bridge-failed")
        return False, failures
    payload = result.get("payload")
    if not payload:
        failures.append("missing-payload")
        return False, failures
    mode = payload["task_type"]
    if mode == "explore" and len(payload["directions"]) < 2:
        failures.append("not-enough-directions")
    if mode == "critique" and not payload["critique_findings"]:
        failures.append("missing-critique-findings")
    if not payload["implementation_brief"]["components"]:
        failures.append("missing-components")
    if not payload["implementation_brief"]["states"]:
        failures.append("missing-states")
    if not payload.get("handoff"):
        failures.append("missing-handoff")
    if not payload["recommended_direction"]:
        failures.append("missing-recommendation")
    if not payload["next_codex_action"]:
        failures.append("missing-next-action")
    return len(failures) == 0, failures


def summarize(results: list[dict[str, Any]]) -> dict[str, Any]:
    passed = 0
    failure_counts: dict[str, int] = {}
    scenarios: list[dict[str, Any]] = []
    for result in results:
        ok, failures = score_result(result)
        if ok:
            passed += 1
        for failure in failures:
            failure_counts[failure] = failure_counts.get(failure, 0) + 1
        scenarios.append(
            {
                "name": result["name"],
                "mode": result["mode"],
                "ok": ok,
                "failures": failures,
                "returncode": result["returncode"],
                "json_out": result["json_out"],
                "markdown_out": result["markdown_out"],
            }
        )
    repeated = sorted(failure_counts.items(), key=lambda item: (-item[1], item[0]))
    next_targets = []
    if failure_counts.get("bridge-failed"):
        next_targets.append("Stabilize the Claude Design web handoff before tuning prompt quality.")
    if failure_counts.get("not-enough-directions"):
        next_targets.append("Force explore mode to produce 2-3 truly distinct directions.")
    if failure_counts.get("missing-components") or failure_counts.get("missing-states"):
        next_targets.append("Tighten the implementation brief requirements.")
    if failure_counts.get("missing-handoff"):
        next_targets.append("Require a verifiable Claude Design handoff receipt in every successful packet.")
    if failure_counts.get("missing-critique-findings"):
        next_targets.append("Strengthen critique mode so it emits concrete findings, not soft impressions.")
    if failure_counts.get("missing-recommendation"):
        next_targets.append("Require a winner even when tradeoffs are close.")
    return {
        "scenario_count": len(results),
        "passed": passed,
        "failed": len(results) - passed,
        "pass_rate": round((passed / len(results)) * 100, 1) if results else 0.0,
        "failure_counts": failure_counts,
        "repeated_failures": repeated,
        "next_patch_targets": next_targets,
        "scenarios": scenarios,
    }


def render_markdown(summary: dict[str, Any], plugin_eval_report: str | None) -> str:
    lines = [
        "# Claude Design Autoresearch Run",
        f"- Scenarios: {summary['scenario_count']}",
        f"- Passed: {summary['passed']}",
        f"- Failed: {summary['failed']}",
        f"- Pass rate: {summary['pass_rate']}%",
        "",
        "## Scenario Results",
    ]
    for scenario in summary["scenarios"]:
        status = "PASS" if scenario["ok"] else "FAIL"
        lines.append(f"- {status} {scenario['name']} ({scenario['mode']})")
        if scenario["failures"]:
            for failure in scenario["failures"]:
                lines.append(f"  - {failure}")
    if summary["next_patch_targets"]:
        lines.extend(["", "## Next Patch Targets"])
        lines.extend(f"- {item}" for item in summary["next_patch_targets"])
    if plugin_eval_report:
        lines.extend(["", "## Plugin Eval Snapshot", plugin_eval_report.strip()])
    return "\n".join(lines).strip() + "\n"


def run_plugin_eval(skill_dir: Path) -> str | None:
    if not PLUGIN_EVAL_CLI.exists():
        return None
    cmd = ["node", str(PLUGIN_EVAL_CLI), "analyze", str(skill_dir), "--format", "markdown"]
    completed = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if completed.returncode != 0:
        return f"plugin-eval failed: {completed.stderr.strip() or completed.stdout.strip()}"
    return completed.stdout


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def main() -> int:
    args = parse_args()
    skill_dir = Path(args.skill_dir).expanduser().resolve()
    scenario_file = Path(args.scenarios).expanduser().resolve()
    out_dir = Path(args.out_dir).expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    scenarios = load_scenarios(scenario_file)
    script_path = skill_dir / "scripts" / "run_claude_design.py"
    results: list[dict[str, Any]] = []
    for scenario in scenarios:
        run_dir = out_dir / scenario.get("name", "unnamed")
        run_dir.mkdir(parents=True, exist_ok=True)
        results.append(run_bridge(script_path, scenario, args.model, args.max_budget_usd, run_dir))
    summary = summarize(results)
    plugin_eval_report = run_plugin_eval(skill_dir)
    write_text(out_dir / "summary.json", json.dumps(summary, indent=2) + "\n")
    write_text(out_dir / "summary.md", render_markdown(summary, plugin_eval_report))
    print(json.dumps(summary, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
