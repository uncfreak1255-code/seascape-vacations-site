#!/usr/bin/env python3
"""Manual only: subset immutable originals, then update their existing CSS faces.
See docs/process/web-fonts.md. Never called by the site build.
"""
import argparse
import hashlib
import json
import re
import shutil
import unicodedata
from pathlib import Path
import fontTools
from fontTools import subset
from shaping import core_closure
from font_output import write_font
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parents[2]
SOURCES = Path(__file__).resolve().parent / 'originals'
# Browser-default Latin shaping. No CSS enables optional fractions/numerals.
FEATURES = ['calt', 'ccmp', 'liga', 'locl', 'rlig', 'kern', 'mark', 'mkmk']
CORE = set(range(0x20, 0x7f)) | {0xa0, 0xa9, 0x2018, 0x2019, 0x201c, 0x201d,
    0x2013, 0x2014, 0x2026, 0x2022, 0x203a, 0x2192}
LATIN = set(range(0x20, 0x180))
# HarfBuzz can render Latin Extended-A through canonical decomposition even
# when its precomposed codepoint is absent from cmap. Keep those combining marks.
ACCENTS = {0xA8, 0xAF, 0xB4, 0xB8} | set(range(0x2B0, 0x370))
DECOMPOSED = {ord(ch) for c in LATIN for ch in unicodedata.normalize('NFD', chr(c)) if ord(ch) not in LATIN}


def ranges(codes):
    runs = []
    for c in sorted(codes):
        if runs and c == runs[-1][1] + 1:
            runs[-1][1] = c
        else:
            runs.append([c, c])
    return ','.join(f'U+{a:X}' + (f'-{b:X}' if b != a else '') for a, b in runs)


def inspect(p):
    f = TTFont(p)
    return {'bytes': p.stat().st_size, 'glyphs': f['maxp'].numGlyphs,
        'unicode_range': ranges(f.getBestCmap()),
        'axes': {a.axisTag: [a.minValue, a.defaultValue, a.maxValue]
                 for a in f['fvar'].axes} if 'fvar' in f else {},
        'features': {t: sorted({r.FeatureTag for r in f[t].table.FeatureList.FeatureRecord})
                     for t in ['GSUB', 'GPOS'] if t in f},
        'hint_tables': [t for t in ['fpgm', 'prep', 'cvt ', 'gasp'] if t in f],
        'hinted_glyphs': sum(bool(getattr(g, 'program', None) and g.program.getBytecode())
                             for g in [f['glyf'][g] for g in f.getGlyphOrder()]) if 'glyf' in f else 0}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--whole-instrument', action='store_true', help='comparison only: deliver Instrument as whole Latin faces')
    parser.add_argument('--split-poppins', action='store_true', help='comparison only: changes symbol rasterization at subset boundaries')
    parser.add_argument('--limit-weight', action='store_true', help='comparison candidate only: changes intermediate Playfair rasterization')
    parser.add_argument('--keep-hinting', action='store_true', help='comparison candidate only')
    args = parser.parse_args()
    if fontTools.__version__ != '4.68.0':
        parser.error('use scripts/fonts/requirements.txt: FontTools version changes require new pixel proof')
    if not (ROOT/'_site/index.html').exists():
        parser.error('build the current content first: npm run build')
    # Rendered content plus generated CSS/JS text (including escaped CSS characters).
    text = ''.join(p.read_text() for base in ['src', '_site'] for p in (ROOT/base).rglob('*')
                   if p.suffix in ['.html', '.njk', '.css', '.js', '.json', '.md'])
    used = {ord(c) for c in text} | {0x2010}  # automatic hyphenation safety
    used |= {int(m, 16) for m in re.findall(r'\\([0-9a-fA-F]{1,6})(?:\s|(?=[^0-9a-fA-F]))', ''.join(p.read_text() for p in (ROOT/'src/css').rglob('*.css')))}
    manifest = {}
    for source in sorted(SOURCES.glob('*.woff2')):
        folder = 'guest' if source.stem.startswith('instrument') else 'homepage'
        dest = ROOT/'src/assets/fonts'/folder
        original = TTFont(source)
        supported = set(original.getBestCmap())
        # Browser hyphen fallback maps U+2010 to the face's hyphen glyph.
        # It must be explicit once unicode-range partitions the faces.
        if 0x2010 not in supported and 0x2d in supported:
            for table in original['cmap'].tables:
                if table.isUnicode():
                    table.cmap[0x2010] = table.cmap[0x2d]
            supported.add(0x2010)
        keep = supported & (LATIN | DECOMPOSED | ACCENTS | used | CORE)
        seed = LATIN if source.stem.startswith('playfair') else {c for c in LATIN if unicodedata.category(chr(c)).startswith('L')}
        core = core_closure(original, CORE | DECOMPOSED | ACCENTS | seed | {0x2010}) & keep
        legacy_range = source.stem.startswith('instrument') and args.whole_instrument
        if legacy_range or source.stem.startswith('playfair') or (source.stem.startswith('poppins') and not args.split_poppins):
            core = keep
        manifest[source.name] = {'original': inspect(source), 'source_sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'parts': {}}
        for part, codes in [('core', core), ('extended', keep - core)]:
            if not codes:
                continue
            f = TTFont(source, recalcTimestamp=False)
            if 0x2010 in codes:
                for table in f['cmap'].tables:
                    if table.isUnicode():
                        table.cmap[0x2010] = table.cmap[0x2d]
            if 'fvar' in f and args.limit_weight:
                # CSS advertises 400–700; computed 300 clamps to 400. No variation override.
                f = instantiateVariableFont(f, {'wght': (400, 700)}, inplace=True)
            # Some partially instantiated fonts omit invariant glyph entries.
            if 'gvar' in f:
                for glyph in f.getGlyphOrder():
                    if glyph not in f['gvar'].variations:
                        f['gvar'].variations[glyph] = []
            options = subset.Options()
            options.hinting = args.keep_hinting
            # CoreText rasterizes Poppins differently without its PostScript glyph names.
            options.glyph_names = True
            options.notdef_outline = True
            options.name_IDs = ['*']
            options.layout_features = FEATURES
            options.recalc_timestamp = False
            options.canonical_order = True
            sub = subset.Subsetter(options=options)
            sub.populate(unicodes=codes)
            sub.subset(f)
            # FontTools adds bidi mirror mappings; keep only this partition's cmap.
            for table in f['cmap'].tables:
                if table.isUnicode():
                    table.cmap = {c:g for c,g in table.cmap.items() if c in codes}
            # Playfair's OFL reserves its name. CSS family remains an external alias.
            if source.stem.startswith('playfair'):
                for n in f['name'].names:
                    if n.nameID in [1, 3, 4, 6, 16, 17, 21, 22, 25] or n.nameID >= 256:
                        value = n.toUnicode().replace('Playfair Display', 'Seascape Display Subset').replace('PlayfairDisplay', 'SeascapeDisplaySubset')
                        n.string = value.encode(n.getEncoding())
            # Preserve global metrics/bounds too; CoreText uses them in rasterization.
            f.recalcBBoxes = False
            for table in ['head', 'hhea', 'OS/2']:
                for key, value in vars(original[table]).items():
                    if key not in ['numberOfHMetrics', 'checkSumAdjustment']:
                        setattr(f[table], key, value)
            f.flavor = 'woff2'
            output = write_font(f, dest, source.stem+'-'+part)
            actual = TTFont(output)
            assert set(actual.getBestCmap()) == codes, f'{output}: unexpected cmap'
            if not args.keep_hinting:
                assert not any(t in actual for t in ['fpgm', 'prep', 'cvt '])
            if 'fvar' in actual and args.limit_weight:
                assert [(a.axisTag, a.minValue, a.maxValue) for a in actual['fvar'].axes] == [('wght', 400, 700)]
            manifest[source.name]['parts'][part] = {'path': str(output.relative_to(ROOT)), **inspect(output)}
            if legacy_range:
                manifest[source.name]['parts'][part]['legacy_unrestricted'] = True
        # Existing immutable font URLs keep their original bytes for cached CSS.
        shutil.copyfile(source, dest/source.name)
    # Only replace this script's generated pairs. Never insert a fallback face.
    for p in (ROOT/'src').rglob('*'):
        if p.suffix not in ['.css', '.njk', '.html'] or p == ROOT/'src/property-management/property-management.njk':
            continue
        content = p.read_text()
        content = re.sub(r'@font-face\s*\{(?:\{\{.*?\}\}|[^{}])*-extended(?:-[0-9a-f]+)?\.woff2(?:\{\{.*?\}\}|[^{}])*\}\s*', '', content)
        def face(m):
            rule = m[0]
            url = re.search(r'/assets/fonts/(?:guest|homepage)/([^\"\')]+\.woff2)', rule)
            name = next((n for n in manifest if not n.startswith('upstream-') and url and
                (url[1] == n or url[1].startswith(Path(n).stem+'-core-'))), None)
            if not name:
                return rule
            rule = re.sub(r';?\s*unicode-range\s*:[^;}]+;?', '', rule)
            parts = manifest[name]['parts']
            core_url = '/' + parts['core']['path'].removeprefix('src/')
            rule = rule.replace(url[0], core_url)
            if parts['core'].get('legacy_unrestricted'):
                return rule
            core = rule[:-1].rstrip().rstrip(';') + ';unicode-range:' + parts['core']['unicode_range'] + ';}'
            if 'extended' not in parts:
                return core
            ext = rule.replace(core_url, '/' + parts['extended']['path'].removeprefix('src/'))
            ext = ext[:-1].rstrip().rstrip(';') + ';unicode-range:' + parts['extended']['unicode_range'] + ';}'
            return core + '\n' + ext
        content = re.sub(r'@font-face\s*\{(?:\{\{.*?\}\}|[^{}])*\}', face, content)
        if content != p.read_text():
            p.write_text(content)
    from extension_fonts import generate as extensions
    manifest.update(extensions(ROOT, inspect, ranges, FEATURES, DECOMPOSED))
    from localize_styles import generate
    generate(ROOT, manifest, ranges)
    urls = {('/assets/fonts/' + ('guest/' if name.startswith('instrument') else 'homepage/') + name): '/' + data['parts']['core']['path'].removeprefix('src/') for name, data in manifest.items() if not name.startswith('upstream-')}
    config = json.loads((ROOT/'scripts/fonts/upstream.json').read_text())
    urls.update({url: entry['output'] for url, entry in config['stylesheets'].items()})
    revision = hashlib.sha256(json.dumps(manifest, sort_keys=True).encode()).hexdigest()[:12]
    references = {'urls': urls, 'css_revision': revision, 'css_paths': ['/css/guest.css', '/css/activity-guide.css', '/css/comparison-guide.css', '/css/decision-ledger.css']}
    (ROOT/'scripts/fonts/references.json').write_text(json.dumps(references, indent=2) + '\n')
    inventory = {name: {'original': data.pop('original'), 'source_sha256': data.pop('source_sha256')} for name, data in manifest.items()}
    for source in (ROOT/'src/assets/fonts/guest').glob('*.ttf'):
        inventory['unserved-' + source.name] = {'original': inspect(source), 'source_sha256': hashlib.sha256(source.read_bytes()).hexdigest()}
    (ROOT/'scripts/fonts/original-inventory.json').write_text(json.dumps(inventory, indent=2) + '\n')
    (ROOT/'scripts/fonts/manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    for name, data in manifest.items():
        print(name, inventory[name]['original']['bytes'], '->', {k:v['bytes'] for k,v in data['parts'].items()})


if __name__ == '__main__':
    main()
