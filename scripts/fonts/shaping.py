"""Keep kerning-connected encoded characters in the same font partition."""
from fontTools.ttLib.tables.otTables import PairPos


def core_closure(font, core):
    cmap = font.getBestCmap()
    glyphs = set(font.getGlyphOrder())
    selected = {cmap[c] for c in core if c in cmap}
    edges = []
    if 'GPOS' not in font:
        return core
    for lookup in font['GPOS'].table.LookupList.Lookup:
        for sub in lookup.SubTable:
            if hasattr(sub, 'ExtSubTable'):
                sub = sub.ExtSubTable
            if not isinstance(sub, PairPos):
                continue
            if sub.Format == 1:
                for left, pairs in zip(sub.Coverage.glyphs, sub.PairSet):
                    for pair in pairs.PairValueRecord:
                        if any(getattr(pair, key, None) and any(vars(getattr(pair, key)).values()) for key in ['Value1', 'Value2']):
                            edges.append(({left}, {pair.SecondGlyph}))
            elif sub.Format == 2:
                lefts = {g:sub.ClassDef1.classDefs.get(g, 0) for g in sub.Coverage.glyphs}
                rights = {g:sub.ClassDef2.classDefs.get(g, 0) for g in glyphs}
                for i, row in enumerate(sub.Class1Record):
                    for j, pair in enumerate(row.Class2Record):
                        if any(getattr(pair, key, None) and any(vars(getattr(pair, key)).values()) for key in ['Value1', 'Value2']):
                            edges.append(({g for g,c in lefts.items() if c==i}, {g for g,c in rights.items() if c==j}))
    changed = True
    while changed:
        changed = False
        for left, right in edges:
            if selected & (left | right) and not (left | right) <= selected:
                selected |= left | right
                changed = True
    return core | {c for c,g in cmap.items() if g in selected}
