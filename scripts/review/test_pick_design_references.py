from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).resolve().parent / "pick_design_references.py"
SPEC = importlib.util.spec_from_file_location("pick_design_references", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
sys.modules[SPEC.name] = MODULE
SPEC.loader.exec_module(MODULE)


class PickDesignReferencesTests(unittest.TestCase):
    def test_infer_page_family_from_source_paths(self) -> None:
        self.assertEqual(MODULE.infer_page_family("src/index.njk"), "homepage")
        self.assertEqual(MODULE.infer_page_family("src/guides/bradenton-area-guide/index.html"), "guide")
        self.assertEqual(MODULE.infer_page_family("src/stays/stays.njk"), "stay-lander")
        self.assertEqual(MODULE.infer_page_family("src/properties/river-house/index.njk"), "property-detail")
        self.assertEqual(MODULE.infer_page_family("src/property-management/index.njk"), "owner-page")
        self.assertEqual(MODULE.infer_page_family("docs/process/before-user-review-checklist.md"), "internal-review")
        self.assertIsNone(MODULE.infer_page_family("README.md"))

    def test_merge_and_rank_prefers_full_pack_and_preferred_ids(self) -> None:
        preset = MODULE.PRESETS["guide"]
        payloads = [
            {
                "results": [
                    {"id": "catalog-guide", "score": 9, "pack_status": "catalog", "bucket": "websites"},
                    {"id": "equals-editorial-product", "score": 5, "pack_status": "full", "bucket": "websites"},
                ]
            }
        ]
        ranked = MODULE.merge_and_rank(payloads, preset)
        self.assertEqual(ranked[0]["id"], "equals-editorial-product")

    def test_render_text_includes_reference_files(self) -> None:
        payload = {
            "page_family": "guide",
            "product_type": "local area guide",
            "style_families": ["editorial-product"],
            "query": "local guide",
            "why": "Use editorial-product rhythm.",
            "references": [
                {
                    "id": "equals-editorial-product",
                    "brand": "Equals",
                    "bucket": "websites",
                    "pack_status": "full",
                    "theme": "light",
                    "mood": ["editorial"],
                    "dos": ["show proof early"],
                    "donts": ["avoid generic cards"],
                    "anti_patterns": ["weak_hierarchy"],
                    "design_md": "/tmp/DESIGN.md",
                    "critique_rules": "/tmp/critique-rules.md",
                }
            ],
        }
        rendered = MODULE.render_text(payload)
        self.assertIn("Page family: guide", rendered)
        self.assertIn("equals-editorial-product", rendered)
        self.assertIn("/tmp/DESIGN.md", rendered)


if __name__ == "__main__":
    unittest.main()
