#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_SAWYER_HUB_ROOT = Path("/Users/sawbeck/Projects/sawyer-hub")
DEFAULT_SEARCH_SCRIPT = DEFAULT_SAWYER_HUB_ROOT / "tools/design_memory_search.py"


@dataclass(frozen=True)
class PageFamilyPreset:
    page_family: str
    product_type: str
    style_families: tuple[str, ...]
    preferred_ids: tuple[str, ...]
    preferred_buckets: tuple[str, ...]
    query: str
    why: str


PRESETS: dict[str, PageFamilyPreset] = {
    "homepage": PageFamilyPreset(
        page_family="homepage",
        product_type="vacation rental marketing homepage",
        style_families=("bold-brand-site", "editorial-product"),
        preferred_ids=("arc-bold-brand-site", "equals-editorial-product"),
        preferred_buckets=("websites",),
        query="vacation rental direct booking homepage hospitality brand",
        why="Use bold brand-site hierarchy so the place, offer, and direct-book path are obvious immediately.",
    ),
    "guide": PageFamilyPreset(
        page_family="guide",
        product_type="local area guide",
        style_families=("editorial-product", "bold-brand-site"),
        preferred_ids=("equals-editorial-product", "arc-bold-brand-site"),
        preferred_buckets=("websites", "weird"),
        query="local guide editorial destination proof typography",
        why="Use editorial-product rhythm so the guide feels authored, specific, and easy to scan.",
    ),
    "stay-lander": PageFamilyPreset(
        page_family="stay-lander",
        product_type="vacation rental collection landing page",
        style_families=("bold-brand-site", "editorial-product"),
        preferred_ids=("arc-bold-brand-site", "equals-editorial-product"),
        preferred_buckets=("websites",),
        query="vacation rental collection landing page direct booking",
        why="Use brand-forward hero treatment first, then pivot quickly into matching homes and proof sections.",
    ),
    "property-detail": PageFamilyPreset(
        page_family="property-detail",
        product_type="vacation rental property detail page",
        style_families=("premium-utility", "bold-brand-site"),
        preferred_ids=("mercury-premium-utility", "arc-bold-brand-site"),
        preferred_buckets=("dashboards", "websites"),
        query="product detail booking proof premium utility hospitality",
        why="Use premium-utility discipline for specs, booking modules, and scannable proof without losing place identity.",
    ),
    "owner-page": PageFamilyPreset(
        page_family="owner-page",
        product_type="owner acquisition landing page",
        style_families=("premium-utility", "bold-brand-site"),
        preferred_ids=("mercury-premium-utility", "equals-editorial-product"),
        preferred_buckets=("dashboards", "websites"),
        query="owner acquisition proof page premium utility editorial",
        why="Owner pages need harder proof hierarchy, calmer structure, and less decorative drift than guest pages.",
    ),
    "research-page": PageFamilyPreset(
        page_family="research-page",
        product_type="research explainer page",
        style_families=("editorial-product", "premium-utility"),
        preferred_ids=("equals-editorial-product", "mercury-premium-utility"),
        preferred_buckets=("websites", "dashboards"),
        query="research explainer editorial proof table benchmark",
        why="Research pages should lead with the claim, then use clear utility sections for methods, tables, and caveats.",
    ),
    "internal-review": PageFamilyPreset(
        page_family="internal-review",
        product_type="internal review board",
        style_families=("precise-operator", "premium-utility"),
        preferred_ids=("linear-precise-operator", "mercury-premium-utility"),
        preferred_buckets=("dashboards",),
        query="operator review board comparison dashboard",
        why="Internal review surfaces should optimize for scanning, comparison, and quick decisions rather than marketing tone.",
    ),
}


def infer_page_family(source_file: str) -> str | None:
    normalized = source_file.replace("\\", "/").strip("./")
    if normalized == "src/index.njk":
        return "homepage"
    if normalized.startswith("src/guides/"):
        return "guide"
    if normalized == "src/stays/stays.njk" or normalized == "src/_data/seoPages.json":
        return "stay-lander"
    if normalized.startswith("src/properties/"):
        return "property-detail"
    if normalized.startswith("src/property-management/"):
        return "owner-page"
    if normalized.startswith("src/research/"):
        return "research-page"
    if normalized.startswith("tmp/") or normalized.startswith("docs/process/"):
        return "internal-review"
    return None


def run_search(search_script: Path, sawyer_hub_root: Path, query: str, style_family: str, limit: int) -> dict[str, Any]:
    command = [
        sys.executable,
        str(search_script),
        "--root",
        str(sawyer_hub_root),
        "--query",
        query,
        "--style-family",
        style_family,
        "--limit",
        str(limit),
    ]
    result = subprocess.run(command, text=True, capture_output=True, check=False)
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or result.stdout.strip() or "design_memory_search failed")
    return json.loads(result.stdout)


def resolve_reference_path(sawyer_hub_root: Path, value: str | None) -> Path | None:
    if not value:
        return None
    path = Path(value)
    if path.is_absolute():
        return path
    return (sawyer_hub_root / path).resolve()


def load_style_metadata(sawyer_hub_root: Path, reference: dict[str, Any]) -> dict[str, Any]:
    base_path = resolve_reference_path(sawyer_hub_root, reference.get("path"))
    if not base_path:
        return {}
    style_path = base_path / "style.json"
    if not style_path.exists():
        return {}
    return json.loads(style_path.read_text(encoding="utf-8"))


def candidate_score(reference: dict[str, Any], preset: PageFamilyPreset) -> int:
    score = int(reference.get("score", 0))
    if reference.get("pack_status") == "full":
        score += 40
    if reference.get("bucket") in preset.preferred_buckets:
        score += 15
    ref_id = str(reference.get("id", ""))
    if ref_id in preset.preferred_ids:
        score += 100 - (preset.preferred_ids.index(ref_id) * 10)
    return score


def merge_and_rank(results_by_family: list[dict[str, Any]], preset: PageFamilyPreset) -> list[dict[str, Any]]:
    merged: dict[str, dict[str, Any]] = {}
    for payload in results_by_family:
        for result in payload.get("results", []):
            ref_id = str(result.get("id", ""))
            if not ref_id:
                continue
            current = merged.get(ref_id)
            score = candidate_score(result, preset)
            if current is None or score > current["_merged_score"]:
                merged[ref_id] = {**result, "_merged_score": score}
    ranked = sorted(merged.values(), key=lambda item: (-item["_merged_score"], str(item.get("id", ""))))
    return ranked


def pick_references(sawyer_hub_root: Path, search_script: Path, preset: PageFamilyPreset, limit: int) -> dict[str, Any]:
    results_by_family = [
        run_search(search_script, sawyer_hub_root, preset.query, family, max(4, limit * 2))
        for family in preset.style_families
    ]
    preferred_present = {
        str(result.get("id", ""))
        for payload in results_by_family
        for result in payload.get("results", [])
    }
    missing_preferred = [reference_id for reference_id in preset.preferred_ids if reference_id not in preferred_present]
    if missing_preferred:
        for family in preset.style_families:
            broad_payload = run_search(search_script, sawyer_hub_root, "", family, 20)
            filtered = [result for result in broad_payload.get("results", []) if result.get("id") in missing_preferred]
            if filtered:
                results_by_family.append({"results": filtered})

    ranked = merge_and_rank(results_by_family, preset)[:limit]
    picks: list[dict[str, Any]] = []
    for reference in ranked:
        detail = load_style_metadata(sawyer_hub_root, reference)
        picks.append(
            {
                "id": reference.get("id"),
                "bucket": reference.get("bucket"),
                "brand": reference.get("brand"),
                "product_type": reference.get("product_type"),
                "style_families": reference.get("style_families", []),
                "theme": reference.get("theme"),
                "pack_status": reference.get("pack_status"),
                "path": str(resolve_reference_path(sawyer_hub_root, reference.get("path")) or ""),
                "design_md": str(resolve_reference_path(sawyer_hub_root, reference.get("design_md")) or ""),
                "critique_rules": str(resolve_reference_path(sawyer_hub_root, reference.get("critique_rules")) or ""),
                "tokens_css": str(resolve_reference_path(sawyer_hub_root, reference.get("tokens_css")) or ""),
                "mood": detail.get("mood", reference.get("mood", [])),
                "dos": detail.get("dos", []),
                "donts": detail.get("donts", []),
                "anti_patterns": detail.get("anti_patterns", []),
                "score": reference.get("_merged_score"),
            }
        )

    return {
        "page_family": preset.page_family,
        "product_type": preset.product_type,
        "style_families": list(preset.style_families),
        "query": preset.query,
        "why": preset.why,
        "references": picks,
    }


def render_text(payload: dict[str, Any]) -> str:
    lines = [
        f"Page family: {payload['page_family']}",
        f"Product type: {payload['product_type']}",
        f"Reference families: {', '.join(payload['style_families'])}",
        f"Why: {payload['why']}",
        f"Query: {payload['query']}",
        "",
    ]
    for index, reference in enumerate(payload["references"], start=1):
        lines.append(f"{index}. {reference['id']} ({reference['brand']})")
        lines.append(f"   Bucket: {reference['bucket']} | Pack: {reference['pack_status']} | Theme: {reference['theme']}")
        if reference["mood"]:
            lines.append(f"   Mood: {', '.join(reference['mood'])}")
        if reference["dos"]:
            lines.append(f"   Do: {reference['dos'][0]}")
        if reference["donts"]:
            lines.append(f"   Avoid: {reference['donts'][0]}")
        if reference["anti_patterns"]:
            lines.append(f"   Critique gate: {', '.join(reference['anti_patterns'][:3])}")
        if reference["design_md"]:
            lines.append(f"   DESIGN.md: {reference['design_md']}")
        if reference["critique_rules"]:
            lines.append(f"   critique-rules.md: {reference['critique_rules']}")
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Pick 1-2 Sawyer Hub donor references before Seascape design work.")
    parser.add_argument("--page-family", choices=sorted(PRESETS), help="Named Seascape page family preset")
    parser.add_argument("--source-file", help="Infer page family from a repo source path like src/properties/river-house/index.njk")
    parser.add_argument("--limit", type=int, default=2, help="Number of references to return")
    parser.add_argument("--json", action="store_true", help="Print JSON instead of text")
    parser.add_argument("--sawyer-hub-root", type=Path, default=DEFAULT_SAWYER_HUB_ROOT)
    parser.add_argument("--search-script", type=Path, default=DEFAULT_SEARCH_SCRIPT)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    page_family = args.page_family
    if not page_family and args.source_file:
        page_family = infer_page_family(args.source_file)
    if not page_family:
        valid = ", ".join(sorted(PRESETS))
        print(f"Pick a page family with --page-family or pass --source-file. Valid presets: {valid}", file=sys.stderr)
        return 1

    if page_family not in PRESETS:
        print(f"Unsupported page family: {page_family}", file=sys.stderr)
        return 1

    if not args.search_script.exists():
        print(f"Missing Sawyer Hub search script: {args.search_script}", file=sys.stderr)
        return 1

    payload = pick_references(args.sawyer_hub_root.resolve(), args.search_script.resolve(), PRESETS[page_family], max(1, args.limit))
    if args.json:
        print(json.dumps(payload, indent=2, sort_keys=True))
        return 0
    sys.stdout.write(render_text(payload))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
