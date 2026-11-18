"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const tripSheetJs = fs.readFileSync(path.join(projectRoot, "src/assets/js/trip-sheet.js"), "utf8");

function extraImage({ dataSrc, dataSrcset, src } = {}) {
  const attrs = {};
  if (src) attrs.src = src;
  const image = {
    dataset: {},
    getAttribute(name) {
      return Object.prototype.hasOwnProperty.call(attrs, name) ? attrs[name] : null;
    },
    set src(value) {
      attrs.src = value;
    },
    get src() {
      return attrs.src || "";
    },
    set srcset(value) {
      attrs.srcset = value;
    },
    get srcset() {
      return attrs.srcset || "";
    }
  };
  if (dataSrc !== undefined) image.dataset.src = dataSrc;
  if (dataSrcset !== undefined) image.dataset.srcset = dataSrcset;
  return image;
}

function makeStrip(images) {
  const countAttrs = { "data-n": "1" };
  const dots = images.map((_, index) => ({ className: index === 0 ? "on" : "" }));
  const listeners = {};
  const classList = {
    items: new Set(),
    add(name) {
      this.items.add(name);
    }
  };
  return {
    parentNode: {
      querySelector(sel) {
        if (sel === "[data-ts-count]") {
          return {
            setAttribute(name, value) {
              countAttrs[name] = String(value);
            },
            getAttribute(name) {
              return countAttrs[name] || null;
            }
          };
        }
        return null;
      },
      querySelectorAll(sel) {
        if (sel === ".ts-dots i") return dots;
        return [];
      }
    },
    classList,
    querySelectorAll(sel) {
      if (sel === "img.ts-extra") return images;
      return [];
    },
    addEventListener(type, handler) {
      listeners[type] = handler;
    },
    listeners,
    dots,
    countAttrs,
    clientWidth: 390,
    scrollLeft: 0
  };
}

function install({ strips = [] } = {}) {
  function requestAnimationFrame(cb) {
    cb();
  }
  const sandbox = {
    requestAnimationFrame,
    window: {
      matchMedia() {
        return { matches: true, addEventListener() {}, addListener() {} };
      },
      addEventListener() {},
      requestAnimationFrame
    },
    document: {
      documentElement: { classList: { toggle() {}, add() {} } },
      querySelector() {
        return null;
      },
      querySelectorAll(sel) {
        if (sel === "[data-ts-strip]") return strips;
        return [];
      },
      addEventListener() {}
    },
    Array
  };
  vm.runInNewContext(tripSheetJs, sandbox);
  return sandbox;
}

test("trip-sheet extras stay deferred until the strip is touched or scrolled", () => {
  const ready = extraImage({ dataSrc: "/images/homes/dockside-dreams/18-800.webp" });
  const withSrcset = extraImage({
    dataSrc: "/images/homes/the-oasis/09-800.webp",
    dataSrcset: "/images/homes/the-oasis/09-800.webp 800w"
  });
  const empty = extraImage({ dataSrc: "" });
  const already = extraImage({ src: "/already.webp", dataSrc: "/other.webp" });
  const strip = makeStrip([ready, withSrcset, empty, already]);
  const other = extraImage({ dataSrc: "/images/homes/river-house/36-800.webp" });
  const otherStrip = makeStrip([other]);

  install({ strips: [strip, otherStrip] });

  assert.equal(ready.src, "");
  assert.equal(withSrcset.src, "");
  assert.equal(other.src, "");
  assert.ok(strip.classList.items.has("ts-strip-live"));
  assert.equal(typeof strip.listeners.pointerdown, "function");
  assert.equal(typeof strip.listeners.scroll, "function");

  strip.listeners.pointerdown();
  assert.equal(ready.src, "/images/homes/dockside-dreams/18-800.webp");
  assert.equal(withSrcset.src, "/images/homes/the-oasis/09-800.webp");
  assert.equal(withSrcset.srcset, "/images/homes/the-oasis/09-800.webp 800w");
  assert.equal(empty.src, "");
  assert.equal(already.src, "/already.webp");
  assert.equal(other.src, "");

  otherStrip.listeners.scroll();
  assert.equal(other.src, "/images/homes/river-house/36-800.webp");
});

test("trip-sheet strip scroll still updates the photo count after extras hydrate", () => {
  const extra = extraImage({ dataSrc: "/images/homes/dockside-dreams/18-800.webp" });
  const strip = makeStrip([extra, extraImage({ dataSrc: "/images/homes/dockside-dreams/03-800.webp" })]);
  install({ strips: [strip] });
  strip.scrollLeft = 390;
  strip.listeners.scroll();
  assert.equal(extra.src, "/images/homes/dockside-dreams/18-800.webp");
  assert.equal(strip.countAttrs["data-n"], "2");
  assert.equal(strip.dots[1].className, "on");
});

test("trip-sheet script is a no-op without photo strips", () => {
  assert.doesNotThrow(() => install({ strips: [] }));
});
