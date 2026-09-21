const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const {
  LIVE_ORIGIN,
  MIN_UI_ICONS,
  absolutize,
  annotateTokenCss,
  clearRenderReceipt,
  extract,
  listPreviewCards,
  loadWaterline,
  parseUiIcons,
  requireScenePhoto,
  resolveOutDir,
  stripFontFace,
  tokenKind,
} = require("../design/design-sync/lib");

const projectRoot = path.resolve(__dirname, "..", "..");

function spawnBuild(outArg) {
  return spawnSync(process.execPath, ["scripts/design/design-sync/build.js", "--out", outArg], {
    cwd: projectRoot,
    encoding: "utf8",
  });
}

test("--out outside .design-sync/ is refused before the bundle folder is wiped", () => {
  const root = path.join(os.tmpdir(), "design-sync-root");
  assert.throws(() => resolveOutDir(root, "/tmp/design-sync-escape"), /--out must resolve inside/);
  assert.throws(() => resolveOutDir(root, ".."), /--out must resolve inside/);
  assert.throws(() => resolveOutDir(root, path.join(root, "out")), /--out must resolve inside/);

  const inside = resolveOutDir(root, ".design-sync/out");
  assert.equal(inside.OUT, path.join(root, ".design-sync", "out"));
  assert.equal(inside.SYNC_ROOT, path.join(root, ".design-sync"));
  assert.equal(resolveOutDir(root, ".design-sync").OUT, path.join(root, ".design-sync"));
});

test("build.js still enforces the --out confinement at the script edge", () => {
  const escaped = spawnBuild("/tmp/design-sync-escape");
  assert.notEqual(escaped.status, 0);
  assert.match(`${escaped.stderr}${escaped.stdout}`, /--out must resolve inside/);
  assert.equal(fs.existsSync("/tmp/design-sync-escape"), false);
});

test("a DESIGN.md without a waterline block is refused instead of emitting legacy tokens", () => {
  assert.throws(() => loadWaterline("# no front matter\n"), /no YAML front matter/);
  assert.throws(
    () => loadWaterline("---\ncolors:\n  paper: '#fff'\n---\n"),
    /no waterline block/
  );
  assert.throws(
    () => loadWaterline("---\nwaterline:\n  colors:\n    paper: '#fff'\n---\n"),
    /no waterline block/
  );
  const wl = loadWaterline("---\nwaterline:\n  colors:\n    paper: '#FFF8EE'\n  typography:\n    display:\n      fontFamily: Instrument Serif\n---\n");
  assert.equal(wl.colors.paper, "#FFF8EE");
  const live = loadWaterline(fs.readFileSync(path.join(projectRoot, "DESIGN.md"), "utf8"));
  assert.ok(live.colors.ink && live.typography.display);
});

test("@font-face stripping tolerates whitespace before the brace", () => {
  const css = [
    "@font-face{font-family:'Poppins';src:url(a.woff2)}",
    "@font-face {font-family:'Instrument Serif';src:url(b.woff2)}",
    "@font-face\n{font-family:Arial;src:url(c.woff2)}",
    "body{font-family:Poppins,sans-serif}",
  ].join("\n");
  assert.equal(stripFontFace(css).trim(), "body{font-family:Poppins,sans-serif}");
});

test("extract requires the named component and keeps nested same-tag children", () => {
  const html = [
    '<header class="g-header other"><div class="inner"><span>ok</span></div></header>',
    '<header class="g-header"><p>second</p></header>',
    '<section class="g-home-trip"><div><div>nested</div></div></section>',
  ].join("");
  assert.equal(extract(html, "g-header"), '<header class="g-header other"><div class="inner"><span>ok</span></div></header>');
  assert.equal(extract(html, "g-header", 1), '<header class="g-header"><p>second</p></header>');
  assert.match(extract(html, "g-home-trip"), /nested/);
  assert.throws(() => extract(html, "g-footer"), /Component \.g-footer \(#0\) not found/);
  assert.throws(() => extract("<div class=\"g-header\">unclosed", "g-header"), /Unbalanced/);
});

test("root-relative card URLs, including srcset, are rewritten to the live origin", () => {
  const html = '<img src="/photos/oasis.jpg" srcset="/photos/oasis.jpg 1x, /photos/oasis-2x.jpg 2x" href="/x" poster="/p.jpg">';
  const rewritten = absolutize(html);
  assert.match(rewritten, new RegExp(`src="${LIVE_ORIGIN}/photos/oasis.jpg"`));
  assert.match(rewritten, new RegExp(`srcset="${LIVE_ORIGIN}/photos/oasis.jpg 1x, ${LIVE_ORIGIN}/photos/oasis-2x.jpg 2x"`));
  assert.equal(absolutize('<img src="https://cdn.example/x.jpg">'), '<img src="https://cdn.example/x.jpg">');
});

test("the header-over-photo scene URL is required and absolutized", () => {
  assert.throws(() => requireScenePhoto('<img src="/photos/oasis.jpg">'), /scene photo not found/);
  assert.equal(
    requireScenePhoto('<img class="g-scene-photo" src="/photos/oasis.jpg" alt="">'),
    `${LIVE_ORIGIN}/photos/oasis.jpg`
  );
});

test("the icon parser fails closed below ten icons and still reads the live partial", () => {
  assert.throws(() => parseUiIcons(""), /yielded only 0 icons/);
  assert.throws(() => parseUiIcons("{% if name == \"star\" %}\n<svg></svg>"), /yielded only 1 icons/);
  const icons = parseUiIcons(fs.readFileSync(path.join(projectRoot, "src/_includes/partials/ui-icon.njk"), "utf8"));
  assert.ok(icons.length >= MIN_UI_ICONS);
  assert.ok(icons.some((icon) => icon.name === "arrow-up-right" && icon.svg.includes("<svg")));
  const names = icons.map((icon) => icon.name);
  assert.equal(new Set(names).size, names.length);
});

test("generated tokens get a Claude Design @kind annotation", () => {
  assert.equal(tokenKind("--wl-radius-button", "4px"), "radius");
  assert.equal(tokenKind("--wl-ink", "#173D42"), "color");
  assert.equal(tokenKind("--wl-h1", "clamp(46px,5.4vw,78px)"), "font");
  assert.equal(tokenKind("--wl-body-size", "15px"), "font");
  assert.equal(tokenKind("--wl-control-min", "48px"), "spacing");
  const annotated = annotateTokenCss("  --wl-ink:#173D42;\n  --wl-radius-button:4px; /* keep */\n");
  assert.match(annotated, /--wl-ink:#173D42; \/\* @kind color \*\//);
  assert.match(annotated, /--wl-radius-button:4px; \/\* @kind radius \*\/ \/\* keep \*\//);
});

test("render-check refuses an empty preview and deletes a stale passing receipt", () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "design-sync-render-"));
  const renderDir = path.join(out, "_render");
  fs.mkdirSync(path.join(out, "preview"), { recursive: true });
  fs.mkdirSync(renderDir, { recursive: true });
  const receipt = path.join(renderDir, "render-check.json");
  fs.writeFileSync(receipt, JSON.stringify({ total: 20, bad: 0, results: [] }));

  assert.throws(() => listPreviewCards(out), /No preview cards/);
  assert.equal(clearRenderReceipt(out), receipt);
  assert.equal(fs.existsSync(receipt), false);
  fs.writeFileSync(path.join(out, "preview", "nav.html"), "<html></html>");
  assert.deepEqual(listPreviewCards(out), ["nav.html"]);
});
