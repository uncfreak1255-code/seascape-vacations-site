#!/usr/bin/env python3
import argparse
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

LINK_RE = re.compile(r'href=["\']([^"\']+)["\']', re.IGNORECASE)
TEMPLATE_TOKEN_RE = re.compile(r"{{.*?}}|{%.+?%}")


def source_url(path: Path, repo: Path) -> str:
    rel = path.relative_to(repo)
    parts = rel.parts
    if not parts or parts[0] != "src":
        return "/"
    p = "/" + "/".join(parts[1:])
    for ext in (".njk", ".md", ".html"):
        if p.endswith(ext):
            p = p[: -len(ext)]
            break
    p = p.replace("/index", "/")
    p = p.replace("//", "/")
    if not p.endswith("/"):
        p += "/"
    return p


def normalize_href(href: str) -> str | None:
    href = href.strip()
    if not href:
        return None
    if href.startswith(("mailto:", "tel:", "javascript:")):
        return None
    if TEMPLATE_TOKEN_RE.search(href):
        return None
    if href.startswith("http://") or href.startswith("https://"):
        return None
    if href.startswith("#"):
        return None
    href = href.split("#", 1)[0].split("?", 1)[0].strip()
    if not href.startswith("/"):
        return None
    href = href.replace("//", "/")
    if not href.endswith("/"):
        href += "/"
    return href


def family(url: str) -> str:
    if url.startswith("/property-management/"):
        return "owner"
    if url.startswith("/guides/"):
        return "guide"
    if url.startswith("/stays/"):
        return "stay"
    if url.startswith("/research/"):
        return "research"
    return "other"


def donor_priority(fam: str) -> list[str]:
    if fam == "owner":
        return ["guide", "research", "other", "owner", "stay"]
    if fam == "stay":
        return ["guide", "other", "research", "stay", "owner"]
    if fam == "guide":
        return ["guide", "research", "other", "stay", "owner"]
    return ["guide", "other", "research", "owner", "stay"]


def fmt_table(rows: list[dict]) -> str:
    headers = ["family", "pages", "avg_inbound", "target_inbound"]
    out = ["| " + " | ".join(headers) + " |", "|---|---:|---:|---:|"]
    for r in rows:
        out.append(
            f"| {r['family']} | {r['pages']} | {r['avg_inbound']:.2f} | {r['target_inbound']:.2f} |"
        )
    return "\n".join(out)


def analyze(repo: Path) -> dict:
    files = list(repo.glob("src/**/*.njk")) + list(repo.glob("src/**/*.md")) + list(
        repo.glob("src/**/*.html")
    )

    inbound_by_page = Counter()
    outbounds = defaultdict(set)
    pages = set()

    for file in files:
        src = source_url(file, repo)
        pages.add(src)
        text = file.read_text(encoding="utf-8", errors="ignore")
        for href in LINK_RE.findall(text):
            dst = normalize_href(href)
            if not dst or dst == src:
                continue
            outbounds[src].add(dst)

    for destinations in outbounds.values():
        for dst in destinations:
            inbound_by_page[dst] += 1
            pages.add(dst)

    family_pages = defaultdict(list)
    for page in pages:
        family_pages[family(page)].append(page)

    guide_avg = 0.0
    if family_pages["guide"]:
        guide_avg = sum(inbound_by_page[p] for p in family_pages["guide"]) / len(
            family_pages["guide"]
        )

    family_rows = []
    for fam, fam_pages in sorted(family_pages.items()):
        avg_inbound = sum(inbound_by_page[p] for p in fam_pages) / max(len(fam_pages), 1)
        if fam == "guide":
            target = max(avg_inbound, guide_avg)
        elif fam == "owner":
            target = max(avg_inbound, guide_avg * 0.35)
        elif fam == "stay":
            target = max(avg_inbound, guide_avg * 0.30)
        else:
            target = max(avg_inbound, guide_avg * 0.20)
        family_rows.append(
            {
                "family": fam,
                "pages": len(fam_pages),
                "avg_inbound": avg_inbound,
                "target_inbound": target,
            }
        )

    underlinked = []
    for page in sorted(pages):
        fam = family(page)
        fam_target = next((r["target_inbound"] for r in family_rows if r["family"] == fam), 0)
        current = inbound_by_page[page]
        gap = int(round(max(0, fam_target - current)))
        if gap > 0:
            underlinked.append({"page": page, "family": fam, "current": current, "gap": gap})

    underlinked.sort(key=lambda x: (x["family"] != "owner", -x["gap"], x["page"]))

    pages_by_family = defaultdict(list)
    for p in sorted(pages):
        pages_by_family[family(p)].append(p)

    top_sources_by_family = {}
    for fam_name, fam_pages in pages_by_family.items():
        ranked = sorted(fam_pages, key=lambda p: len(outbounds.get(p, set())), reverse=True)
        top_sources_by_family[fam_name] = ranked[:8]

    donor_suggestions = []
    for row in underlinked[:12]:
        target_page = row["page"]
        target_family = row["family"]
        suggestions = []
        for donor_family in donor_priority(target_family):
            for donor_page in top_sources_by_family.get(donor_family, []):
                if donor_page == target_page:
                    continue
                if target_page in outbounds.get(donor_page, set()):
                    continue
                suggestions.append(donor_page)
                if len(suggestions) >= 5:
                    break
            if len(suggestions) >= 5:
                break
        donor_suggestions.append(
            {
                "target_page": target_page,
                "target_family": target_family,
                "gap": row["gap"],
                "suggested_donors": suggestions,
            }
        )

    return {
        "files_scanned": len(files),
        "families": family_rows,
        "top_underlinked": underlinked[:25],
        "donor_suggestions": donor_suggestions,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Analyze internal link graph and propose inbound targets")
    parser.add_argument("--repo", required=True, type=Path, help="Path to repository root")
    parser.add_argument("--format", choices=["markdown", "json"], default="markdown")
    args = parser.parse_args()

    result = analyze(args.repo)
    if args.format == "json":
        print(json.dumps(result, indent=2))
        return

    print("# Internal Link Graph Targeting")
    print(f"Files scanned: {result['files_scanned']}")
    print()
    print("## Family Inbound Summary")
    print(fmt_table(result["families"]))
    print()
    print("## Top Underlinked Pages")
    print("| page | family | current_inbound | gap_to_target |")
    print("|---|---|---:|---:|")
    for row in result["top_underlinked"]:
        print(f"| {row['page']} | {row['family']} | {row['current']} | {row['gap']} |")
    print()
    print("## Donor Page Suggestions")
    for item in result["donor_suggestions"]:
        donors = ", ".join(item["suggested_donors"]) if item["suggested_donors"] else "(none found)"
        print(
            f"- Target: {item['target_page']} ({item['target_family']}, gap {item['gap']})\n  Suggested donors: {donors}"
        )


if __name__ == "__main__":
    main()
