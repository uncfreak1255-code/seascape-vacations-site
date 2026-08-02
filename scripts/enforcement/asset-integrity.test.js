"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "..", "..");

// Why this exists: on 2026-07-28, images/anna-maria-island-og.jpg reached main as
// 40 bytes of random binary (no JPEG header) and rode through three merges before
// #495 restored it. Nothing caught it. lint:content reads text, verify:release
// validates links and JSON-LD, and the visual suite only diffs moneyRoutes - so a
// corrupt binary is invisible to every existing gate while it ships a broken
// Open Graph image to every social and AI-citation surface that reads it.
//
// This checks the file is what its extension claims by MAGIC BYTES, not just by
// size. The corrupt blob began 6d ab 1e eb; a real JPEG begins ff d8 ff. Size
// alone would be a weaker and more false-positive-prone rule.

// First bytes that must be present for each container. WEBP and ICO need a
// second check beyond the first four bytes, handled below.
const MAGIC = {
  ".jpg": [[0xff, 0xd8, 0xff]],
  ".jpeg": [[0xff, 0xd8, 0xff]],
  ".png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  ".gif": [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
  ],
  ".webp": [[0x52, 0x49, 0x46, 0x46]], // "RIFF", plus "WEBP" at offset 8
  ".ico": [[0x00, 0x00, 0x01, 0x00]],
  ".avif": [], // brand checked at offset 4 ("ftyp")
};

const RASTER_EXTENSIONS = new Set(Object.keys(MAGIC));
const SVG_EXTENSION = ".svg";

// A raster image with real pixel data is never this small. Kept deliberately low
// (the smallest real raster in the repo is ~23KB) so this fires on corruption and
// truncation, never on a legitimately optimized asset.
const MIN_RASTER_BYTES = 512;

function trackedImages() {
  const out = execFileSync("git", ["ls-files", "-z"], {
    cwd: projectRoot,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  return out
    .split("\0")
    .filter(Boolean)
    .filter((rel) => {
      const ext = path.extname(rel).toLowerCase();
      return RASTER_EXTENSIONS.has(ext) || ext === SVG_EXTENSION;
    })
    // Screenshot baselines are Playwright-generated and already diffed by the
    // visual suite; they are not shipped assets.
    .filter((rel) => !rel.startsWith("tests/visual/__screenshots__/"));
}

function startsWith(buffer, bytes) {
  if (buffer.length < bytes.length) {
    return false;
  }
  return bytes.every((byte, index) => buffer[index] === byte);
}

function describeHead(buffer) {
  return [...buffer.subarray(0, 8)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ");
}

// Files whose bytes are a VALID image of a different type than their extension
// claims. Pre-existing on main; browsers sniff content so they render, but
// Netlify serves Content-Type from the extension, so strict consumers (some mail
// clients, some social/AI crawlers, the Organization-schema logo reader) can be
// handed image/png bytes that are actually JPEG. Real but low severity and NOT
// this guard's job to fix, so it is pinned rather than blocking.
//
// THIS LIST MAY ONLY SHRINK. Re-encode the file to match its extension (or
// rename it and update every reference) and delete the entry. Adding a new entry
// means shipping a new mislabeled asset - fix the asset instead.
const KNOWN_EXTENSION_MISMATCHES = new Set([
  "images/owner-field-anna-maria.jpg",
  "images/owner-field-bradenton.jpg",
  "images/owner-field-sarasota.jpg",
  "images/owner-field-siesta-key.jpg",
  "logo-optimized.png",
  "logo-white-optimized.png",
  "logo-white.png",
  "logo.png",
]);

// Every container this repo ships, for the "is it a valid image at all" check.
const ANY_IMAGE_SIGNATURES = [
  { label: "jpeg", test: (b) => startsWith(b, [0xff, 0xd8, 0xff]) },
  { label: "png", test: (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) },
  { label: "gif", test: (b) => startsWith(b, [0x47, 0x49, 0x46, 0x38]) },
  {
    label: "webp",
    test: (b) => startsWith(b, [0x52, 0x49, 0x46, 0x46]) && b.subarray(8, 12).toString("ascii") === "WEBP",
  },
  { label: "ico", test: (b) => startsWith(b, [0x00, 0x00, 0x01, 0x00]) },
  { label: "isobmff/avif", test: (b) => b.subarray(4, 8).toString("ascii") === "ftyp" },
];

function identify(buffer) {
  return ANY_IMAGE_SIGNATURES.find((sig) => sig.test(buffer))?.label || null;
}

// THE CORRUPTION GATE. This is the one that had to exist: a tracked image whose
// bytes are not a valid image of ANY type, or that is too small to hold pixel
// data. The 2026-07-28 regression was 40 bytes beginning 6d ab 1e eb.
test("tracked raster images contain valid image data", () => {
  const broken = [];

  for (const rel of trackedImages()) {
    const ext = path.extname(rel).toLowerCase();
    if (ext === SVG_EXTENSION) {
      continue;
    }

    const absolute = path.join(projectRoot, rel);
    if (!fs.existsSync(absolute)) {
      continue; // deleted-but-staged states are the diff's problem, not this test's
    }

    const buffer = fs.readFileSync(absolute);

    if (buffer.length < MIN_RASTER_BYTES) {
      broken.push(`${rel}: ${buffer.length} bytes - too small to contain image data`);
      continue;
    }

    if (!identify(buffer)) {
      broken.push(`${rel}: not a valid image of any known type (head: ${describeHead(buffer)})`);
    }
  }

  assert.deepEqual(
    broken,
    [],
    "Corrupt or truncated tracked image(s). No other gate in this repo inspects " +
      "binary content: lint:content reads text, verify:release checks links and " +
      "JSON-LD, and the visual suite only diffs moneyRoutes - so this ships a " +
      "broken image everywhere it is referenced:\n  " + broken.join("\n  ")
  );
});

// The advisory half: content valid, extension wrong. Ratchets down only.
test("tracked images match their extension, except known pinned mismatches", () => {
  const mismatched = [];
  const stale = new Set(KNOWN_EXTENSION_MISMATCHES);

  for (const rel of trackedImages()) {
    const ext = path.extname(rel).toLowerCase();
    if (ext === SVG_EXTENSION) {
      continue;
    }
    const absolute = path.join(projectRoot, rel);
    if (!fs.existsSync(absolute)) {
      continue;
    }
    const buffer = fs.readFileSync(absolute);
    const actual = identify(buffer);
    if (!actual) {
      continue; // corruption is the previous test's finding, not this one's
    }

    const expected =
      ext === ".jpg" || ext === ".jpeg"
        ? "jpeg"
        : ext === ".avif"
          ? "isobmff/avif"
          : ext.slice(1);

    if (actual !== expected) {
      if (KNOWN_EXTENSION_MISMATCHES.has(rel)) {
        // Legitimately still pinned: mismatched today, entry earns its place.
        stale.delete(rel);
      } else {
        mismatched.push(`${rel}: extension says ${expected}, bytes are ${actual}`);
      }
    }
    // A file that MATCHES its extension is deliberately NOT removed from `stale`.
    // If it is also pinned, the pin is unnecessary and the stale assertion below
    // reports it. Clearing `stale` here would let anyone pre-pin a correct file
    // and then quietly mislabel it later with the gate already silenced.
  }

  assert.deepEqual(
    mismatched,
    [],
    "New mislabeled image(s). Netlify serves Content-Type from the extension, so " +
      "these hand strict consumers the wrong type. Re-encode to match the " +
      "extension rather than adding to KNOWN_EXTENSION_MISMATCHES:\n  " +
      mismatched.join("\n  ")
  );

  assert.deepEqual(
    [...stale],
    [],
    "KNOWN_EXTENSION_MISMATCHES lists file(s) that are now correct or gone. The " +
      "list may only shrink - delete these entries:\n  " + [...stale].join("\n  ")
  );
});

test("tracked SVG assets contain a parseable root element", () => {
  const broken = [];

  for (const rel of trackedImages()) {
    if (path.extname(rel).toLowerCase() !== SVG_EXTENSION) {
      continue;
    }
    const absolute = path.join(projectRoot, rel);
    if (!fs.existsSync(absolute)) {
      continue;
    }
    const source = fs.readFileSync(absolute, "utf8");
    if (!/<svg[\s>]/i.test(source)) {
      broken.push(`${rel}: no <svg> root element (first 40 chars: ${JSON.stringify(source.slice(0, 40))})`);
    }
  }

  assert.deepEqual(broken, [], `Corrupt SVG asset(s):\n  ${broken.join("\n  ")}`);
});

test("images referenced by Open Graph metadata exist and are valid", () => {
  // The corrupt file was an og:image. Those are the highest-blast-radius assets:
  // they render in every social share and are read by AI citation surfaces, and
  // nothing else in the repo asserts the referenced file is even present.
  const siteOrigin = "https://seascape-vacations.com";
  const referenced = new Set();

  const sources = execFileSync("git", ["ls-files", "-z", "src"], {
    cwd: projectRoot,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  })
    .split("\0")
    .filter((rel) => /\.(html|njk)$/i.test(rel));

  for (const rel of sources) {
    const source = fs.readFileSync(path.join(projectRoot, rel), "utf8");
    const pattern = /<meta\s+(?:property|name)="(?:og:image|twitter:image)"\s+content="([^"]+)"/gi;
    let match = pattern.exec(source);
    while (match) {
      let value = match[1];
      if (value.startsWith(siteOrigin)) {
        value = value.slice(siteOrigin.length);
      }
      // Skip template expressions; those resolve at build time and are covered by
      // the rendered-output gates.
      if (value.startsWith("/") && !value.includes("{{") && !value.includes("{%")) {
        referenced.add(value.split("?")[0]);
      }
      match = pattern.exec(source);
    }
  }

  const missing = [];
  for (const route of referenced) {
    const absolute = path.join(projectRoot, route.replace(/^\//, ""));
    if (!fs.existsSync(absolute)) {
      missing.push(`${route} (referenced by og:image/twitter:image, not present in the repo)`);
      continue;
    }
    if (fs.statSync(absolute).size < MIN_RASTER_BYTES) {
      missing.push(`${route}: ${fs.statSync(absolute).size} bytes - corrupt or truncated`);
    }
  }

  assert.deepEqual(missing, [], `Broken social image reference(s):\n  ${missing.join("\n  ")}`);
});
