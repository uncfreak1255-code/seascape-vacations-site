const assert = require("node:assert/strict");
const sharp = require("sharp");
const { test } = require("@playwright/test");
const { moneyRoutes } = require("./routes");
const { gotoMarketingRoute } = require("./test-helpers");

/*
 * Waterline design floors (see DESIGN.md "Floors"): the visual/axe gates
 * catch pixel regressions and accessibility-tree violations, but neither
 * catches 8px text, a 17px tap target, white text going under 4.5:1 over a
 * bright photo, or a page that silently lost the shared header/footer. This
 * spec proves those floors on every money route.
 *
 * Scope rule (SPEC-common.md): F1 and F2 check the whole page on
 * `body.guest-site` pages (home, catalog, the five property pages) and only
 * the header/mobile-menu/footer subtrees on every other route, whose bodies
 * are not fully restyled in this PR. The scope is read from the live DOM
 * (`document.body.classList.contains('guest-site')`), not hardcoded per
 * route, so it stays correct as routes move between the two states.
 */

const SCENES = ["the-oasis", "dockside-dreams", "sarasota-luxe", "river-house", "bradenton-pool-home"];
const SHELL_ROOT_SELECTOR = ".g-header, .g-mobile-menu, .g-footer";

// -- in-page scan functions (serialized into the browser by page.evaluate) --

function collectSmallText() {
  const FLOOR = 12;
  const isGuestSite = document.body.classList.contains("guest-site");
  const roots = isGuestSite
    ? [document.body]
    : Array.from(document.querySelectorAll(".g-header, .g-mobile-menu, .g-footer"));
  const seen = new Set();
  const out = [];
  for (const root of roots) {
    if (!root) continue;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.nodeValue || !node.nodeValue.trim()) continue;
      const el = node.parentElement;
      if (!el || seen.has(el)) continue;
      seen.add(el);
      if (el.closest('script,style,noscript,template,option,[hidden],.g-sr-only,[aria-hidden="true"]')) continue;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) === 0) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      // Clipped sr-only pattern (1x1 box, clip-path applied): not visible text.
      if (cs.clipPath && cs.clipPath !== "none" && r.width <= 1) continue;
      const size = parseFloat(cs.fontSize);
      if (size < FLOOR) {
        out.push({
          size,
          text: node.nodeValue.trim().slice(0, 40),
          sel:
            el.tagName.toLowerCase() +
            (el.className && typeof el.className === "string"
              ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".")
              : ""),
        });
      }
    }
  }
  return out;
}

function collectSmallTargets() {
  const FLOOR = 44;
  const isGuestSite = document.body.classList.contains("guest-site");
  const roots = isGuestSite
    ? [document.body]
    : Array.from(document.querySelectorAll(".g-header, .g-mobile-menu, .g-footer"));
  const seen = new Set();
  const out = [];
  for (const root of roots) {
    if (!root) continue;
    const els = root.querySelectorAll('a[href], button, input, select, textarea, summary, [role="button"]');
    els.forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      if (el.closest("[hidden], dialog:not([open]), .g-skip")) return;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") return;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      if (r.bottom < 0 || r.top > document.documentElement.scrollHeight) return;
      // Inline link inside flowing text: exempt (WCAG 2.5.8 inline exception).
      if (el.tagName === "A" && cs.display === "inline") {
        const parentText = (el.parentElement.textContent || "").trim();
        const ownText = (el.textContent || "").trim();
        if (parentText.length > ownText.length + 2) return;
      }
      if (r.height < FLOOR || r.width < FLOOR) {
        out.push({
          w: Math.round(r.width),
          h: Math.round(r.height),
          text: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40),
          sel:
            el.tagName.toLowerCase() +
            (el.className && typeof el.className === "string"
              ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".")
              : ""),
        });
      }
    });
  }
  return out;
}

function measureOverflow() {
  return {
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  };
}

// -- Node-side helpers --

function dedupeTargets(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.sel}|${item.w}x${item.h}|${item.text}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function lum(r, g, b) {
  const f = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

async function meanLuminance(png, box) {
  const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  const x0 = Math.max(0, Math.floor(box.x));
  const y0 = Math.max(0, Math.floor(box.y));
  const x1 = Math.min(info.width, Math.ceil(box.x + box.width));
  const y1 = Math.min(info.height, Math.ceil(box.y + box.height));
  let total = 0;
  let n = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * info.width + x) * info.channels;
      total += lum(data[i], data[i + 1], data[i + 2]);
      n++;
    }
  }
  return n ? total / n : 0;
}

function heroTextSelectors(isMobileProject) {
  const shared = [
    // The homepage header sits over the photo (transparent, white text), so
    // the wordmark and the mobile menu button are hero text too — they were
    // not checked until 2026-09-10 and nothing else measures them.
    ".g-wordmark",
    ".g-wordmark span",
    ".g-arrival-copy .g-label",
    ".g-arrival-copy h1",
    ".g-arrival-copy > p:last-child",
    ".g-scene:not([hidden]) .g-scene-caption .g-label",
    ".g-scene:not([hidden]) .g-scene-caption h2",
    ".g-scene:not([hidden]) .g-scene-caption p:last-child",
    ".g-scene:not([hidden]) .g-scene-explore",
  ];
  // Nav, header phone badge and the arrival seal are desktop-only chrome;
  // selectors that render nothing on a project are simply skipped below
  // (querySelectorAll returns no elements, so there is nothing to check).
  return isMobileProject
    ? [".g-menu-button", ...shared]
    : [".g-nav a", ".g-header-phone", ".g-arrival-seal", ...shared];
}

// -- F1: no visible text below the 12px floor --

for (const routeConfig of moneyRoutes) {
  test(`${routeConfig.slug} — F1 no text below 12px`, async ({ page }, testInfo) => {
    await gotoMarketingRoute(page, routeConfig);
    const offenders = await page.evaluate(collectSmallText);
    assert.equal(
      offenders.length,
      0,
      `F1 min font size violations on ${routeConfig.slug} @ ${testInfo.project.name} (floor 12px, ${offenders.length} found):\n` +
        offenders.map((o) => `  ${o.sel} ${o.size}px "${o.text}"`).join("\n")
    );
  });
}

// -- F2: mobile tap targets reach 44x44 --

for (const routeConfig of moneyRoutes) {
  test(`${routeConfig.slug} — F2 tap targets reach 44x44 on mobile`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chromium", "F2 tap targets is a mobile-only floor");

    await gotoMarketingRoute(page, routeConfig);
    const before = await page.evaluate(collectSmallTargets);

    // The mobile nav lives behind .g-menu-button; its links are [hidden]
    // (and therefore skipped above) until opened, so check it explicitly.
    const menuButtonCount = await page.locator(".g-menu-button").count();
    let afterMenuOpen = [];
    if (menuButtonCount > 0) {
      await page.locator(".g-menu-button").first().click();
      await page.waitForFunction(() => {
        const menu = document.getElementById("guest-menu");
        return Boolean(menu) && !menu.hidden;
      });
      afterMenuOpen = await page.evaluate(collectSmallTargets);
    }

    const offenders = dedupeTargets([...before, ...afterMenuOpen]);
    assert.equal(
      offenders.length,
      0,
      `F2 tap target violations on ${routeConfig.slug} @393 (floor 44x44, ${offenders.length} found):\n` +
        offenders.map((o) => `  ${o.sel} ${o.w}x${o.h} "${o.text}"`).join("\n")
    );
  });
}

// -- F3: no horizontal overflow at 360, 375, 393 (mobile) or the desktop viewport --

for (const routeConfig of moneyRoutes) {
  test(`${routeConfig.slug} — F3 no horizontal overflow`, async ({ page }, testInfo) => {
    await gotoMarketingRoute(page, routeConfig);

    const base = await page.evaluate(measureOverflow);
    assert.ok(
      base.scrollWidth <= base.innerWidth,
      `F3 overflow on ${routeConfig.slug} @ ${testInfo.project.name} (${base.innerWidth}px): scrollWidth ${base.scrollWidth} > innerWidth ${base.innerWidth}`
    );

    if (testInfo.project.name === "mobile-chromium") {
      const original = page.viewportSize();
      for (const width of [360, 375]) {
        await page.setViewportSize({ width, height: original.height });
        const measurement = await page.evaluate(measureOverflow);
        assert.ok(
          measurement.scrollWidth <= measurement.innerWidth,
          `F3 overflow on ${routeConfig.slug} @${width}: scrollWidth ${measurement.scrollWidth} > innerWidth ${measurement.innerWidth}`
        );
      }
      await page.setViewportSize(original);
    }
  });
}

// -- F4: homepage hero contrast for all five scenes --

const homeRoute = moneyRoutes.find((route) => route.slug === "home");
if (!homeRoute) {
  throw new Error('[design-floors] tests/visual/routes.js no longer has a "home" entry in moneyRoutes');
}

for (const slug of SCENES) {
  test(`home — F4 hero contrast holds for the ${slug} scene`, async ({ page }, testInfo) => {
    await gotoMarketingRoute(page, homeRoute);
    const isMobileProject = testInfo.project.name === "mobile-chromium";
    const selectors = heroTextSelectors(isMobileProject);

    await page.click(`[data-scene-choice="${slug}"]`);
    await page.waitForFunction(() => {
      const sceneRoot = document.querySelector("[data-home-scenes]");
      return Boolean(sceneRoot) && sceneRoot.getAttribute("aria-busy") !== "true";
    });
    await page.waitForFunction((activeSlug) => {
      const img = document.querySelector(`#scene-${activeSlug} .g-scene-photo`);
      return Boolean(img) && img.complete && img.naturalWidth > 0;
    }, slug);
    // img.complete/aria-busy confirm the new photo is decoded and the DOM is
    // updated, but not that the browser has painted that state yet. Without
    // this, box measurement and the screenshot can straddle the repaint —
    // observed directly as a flaky pass/fail flip on a borderline contrast
    // value (.g-arrival-seal on sarasota-luxe, 4.40:1 vs the 4.5:1 floor)
    // between two otherwise-identical runs. Two rAFs guarantee a full paint.
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    );

    const boxes = await page.evaluate(
      (sels) =>
        sels.flatMap((sel) =>
          Array.from(document.querySelectorAll(sel))
            .filter((el) => el.getBoundingClientRect().height > 0)
            .map((el) => ({
              sel,
              size: parseFloat(getComputedStyle(el).fontSize),
              box: el.getBoundingClientRect().toJSON(),
            }))
        ),
      selectors
    );

    const styleHandle = await page.addStyleTag({
      content: `${selectors.join(",")}{visibility:hidden !important}`,
    });
    const hero = await page.locator(".g-arrival").boundingBox();
    const viewport = page.viewportSize();
    // scale:"css" keeps the PNG's pixel grid 1:1 with getBoundingClientRect(),
    // which matters on the mobile project where deviceScaleFactor > 1 would
    // otherwise put box coordinates and screenshot pixels out of alignment.
    const png = await page.screenshot({
      clip: { x: 0, y: 0, width: viewport.width, height: Math.ceil(hero.y + hero.height) },
      scale: "css",
    });
    await styleHandle.evaluate((node) => node.remove());

    const failures = [];
    for (const item of boxes) {
      const L = await meanLuminance(png, item.box);
      const contrast = (1.0 + 0.05) / (L + 0.05);
      const floor = item.size >= 24 ? 3 : 4.5;
      if (contrast < floor) {
        failures.push(`${item.sel} ${item.size.toFixed(1)}px contrast ${contrast.toFixed(2)}:1 < ${floor}:1 floor`);
      }
    }

    assert.equal(
      failures.length,
      0,
      `F4 hero contrast violations on home @ ${testInfo.project.name}, scene "${slug}" (${failures.length} found):\n` +
        failures.map((line) => `  ${line}`).join("\n")
    );
  });
}
