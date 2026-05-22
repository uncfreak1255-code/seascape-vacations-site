from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
from types import SimpleNamespace
import unittest


MODULE_PATH = Path(__file__).resolve().parents[1] / "scripts" / "run_claude_design.py"
spec = spec_from_file_location("run_claude_design", MODULE_PATH)
module = module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(module)


class RunClaudeDesignTests(unittest.TestCase):
    def test_build_schema_changes_by_mode(self) -> None:
        critique = module.build_schema("critique")
        explore = module.build_schema("explore")

        self.assertIn("critique_findings", critique["required"])
        self.assertNotIn("critique_findings", explore["required"])
        self.assertIn("directions", explore["required"])
        self.assertIn("handoff", critique["required"])

    def test_build_claude_command_uses_chrome_and_no_tools(self) -> None:
        cmd = module.build_claude_command("prompt", "sonnet", "low", 1.0, {"type": "object"})

        self.assertIn("--chrome", cmd)
        self.assertEqual(cmd[-2:], ["--tools", ""])

    def test_snapshot_text_truncates_long_payloads(self) -> None:
        long_text = "a" * 5000
        snapped = module.snapshot_text(long_text, 1000)

        self.assertIn("truncated for prompt budget", snapped)
        self.assertLess(len(snapped), len(long_text))

    def test_build_prompt_requires_claude_design_web_workspace(self) -> None:
        args = SimpleNamespace(mode="explore", task="Design the operator dashboard")
        repo = Path("/tmp/seascape-analytics")

        prompt = module.build_prompt(args, repo, [], ["Operator board is evidence-first."], ["Keep mobile usable."], 500)

        self.assertIn("https://claude.ai/design", prompt)
        self.assertIn("Do not answer from Claude Code alone", prompt)
        self.assertIn("Exact brief to send into Claude Design", prompt)

    def test_normalize_response_extracts_structured_output(self) -> None:
        raw = {
            "duration_ms": 1234,
            "total_cost_usd": 0.42,
            "session_id": "abc",
            "structured_output": {
                "task_type": "critique",
                "objective": "Test objective",
                "current_state": "Current state",
                "recommended_direction": "Start with hierarchy",
                "implementation_brief": {
                    "layout": "Layout",
                    "typography": "Type",
                    "color": "Color",
                    "components": ["Hero"],
                    "states": ["hover"],
                    "constraints": ["keep tabs"],
                    "asset_notes": [],
                },
                "questions": [],
                "risks": [],
                "handoff": {
                    "transport": "claude-code-chrome-to-claude-ai-design",
                    "workspace_status": "design-reviewed",
                    "workspace_url": "https://claude.ai/design/example",
                    "artifact_name": "Seascape dashboard concept",
                    "design_system_status": "used-existing-design-system",
                    "notes": "Used the existing workspace system.",
                },
                "readiness": "design-ready-for-user-decision",
                "next_codex_action": "Build it",
                "critique_findings": [],
            },
        }

        payload = module.normalize_response(raw)

        self.assertEqual(payload["objective"], "Test objective")
        self.assertEqual(payload["_meta"]["duration_ms"], 1234)
        self.assertEqual(payload["_meta"]["total_cost_usd"], 0.42)

    def test_render_markdown_includes_meta(self) -> None:
        payload = {
            "task_type": "implementation-spec",
            "objective": "Control room board",
            "current_state": "Markdown dashboard",
            "recommended_direction": "single-column-work-queue",
            "implementation_brief": {
                "layout": "Single column",
                "typography": "System",
                "color": "Neutral",
                "components": ["TopBar"],
                "states": ["quiet"],
                "constraints": ["no cards"],
                "asset_notes": [],
            },
            "questions": [],
            "risks": [],
            "handoff": {
                "transport": "claude-code-chrome-to-claude-ai-design",
                "workspace_status": "design-created",
                "workspace_url": "https://claude.ai/design/example",
                "artifact_name": "Control room branch",
                "design_system_status": "used-existing-design-system",
                "notes": "Created a new concept in Claude Design.",
            },
            "readiness": "ready-for-codex-implementation",
            "next_codex_action": "Implement the HTML board.",
            "directions": [],
            "critique_findings": [],
            "_meta": {"duration_ms": 1500, "total_cost_usd": 0.12},
        }

        markdown = module.render_markdown(payload)

        self.assertIn("Duration: 1500 ms", markdown)
        self.assertIn("Cost: $0.1200", markdown)
        self.assertIn("Control room board", markdown)
        self.assertIn("Workspace URL: https://claude.ai/design/example", markdown)


if __name__ == "__main__":
    unittest.main()
