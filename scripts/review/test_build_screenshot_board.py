from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).resolve().parent / "build_screenshot_board.py"
SPEC = importlib.util.spec_from_file_location("build_screenshot_board", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
sys.modules[SPEC.name] = MODULE
SPEC.loader.exec_module(MODULE)


class BuildScreenshotBoardTests(unittest.TestCase):
    def test_classify_shot_detects_mobile_and_desktop_variants(self) -> None:
        desktop = MODULE.classify_shot(Path("river-house-desktop.png"))
        mobile = MODULE.classify_shot(Path("river-house-mobile-top.png"))
        self.assertEqual(desktop.slug, "river-house")
        self.assertEqual(desktop.kind, "desktop")
        self.assertEqual(mobile.slug, "river-house")
        self.assertEqual(mobile.kind, "mobile-top")

    def test_load_manifest_accepts_cards_list(self) -> None:
        with tempfile.TemporaryDirectory() as temp_root:
            manifest_path = Path(temp_root) / "manifest.json"
            manifest_path.write_text(
                json.dumps(
                    {
                        "cards": [
                            {
                                "slug": "river-house",
                                "title": "River House",
                                "route": "/properties/river-house/",
                            }
                        ]
                    }
                ),
                encoding="utf-8",
            )
            manifest = MODULE.load_manifest(manifest_path)
            self.assertEqual(manifest["river-house"]["title"], "River House")

    def test_build_board_writes_html_with_cards_and_changed_files(self) -> None:
        with tempfile.TemporaryDirectory() as temp_root:
            root = Path(temp_root)
            screenshot_dir = root / "shots"
            screenshot_dir.mkdir()
            (screenshot_dir / "river-house-desktop.png").write_bytes(b"fake")
            (screenshot_dir / "river-house-mobile.png").write_bytes(b"fake")
            output_path = root / "board.html"

            original_collect = MODULE.collect_changed_files
            MODULE.collect_changed_files = lambda repo_root, git_base: ["src/properties/river-house/index.njk"]
            try:
                receipt = MODULE.build_board(
                    screenshot_dir=screenshot_dir,
                    output_path=output_path,
                    title="Test Board",
                    manifest_path=None,
                    repo_root=root,
                    git_base="origin/main",
                )
            finally:
                MODULE.collect_changed_files = original_collect

            html = output_path.read_text(encoding="utf-8")
            self.assertEqual(receipt["cards"], 1)
            self.assertIn("Test Board", html)
            self.assertIn("River House", html)
            self.assertIn("src/properties/river-house/index.njk", html)
            self.assertIn("river-house-desktop.png", html)


if __name__ == "__main__":
    unittest.main()
