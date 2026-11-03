"""Retain the existing upstream Latin Extended-A fallback layer locally."""
import hashlib
import json
import re
from font_output import write_font, write_bytes
from fontTools import subset
from fontTools.ttLib import TTFont


def generate(root, inspect, ranges, features, decomposed):
    config = json.loads((root/'scripts/fonts/upstream.json').read_text())
    result = {}
    folder = root/'src/assets/fonts/extended'
    folder.mkdir(parents=True, exist_ok=True)
    entries = {**config['extensions'], **config.get('compatibility_fonts', {})}
    for url, entry in entries.items():
        source = root/'scripts/fonts/extended-originals'/entry['source']
        assert hashlib.sha256(source.read_bytes()).hexdigest() == entry['sha256']
        original = TTFont(source)
        compat = url in config.get('compatibility_fonts', {})
        scope = set()
        if compat:
            for a, b in re.findall(r'U\+([0-9A-Fa-f]+)(?:-([0-9A-Fa-f]+))?', entry['unicode_range']):
                scope.update(range(int(a, 16), int(b or a, 16) + 1))
        codes = (set(original.getBestCmap()) & scope) if compat else set(original.getBestCmap()) & (set(range(0x100, 0x180)) | decomposed)
        if compat:
            # Distinct upstream Latin builds cannot be replaced by the local face.
            # Preserve this fallback layer and its exact bytes.
            output = write_bytes(source.read_bytes(), folder, source.stem)
            result['upstream-'+entry['source']] = {'original': inspect(source), 'source_sha256': entry['sha256'],
                'parts': {'extended': {'path': str(output.relative_to(root)), **inspect(output), 'unicode_range': ranges(codes)}}}
            continue
        font = TTFont(source, recalcTimestamp=False)
        options = subset.Options()
        options.hinting = False
        options.layout_features = features
        options.glyph_names = True
        options.notdef_outline = True
        options.name_IDs = ['*']
        sub = subset.Subsetter(options=options)
        sub.populate(unicodes=codes)
        sub.subset(font)
        for table in font['cmap'].tables:
            if table.isUnicode():
                table.cmap = {c:g for c,g in table.cmap.items() if c in codes}
        if entry['family'] == 'Playfair Display':
            for name in font['name'].names:
                if name.nameID in [1, 3, 4, 6, 16, 17, 21, 22, 25] or name.nameID >= 256:
                    name.string = name.toUnicode().replace('Playfair Display', 'Seascape Display Subset').replace('PlayfairDisplay', 'SeascapeDisplaySubset').encode(name.getEncoding())
        font.recalcBBoxes = False
        for table in ['head', 'hhea', 'OS/2']:
            for key, value in vars(original[table]).items():
                if key not in ['numberOfHMetrics', 'checkSumAdjustment']:
                    setattr(font[table], key, value)
        font.flavor = 'woff2'
        output = write_font(font, folder, source.stem)
        assert set(TTFont(output).getBestCmap()) == codes
        result['upstream-'+entry['source']] = {'original': inspect(source), 'source_sha256': entry['sha256'],
            'parts': {'extended': {'path': str(output.relative_to(root)), **inspect(output)}}}
    return result
