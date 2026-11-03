"""Manual generation: replace only byte-identical upstream Latin faces.
Other original upstream ranges stay in place to preserve existing coverage.
"""
import json
import re
from pathlib import Path


def generate(root, manifest, format_ranges):
    def codes(value):
        result = set()
        for a, b in re.findall(r'U\+([0-9A-Fa-f]+)(?:-([0-9A-Fa-f]+))?', value):
            result.update(range(int(a, 16), int(b or a, 16) + 1))
        return result
    config = json.loads((root/'scripts/fonts/upstream.json').read_text())
    for url, entry in config['stylesheets'].items():
        original = (root/'scripts/fonts/original-styles'/entry['source']).read_text()
        def face(m):
            rule = m[0]
            src = re.search(r'src: url\(([^)]+)\)', rule)
            name = config['equivalent_fonts'].get(src[1]) if src else None
            upstream = {**config['extensions'], **config.get('compatibility_fonts', {})}
            if src and src[1] in upstream:
                name = 'upstream-' + upstream[src[1]]['source']
            if name not in manifest:
                # No Inter or Poppins 300 use; non-Latin-only rules are unused.
                # Existing CJK continues to use system fonts.
                return ''
            # Only the Latin face maps to these byte-identical originals.
            parts = manifest[name]['parts']
            rules = []
            original_scope = codes(re.search(r'unicode-range:\s*([^;]+)', rule)[1])
            for part in parts:
                coverage = codes(parts[part]['unicode_range']) & original_scope
                if not coverage:
                    continue
                declared = format_ranges(coverage)
                family = re.search(r'font-family:\s*[\"\']([^\"\']+)', rule)[1]
                if family == 'Instrument Serif' and name.startswith('upstream-'):
                    # Preserve the original provider eligibility for native canonical fallback.
                    declared = re.search(r'unicode-range:\s*([^;]+)', rule)[1]
                    parts[part]['legacy_provider_scope'] = True
                allowed = parts[part].setdefault('provider_unicode_ranges', [])
                if declared not in allowed:
                    allowed.append(declared)
                new = rule.replace(src[1], '/' + parts[part]['path'].removeprefix('src/'))
                new = re.sub(r'unicode-range:[^;]+;', 'unicode-range: '+declared+';', new)
                rules.append(new)
            return '\n'.join(rules)
        generated = re.sub(r'@font-face\s*\{[^}]*\}', face, original)
        dest = root/'src'/entry['output'].lstrip('/')
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text('/* Generated manually by scripts/fonts/subset.py; preserve face order. */\n'+generated)
