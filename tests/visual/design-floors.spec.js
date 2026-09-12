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
  const root0 = roots[0] || document.body;
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
  // Placeholder text renders from the UA shadow tree, not a DOM text node, so
  // the walker above cannot see it however wide its scope is.
  for (const field of root0.querySelectorAll("input[placeholder], textarea[placeholder]")) {
    if (field.closest("[hidden]")) continue;
    const cs = getComputedStyle(field);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    if (field.getBoundingClientRect().height === 0) continue;
    const size = parseFloat(getComputedStyle(field, "::placeholder").fontSize || cs.fontSize);
    if (size < FLOOR) {
      out.push({ size, text: field.getAttribute("placeholder").slice(0, 40), sel: "placeholder of " + field.tagName.toLowerCase() + (field.id ? "#" + field.id : "") });
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
      // "Flowing text" means real prose around the link, so a bare glyph with a
      // label beside it ("Nav: >") does not buy itself an exemption.
      if (el.tagName === "A" && cs.display === "inline") {
        const ownText = (el.textContent || "").trim();
        const surrounding = ((el.parentElement.textContent || "").trim()).replace(ownText, " ");
        const surroundingWords = surrounding.split(/\s+/).filter((w) => /[A-Za-z0-9]{2,}/.test(w));
        if (surroundingWords.length >= 3 && ownText.length >= 2) return;
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
  // Compare against the layout viewport, not window.innerWidth: under mobile
  // emulation Chromium widens innerWidth to swallow an overflowing document, so
  // scrollWidth <= innerWidth stayed true while the page really did scroll
  // sideways (measured 2026-09-10: a 391px document inside a 360px viewport
  // reported innerWidth 391 and passed).
  return {
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: document.documentElement.clientWidth,
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

async function meanBackground(png, box) {
  const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  const x0 = Math.max(0, Math.floor(box.x));
  const y0 = Math.max(0, Math.floor(box.y));
  const x1 = Math.min(info.width, Math.ceil(box.x + box.width));
  const y1 = Math.min(info.height, Math.ceil(box.y + box.height));
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * info.width + x) * info.channels;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      n++;
    }
  }
  return n ? [r / n, g / n, b / n] : [0, 0, 0];
}

// The text is hidden to photograph its background, so its own colour has to
// come from the computed style and be composited back over that background.
// Assuming pure white made `color: transparent` — an invisible headline —
// measure as a comfortable pass.
function contrastOf(colorString, background) {
  const parts = String(colorString).match(/[\d.]+/g);
  if (!parts) return null;
  const alpha = parts.length > 3 ? parseFloat(parts[3]) : 1;
  const composited = [0, 1, 2].map((i) => alpha * parseFloat(parts[i]) + (1 - alpha) * background[i]);
  const foreground = lum(composited[0], composited[1], composited[2]);
  const behind = lum(background[0], background[1], background[2]);
  const light = Math.max(foreground, behind);
  const dark = Math.min(foreground, behind);
  return (light + 0.05) / (dark + 0.05);
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
    // Wait for the scene's own entrance animations to finish. Without this the
    // caption is photographed at a few percent opacity and every selector
    // inside it measures its background instead of itself.
    await page.waitForFunction(() => {
      const hero = document.querySelector(".g-arrival");
      if (!hero) return true;
      return hero
        .getAnimations({ subtree: true })
        .every((animation) => animation.playState === "finished" || animation.playState === "idle");
    }, null, { timeout: 5000 });
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
              color: getComputedStyle(el).color,
              opacity: getComputedStyle(el).opacity,
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

    assert.ok(
      boxes.length > 0,
      `F4 measured no hero text on home @ ${testInfo.project.name}, scene "${slug}" — the selectors in heroTextSelectors() no longer match anything, so this check was passing vacuously`
    );

    const failures = [];
    for (const item of boxes) {
      const background = await meanBackground(png, item.box);
      const contrast = contrastOf(item.color, background);
      const floor = item.size >= 24 ? 3 : 4.5;
      if (contrast === null || contrast < floor) {
        failures.push(
          `${item.sel} ${item.size.toFixed(1)}px color ${item.color} contrast ${contrast === null ? "unreadable" : contrast.toFixed(2) + ":1"} < ${floor}:1 floor`
        );
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
