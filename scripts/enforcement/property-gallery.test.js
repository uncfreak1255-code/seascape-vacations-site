"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const vm = require("vm");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const guestCssPath = "src/css/guest.css";
const galleryCssPath = "src/css/property-gallery.css";
const galleryJsPath = "src/assets/js/property-gallery.js";
const propertyLayoutPath = "src/_includes/layouts/property.njk";

function read(rel) {
  return fs.readFileSync(path.join(projectRoot, rel), "utf8");
}

function headBytes(rel) {
  return execFileSync("git", ["cat-file", "-s", `HEAD:${rel}`], {
    cwd: projectRoot,
    encoding: "utf8"
  }).trim();
}

function readBuilt(routeFile) {
  const builtPath = path.join(projectRoot, "_site", routeFile);
  assert.equal(fs.existsSync(builtPath), true, `missing built route ${routeFile}; run npm run build first`);
  return fs.readFileSync(builtPath, "utf8");
}

function hoverRuleIsGated(css) {
  if (!css || typeof css !== "string") return false;
  const hoverIndex = css.search(/\.g-button:hover,\s*\.guest-site \.btn:hover/);
  if (hoverIndex < 0) return false;
  const before = css.slice(0, hoverIndex);
  const mediaIndex = before.lastIndexOf("@media(hover:hover) and (pointer:fine)");
  if (mediaIndex < 0) return false;
  const between = before.slice(mediaIndex);
  return !between.includes("}");
}

test("guest.css cannot grow and the tap-hover rule is gated", () => {
  const now = fs.statSync(path.join(projectRoot, guestCssPath)).size;
  const before = Number(headBytes(guestCssPath));
  assert.ok(now <= before, `guest.css grew from ${before} to ${now}; oversized files may not grow`);
  const css = read(guestCssPath);
  assert.match(css, /touch-action:manipulation/);
  assert.equal(hoverRuleIsGated(css), true, "button hover must sit inside (hover:hover) and (pointer:fine)");
  assert.equal(hoverRuleIsGated(""), false, "empty CSS must fail the hover gate");
  assert.equal(
    hoverRuleIsGated(".g-button:hover,.guest-site .btn:hover{background:red}"),
    false,
    "ungated hover must fail the hover gate"
  );
  assert.match(css, /\.g-gallery\{display:grid;grid-template-columns:1\.6fr 1fr/);
  assert.doesNotMatch(css, /grid-template-rows:260px 105px/);
  assert.doesNotMatch(css, /grid-template-rows:300px 125px/);
});

test("visual proof skips unhydrated swipe slides instead of treating them as missing photos", () => {
  const helper = read("tests/visual/test-helpers.js");
  assert.match(helper, /closest\("\.g-gallery"\) && image\.dataset\.src && !image\.getAttribute\("src"\)/);
  assert.match(helper, /closest\("\.g-gallery"\) && node\.dataset\.src && !node\.getAttribute\("src"\)/);
  assert.match(helper, /dataset\.src, location\.href\)\.pathname\.startsWith\(homePath\)/);
});

test("property-gallery CSS and JS stay inside the motion budget", () => {
  const cssBytes = fs.statSync(path.join(projectRoot, galleryCssPath)).size;
  const jsBytes = fs.statSync(path.join(projectRoot, galleryJsPath)).size;
  assert.ok(cssBytes <= 3072, `property-gallery.css is ${cssBytes} bytes; budget is 3072`);
  assert.ok(jsBytes <= 2048, `property-gallery.js is ${jsBytes} bytes; budget is 2048`);
  const css = read(galleryCssPath);
  assert.match(css, /scroll-snap-type:\s*x mandatory/);
  assert.match(css, /overscroll-behavior-x:\s*contain/);
  assert.match(css, /touch-action:\s*pan-x pan-y pinch-zoom/);
  assert.match(css, /flex:\s*0 0 100%/);
  assert.match(css, /aspect-ratio:\s*4\/3/);
  assert.match(css, /background:\s*var\(--g-soft\)/);
  assert.match(css, /@media\(max-width:700px\) and \(prefers-reduced-motion:no-preference\)/);
  assert.match(css, /transition:opacity 200ms cubic-bezier\(\.23,1,\.32,1\)/);
  assert.match(css, /\.g-gallery-frame\{position:relative;min-width:0;max-width:100%\}/);
  assert.match(css, /width:100%;min-width:0;scroll-snap-type:x mandatory/);
  assert.match(css, /@media\(min-width:701px\)\{\.g-gallery-photo:nth-child\(n\+4\)\{display:none\}\}/);
  assert.doesNotMatch(css, /gsap|swiper|splide|tiny-slider|flickity/i);
  const js = read(galleryJsPath);
  assert.match(js, /IntersectionObserver/);
  assert.match(js, /g-gallery-fade/);
  assert.match(js, /ArrowRight/);
  assert.doesNotMatch(js, /gsap|swiper|splide|request\(|fetch\(/);
});

test("property layout keeps photo 1 as LCP and adds the counter only", () => {
  const layout = read(propertyLayoutPath);
  assert.match(layout, /property\.photography\.photos %}/);
  assert.doesNotMatch(layout, /photos\.slice\(0,3\)/);
  assert.match(layout, /data-transition-home="\{\{ property\.slug \}\}"/);
  assert.match(layout, /fetchpriority="high"/);
  assert.match(layout, /aria-label="Photo \{\{ loop\.index \}\} of \{\{ property\.photography\.photos \| length \}\}"/);
  assert.match(layout, /data-gallery-count aria-live="polite">1 \/ \{\{ property\.photography\.photos \| length \}\}/);
  assert.match(layout, />View all \{\{ property\.photography\.photos \| length \}\} photos</);
  assert.match(layout, /<\/section><span class="g-gallery-count"/);
  assert.doesNotMatch(layout, /See all \{\{ property\.name \}\} photos/);
});

test("built property pages ship every photo on mobile and keep View all copy", () => {
  const river = readBuilt("properties/river-house/index.html");
  const blue = readBuilt("properties/blue-house/index.html");
  const riverPhotos = (river.match(/class="g-gallery-photo"/g) || []).length;
  const bluePhotos = (blue.match(/class="g-gallery-photo"/g) || []).length;
  assert.equal(riverPhotos, 12);
  assert.equal(bluePhotos, 13);
  assert.match(river, /<link rel="stylesheet" href="\/css\/property-gallery\.css">/);
  assert.match(river, /<script defer src="\/assets\/js\/property-gallery\.js">/);
  assert.match(river, />View all 12 photos</);
  assert.match(blue, />View all 13 photos</);
  assert.match(river, /<\/section><span class="g-gallery-count"[^>]*>1 \/ 12</);
  assert.match(river, /aria-live="polite">1 \/ 12</);
  assert.match(river, /fetchpriority="high"/);
  assert.match(river, /data-transition-home="river-house"/);
  const deferred = [...river.matchAll(/<img[^>]+data-src="[^"]+"[^>]*>/g)];
  assert.ok(deferred.length >= 8, "photos 4+ must defer src until swipe");
  deferred.forEach(([tag]) => assert.doesNotMatch(tag, /\ssrc="/));
  const firstImg = river.match(/<section class="g-gallery"[\s\S]*?<img([^>]+)>/);
  assert.ok(firstImg, "river-house gallery must render an LCP image");
  assert.match(firstImg[1], /fetchpriority="high"/);
  assert.doesNotMatch(firstImg[1], /loading="lazy"/);
  assert.match(river, /id="booking"/);
  assert.match(river, /data-property-checkout/);
  assert.doesNotMatch(river, /swiper|splide|flickity/i);
});

function installGallery({ reducedMotion = false, complete = [true, false], mobile = true, observer = true, deferred = [], observe } = {}) {
  const observed = [];
  const images = complete.map((isComplete, index) => {
    const deferredSrc = deferred[index];
    const image = {
      complete: isComplete,
      dataset: deferredSrc ? { src: deferredSrc } : {},
      getAttribute(name) { return name === "src" && isComplete && !deferredSrc ? "/photo.webp" : ""; },
      classList: {
        items: new Set(),
        add(name) { this.items.add(name); }
      },
      addEventListener(type, handler) {
        image.listeners = image.listeners || {};
        image.listeners[type] = handler;
      }
    };
    image.alt = "photo " + (index + 1);
    return image;
  });
  const slides = images.map((image) => ({ image, querySelector() { return image; } }));
  const count = { textContent: "" };
  const root = {
    clientWidth: 390,
    scrolled: 0,
    querySelector(sel) {
      if (sel === "[data-gallery-count]") return count;
      return null;
    },
    querySelectorAll(sel) {
      if (sel === ".g-gallery-photo") return slides;
      if (sel === ".g-gallery-photo img") return images;
      return [];
    },
    addEventListener(type, handler) {
      root.listeners = root.listeners || {};
      root.listeners[type] = handler;
    },
    scrollBy(opts) { root.scrolled += opts.left; }
  };
  function Observer(callback, options) {
    sandbox.observer = { callback, options, observed };
    this.observe = function (node) { observed.push(node); };
  }
  const sandbox = {
    document: {
      querySelector(sel) {
        if (sel === ".g-gallery") return root;
        if (sel === "[data-gallery-count]") return count;
        return null;
      }
    },
    window: {
      matchMedia(query) {
        if (query.includes("reduce")) return { matches: reducedMotion };
        if (query.includes("max-width:700px")) return { matches: mobile };
        return { matches: false };
      }
    },
    Array
  };
  if (observer) {
    sandbox.window.IntersectionObserver = Observer;
    sandbox.IntersectionObserver = Observer;
  }
  vm.runInNewContext(read(galleryJsPath), sandbox);
  if (typeof observe === "function") observe({ root, count, images, slides, sandbox });
  return { root, count, images, slides, sandbox };
}

test("gallery script is a no-op without a gallery and updates the counter", () => {
  const empty = { document: { querySelector() { return null; } } };
  assert.doesNotThrow(() => vm.runInNewContext(read(galleryJsPath), empty));
  const { root, count, images, slides, sandbox } = installGallery();
  assert.equal(count.textContent, "1 / 2");
  assert.equal(sandbox.observer.observed.length, 2);
  sandbox.observer.callback([{ isIntersecting: true, target: slides[1] }]);
  assert.equal(count.textContent, "2 / 2");
  assert.ok(!images[0].classList.items.has("g-gallery-fade"));
  assert.ok(images[1].classList.items.has("g-gallery-fade"));
  images[1].listeners.load();
  assert.ok(images[1].classList.items.has("is-loaded"));
  root.listeners.keydown({ key: "ArrowRight", preventDefault() { root.prevented = true; } });
  assert.equal(root.scrolled, 390);
  assert.equal(root.prevented, true);
  const reduced = installGallery({ reducedMotion: true, complete: [false] });
  assert.ok(!reduced.images[0].classList.items.has("g-gallery-fade"));
  const noObserver = installGallery({
    observer: false,
    complete: [true, false, false],
    deferred: ["", "/images/homes/river-house/2.webp", "/images/homes/river-house/3.webp"]
  });
  assert.equal(noObserver.images[1].src, "/images/homes/river-house/2.webp");
  assert.equal(noObserver.images[2].src, "/images/homes/river-house/3.webp");
  assert.equal(noObserver.sandbox.observer, undefined);
});
