from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import unittest


MODULE_PATH = Path(__file__).resolve().parents[1] / "scripts" / "autoresearch.py"
spec = spec_from_file_location("autoresearch", MODULE_PATH)
module = module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(module)


class AutoresearchTests(unittest.TestCase):
    def test_score_result_flags_missing_components(self) -> None:
        result = {
            "returncode": 0,
            "payload": {
                "task_type": "implementation-spec",
                "implementation_brief": {
                    "components": [],
                    "states": ["quiet"],
                },
                "handoff": {
                    "transport": "claude-code-chrome-to-claude-ai-design",
                    "workspace_status": "design-created",
                    "workspace_url": "https://claude.ai/design/example",
                    "artifact_name": "Example",
                    "design_system_status": "used-existing-design-system",
                    "notes": "ok",
                },
                "recommended_direction": "queue",
                "next_codex_action": "implement",
            },
        }

        ok, failures = module.score_result(result)

        self.assertFalse(ok)
        self.assertIn("missing-components", failures)

    def test_score_result_flags_missing_handoff(self) -> None:
        result = {
            "returncode": 0,
            "payload": {
                "task_type": "implementation-spec",
                "implementation_brief": {
                    "components": ["A"],
                    "states": ["quiet"],
                },
                "recommended_direction": "queue",
                "next_codex_action": "implement",
            },
        }

        ok, failures = module.score_result(result)

        self.assertFalse(ok)
        self.assertIn("missing-handoff", failures)

    def test_summarize_counts_failures(self) -> None:
        results = [
            {
                "name": "good",
                "mode": "critique",
                "returncode": 0,
                "json_out": "good.json",
                "markdown_out": "good.md",
                "payload": {
                    "task_type": "critique",
                    "implementation_brief": {"components": ["A"], "states": ["hover"]},
                    "handoff": {
                        "transport": "claude-code-chrome-to-claude-ai-design",
                        "workspace_status": "design-reviewed",
                        "workspace_url": "https://claude.ai/design/example",
                        "artifact_name": "Example",
                        "design_system_status": "used-existing-design-system",
                        "notes": "ok",
                    },
                    "recommended_direction": "fix hierarchy",
                    "next_codex_action": "ship",
                    "critique_findings": [{"severity": "high", "issue": "x", "why_it_matters": "y", "suggested_fix": "z"}],
                },
            },
            {
                "name": "bad",
                "mode": "explore",
                "returncode": 1,
                "json_out": "bad.json",
                "markdown_out": "bad.md",
            },
        ]

        summary = module.summarize(results)

        self.assertEqual(summary["passed"], 1)
        self.assertEqual(summary["failed"], 1)
        self.assertEqual(summary["failure_counts"]["bridge-failed"], 1)


if __name__ == "__main__":
    unittest.main()
