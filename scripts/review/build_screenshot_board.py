#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import os
import subprocess
from dataclasses import dataclass, field
from datetime import datetime
from html import escape
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[2]
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
IGNORED_PREFIXES = ("contact-", "board-", "test-")
VARIANT_SUFFIXES = (
    ("-mobile-full", "mobile-full", "Mobile full"),
    ("-mobile-top", "mobile-top", "Mobile top"),
    ("-mobile", "mobile", "Mobile"),
    ("-desktop", "desktop", "Desktop"),
    ("-tablet", "tablet", "Tablet"),
)


@dataclass
class Shot:
    path: Path
    slug: str
    kind: str
    label: str


@dataclass
class Card:
    slug: str
    title: str
    route: str | None = None
    page_family: str | None = None
    notes: str | None = None
    source_files: list[str] = field(default_factory=list)
    shots: list[Shot] = field(default_factory=list)


def classify_shot(path: Path) -> Shot:
    stem = path.stem
    for suffix, kind, label in VARIANT_SUFFIXES:
        if stem.endswith(suffix):
            return Shot(path=path, slug=stem[: -len(suffix)], kind=kind, label=label)
    return Shot(path=path, slug=stem, kind="other", label=stem)


def titleize(slug: str) -> str:
    words = slug.replace("_", "-").split("-")
    return " ".join(word.capitalize() for word in words if word)


def load_manifest(path: Path | None) -> dict[str, dict[str, Any]]:
    if path is None:
        return {}
    payload = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(payload, dict) and "cards" in payload:
        entries = payload["cards"]
    elif isinstance(payload, dict):
        return {slug: value for slug, value in payload.items() if isinstance(value, dict)}
    else:
        entries = payload

    manifest: dict[str, dict[str, Any]] = {}
    for entry in entries:
        if not isinstance(entry, dict):
            continue
        slug = entry.get("slug")
        if isinstance(slug, str) and slug:
            manifest[slug] = entry
    return manifest


def collect_changed_files(repo_root: Path, git_base: str | None) -> list[str]:
    changed: list[str] = []
    commands: list[list[str]] = [["git", "diff", "--name-only"], ["git", "diff", "--cached", "--name-only"]]
    if git_base:
        commands.insert(0, ["git", "diff", "--name-only", f"{git_base}...HEAD"])

    for command in commands:
        result = subprocess.run(command, cwd=repo_root, text=True, capture_output=True, check=False)
        if result.returncode != 0:
            raise RuntimeError(result.stderr.strip() or result.stdout.strip() or "git diff failed")
        changed.extend(line.strip() for line in result.stdout.splitlines() if line.strip())

    deduped: list[str] = []
    seen: set[str] = set()
    for item in changed:
        if item in seen:
            continue
        seen.add(item)
        deduped.append(item)
    return deduped


def build_cards(screenshot_dir: Path, manifest: dict[str, dict[str, Any]]) -> list[Card]:
    grouped: dict[str, Card] = {}
    for path in sorted(screenshot_dir.iterdir()):
        if not path.is_file() or path.suffix.lower() not in IMAGE_EXTENSIONS:
            continue
        if path.stem.startswith(IGNORED_PREFIXES):
            continue
        shot = classify_shot(path)
        meta = manifest.get(shot.slug, {})
        card = grouped.setdefault(
            shot.slug,
            Card(
                slug=shot.slug,
                title=str(meta.get("title") or titleize(shot.slug)),
                route=meta.get("route"),
                page_family=meta.get("page_family"),
                notes=meta.get("notes"),
                source_files=list(meta.get("source_files", [])),
            ),
        )
        card.shots.append(shot)

    return sorted(grouped.values(), key=lambda item: item.title.lower())


def shot_sort_key(shot: Shot) -> tuple[int, str]:
    order = {"desktop": 0, "tablet": 1, "mobile": 2, "mobile-top": 3, "mobile-full": 4, "other": 5}
    return (order.get(shot.kind, 99), shot.label)


def rel_path(from_path: Path, to_path: Path) -> str:
    return os.path.relpath(to_path, from_path.parent)


def render_card(card: Card, output_path: Path) -> str:
    missing = []
    kinds = {shot.kind for shot in card.shots}
    if "desktop" not in kinds:
        missing.append("Missing desktop screenshot")
    if not {"mobile", "mobile-top", "mobile-full"} & kinds:
        missing.append("Missing mobile screenshot")

    parts = ['<article class="card">']
    parts.append('<header class="card-header">')
    title = escape(card.title)
    if card.route:
        parts.append(f'<h2><a href="{escape(card.route)}">{title}</a></h2>')
    else:
        parts.append(f"<h2>{title}</h2>")
    meta = []
    if card.page_family:
        meta.append(f"page family: {escape(card.page_family)}")
    if card.source_files:
        meta.append(f"source: {escape(', '.join(card.source_files))}")
    if meta:
        parts.append(f'<p class="meta">{" | ".join(meta)}</p>')
    if card.notes:
        parts.append(f'<p class="notes">{escape(card.notes)}</p>')
    if missing:
        parts.append('<ul class="warnings">' + "".join(f"<li>{escape(item)}</li>" for item in missing) + "</ul>")
    parts.append("</header>")
    parts.append('<div class="shot-grid">')
    for shot in sorted(card.shots, key=shot_sort_key):
        src = escape(rel_path(output_path, shot.path))
        alt = escape(f"{card.title} - {shot.label}")
        parts.append(
            "".join(
                [
                    '<figure class="shot">',
                    f'<a href="{src}"><img src="{src}" alt="{alt}"></a>',
                    f"<figcaption>{escape(shot.label)}<span>{escape(shot.path.name)}</span></figcaption>",
                    "</figure>",
                ]
            )
        )
    parts.append("</div></article>")
    return "".join(parts)


def render_html(title: str, cards: list[Card], changed_files: list[str], output_path: Path) -> str:
    generated_at = datetime.now().strftime("%Y-%m-%d %H:%M")
    changed_block = ""
    if changed_files:
        changed_items = "".join(f"<li>{escape(item)}</li>" for item in changed_files)
        changed_block = f"""
        <section class="changed-files">
          <h2>Changed files on this branch</h2>
          <ul>{changed_items}</ul>
        </section>
        """

    cards_html = "".join(render_card(card, output_path) for card in cards)
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{escape(title)}</title>
  <style>
    :root {{
      color-scheme: light;
      --bg: #f5eed6;
      --surface: #fffdf7;
      --surface-strong: #ffffff;
      --text: #2d3536;
      --muted: #5f6f70;
      --brand: #3d5c5d;
      --gold: #c9a962;
      --border: rgba(61, 92, 93, 0.14);
      --shadow: 0 16px 40px rgba(27, 43, 44, 0.09);
      --radius: 20px;
    }}

    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      font-family: "Poppins", system-ui, sans-serif;
      background: linear-gradient(180deg, #faf7ee 0%, var(--bg) 100%);
      color: var(--text);
    }}
    a {{ color: var(--brand); }}
    .shell {{
      max-width: 1440px;
      margin: 0 auto;
      padding: 32px 24px 64px;
    }}
    .hero {{
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 28px;
      box-shadow: var(--shadow);
      padding: 28px;
      margin-bottom: 24px;
    }}
    .eyebrow {{
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: 999px;
      background: rgba(201, 169, 98, 0.18);
      color: var(--brand);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }}
    h1, h2 {{
      font-family: "Playfair Display", Georgia, serif;
      color: var(--brand);
      margin: 0;
    }}
    h1 {{
      font-size: clamp(32px, 5vw, 56px);
      margin-top: 18px;
    }}
    .subhead {{
      max-width: 760px;
      margin-top: 12px;
      color: var(--muted);
      line-height: 1.7;
    }}
    .meta-row {{
      display: flex;
      flex-wrap: wrap;
      gap: 12px 24px;
      margin-top: 18px;
      font-size: 14px;
      color: var(--muted);
    }}
    .changed-files {{
      background: rgba(255, 255, 255, 0.72);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px 24px;
      margin-bottom: 24px;
    }}
    .changed-files ul {{
      margin: 12px 0 0;
      padding-left: 20px;
      line-height: 1.7;
    }}
    .cards {{
      display: grid;
      gap: 24px;
    }}
    .card {{
      background: var(--surface-strong);
      border: 1px solid var(--border);
      border-radius: 24px;
      box-shadow: var(--shadow);
      overflow: hidden;
    }}
    .card-header {{
      padding: 24px 24px 0;
    }}
    .card-header h2 {{
      font-size: clamp(26px, 4vw, 36px);
    }}
    .meta, .notes {{
      margin: 10px 0 0;
      color: var(--muted);
      line-height: 1.6;
    }}
    .warnings {{
      margin: 14px 0 0;
      padding-left: 20px;
      color: #8a5a16;
    }}
    .shot-grid {{
      display: grid;
      gap: 18px;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      padding: 24px;
    }}
    .shot {{
      margin: 0;
      background: #fff;
      border: 1px solid rgba(61, 92, 93, 0.12);
      border-radius: 18px;
      overflow: hidden;
    }}
    .shot a {{
      display: block;
      background: #f6f3eb;
    }}
    .shot img {{
      display: block;
      width: 100%;
      height: min(70vh, 880px);
      object-fit: contain;
      object-position: top center;
      background: #f6f3eb;
    }}
    figcaption {{
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 14px 16px 16px;
      font-size: 14px;
      color: var(--text);
      font-weight: 600;
    }}
    figcaption span {{
      font-size: 12px;
      color: var(--muted);
      font-weight: 400;
      word-break: break-all;
    }}
    @media (max-width: 720px) {{
      .shell {{
        padding: 20px 14px 40px;
      }}
      .hero, .changed-files {{
        padding: 18px;
      }}
      .shot-grid {{
        padding: 18px;
        grid-template-columns: 1fr;
      }}
      .shot img {{
        height: min(60vh, 680px);
      }}
    }}
  </style>
</head>
<body>
  <main class="shell">
    <section class="hero">
      <div class="eyebrow">Visual Review Board</div>
      <h1>{escape(title)}</h1>
      <p class="subhead">Generated HTML review surface for multiple route screenshots. Desktop and mobile captures stay grouped together so visual QA is faster than opening images one by one.</p>
      <div class="meta-row">
        <div>Generated: {escape(generated_at)}</div>
        <div>Cards: {len(cards)}</div>
      </div>
    </section>
    {changed_block}
    <section class="cards">{cards_html}</section>
  </main>
</body>
</html>
"""


def build_board(screenshot_dir: Path, output_path: Path, title: str, manifest_path: Path | None, repo_root: Path, git_base: str | None) -> dict[str, Any]:
    manifest = load_manifest(manifest_path)
    cards = build_cards(screenshot_dir, manifest)
    changed_files = collect_changed_files(repo_root, git_base)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(render_html(title, cards, changed_files, output_path), encoding="utf-8")
    return {
        "output": str(output_path),
        "cards": len(cards),
        "changed_files": changed_files,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build a local HTML screenshot board for visual review.")
    parser.add_argument("--screenshots", type=Path, required=True, help="Directory containing screenshot files")
    parser.add_argument("--output", type=Path, required=True, help="HTML output path")
    parser.add_argument("--title", default="Seascape Visual Review Board")
    parser.add_argument("--manifest", type=Path, help="Optional JSON manifest keyed by screenshot slug")
    parser.add_argument("--repo-root", type=Path, default=REPO_ROOT)
    parser.add_argument("--git-base", help="Optional git base like origin/main for a changed-file header")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    receipt = build_board(
        screenshot_dir=args.screenshots.resolve(),
        output_path=args.output.resolve(),
        title=args.title,
        manifest_path=args.manifest.resolve() if args.manifest else None,
        repo_root=args.repo_root.resolve(),
        git_base=args.git_base,
    )
    print(json.dumps(receipt, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
