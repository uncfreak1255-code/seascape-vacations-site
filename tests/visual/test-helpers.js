const path = require("node:path");
const STABLE_VISUAL_DATE = "2026-06-01";
const STABLE_VISUAL_DATE_LABEL = "June 1, 2026";
const STABLE_PROPERTY_AVAILABILITY_NOW = new Date("2026-05-17T16:00:00.000Z");

const HERO_WEATHER_RESPONSE = {
  current: {
    temperature_2m: 78.2,
    weather_code: 1,
  },
};

const HERO_SUNSET_RESPONSE = {
  daily: {
    sunset: ["2026-05-16T19:58"],
  },
};

async function registerStableNetwork(page) {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());

    if (url.hostname === "api.open-meteo.com") {
      const isWeatherRequest = url.searchParams.has("current");
      const body = isWeatherRequest ? HERO_WEATHER_RESPONSE : HERO_SUNSET_RESPONSE;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(body),
      });
      return;
    }

    if (url.protocol === "data:" || url.protocol === "blob:") {
      await route.continue();
      return;
    }

    if ((url.hostname === "127.0.0.1" || url.hostname === "localhost") && url.pathname === "/.netlify/images") {
      const sourcePath = url.searchParams.get("url");
      if (sourcePath && sourcePath.startsWith("/images/")) {
        await route.fulfill({
          status: 200,
          contentType: "image/jpeg",
          path: path.join(process.cwd(), sourcePath.slice(1)),
        });
        return;
      }
    }

    if (url.hostname === "127.0.0.1" || url.hostname === "localhost") {
      await route.continue();
      return;
    }

    await route.abort();
  });
}

async function waitForFonts(page) {
  await page.evaluate(async () => {
    if (!document.fonts || document.fonts.status === "loaded") {
      return;
    }

    await document.fonts.ready;
  });
}

async function waitForStableLayout(page) {
  await page.waitForFunction(async () => {
    const readHeight = () => Math.max(
      document.documentElement.scrollHeight,
      document.body ? document.body.scrollHeight : 0
    );
    let previousHeight = readHeight();
    let stableFrames = 0;

    while (stableFrames < 6) {
      await new Promise((resolve) => window.requestAnimationFrame(resolve));
      const nextHeight = readHeight();
      if (nextHeight === previousHeight) {
        stableFrames += 1;
      } else {
        stableFrames = 0;
        previousHeight = nextHeight;
      }
    }

    return true;
  });
}

async function stabilizeVisualFreshnessCopy(page) {
  await page.evaluate(({ stableDate, stableLabel }) => {
    for (const timeNode of document.querySelectorAll("time")) {
      const text = (timeNode.textContent || "").trim();
      if (!text.startsWith("Last Updated:")) {
        continue;
      }

      // Freeze mutable freshness copy so visual baselines track layout, not git timestamps.
      timeNode.setAttribute("datetime", stableDate);
      timeNode.textContent = `Last Updated: ${stableLabel}`;
    }
  }, {
    stableDate: STABLE_VISUAL_DATE,
    stableLabel: STABLE_VISUAL_DATE_LABEL,
  });
}

async function stabilizePropertyManagementVisualState(page, routeConfig) {
  if (routeConfig.slug !== "property-management") {
    return;
  }

  await page.evaluate(() => {
    const phraseRoot = document.querySelector("[data-owner-phrases]");
    if (phraseRoot) {
      const phrases = Array.from(phraseRoot.querySelectorAll(".sv-pm-h1-phrase-item"));
      const activeIndex = Math.min(1, Math.max(phrases.length - 1, 0));
      phrases.forEach((phrase, index) => {
        phrase.classList.toggle("is-active", index === activeIndex);
      });
      if (phrases[activeIndex]) {
        phraseRoot.setAttribute("aria-label", phrases[activeIndex].textContent || "");
      }
    }

    const ticker = document.querySelector("[data-owner-ticker]");
    if (ticker) {
      const tickerItems = Array.from(ticker.querySelectorAll(".sv-pm-ticker-fact"));
      const tickerDots = Array.from(ticker.querySelectorAll("[data-ticker-dot]"));
      const activeIndex = Math.min(1, Math.max(tickerItems.length - 1, 0));
      tickerItems.forEach((item, index) => {
        item.classList.toggle("is-active", index === activeIndex);
      });
      tickerDots.forEach((dot, index) => {
        dot.classList.toggle("is-active", index === activeIndex);
      });
    }
  });
}

async function gotoMarketingRoute(page, routeConfig) {
  await registerStableNetwork(page);
  if (routeConfig.slug === "properties-catalog") {
    await page.clock.setFixedTime(STABLE_PROPERTY_AVAILABILITY_NOW);
  }
  if (routeConfig.slug === "property-management") {
    await page.emulateMedia({ reducedMotion: "reduce" });
  }
  const separator = routeConfig.path.includes("?") ? "&" : "?";
  const response = await page.goto(`${routeConfig.path}${separator}visual-test=1`, { waitUntil: "networkidle" });
  // The static server serves the branded /404.html (with its own main h1) for
  // missing paths, so a vanished route would otherwise produce green proof
  // against the 404 page. Fail loudly on any non-200 instead.
  if (!response || response.status() !== 200) {
    throw new Error(
      `[visual] route ${routeConfig.path} returned HTTP ${response ? response.status() : "no response"} — refusing to capture proof against a non-200 page`
    );
  }
  await page.evaluate((slug) => {
    document.documentElement.dataset.visualRoute = slug;
  }, routeConfig.slug);

  const readySelector = routeConfig.readySelector || "main h1";
  await page.locator(readySelector).first().waitFor({ state: "visible" });
  await waitForFonts(page);
  await stabilizeVisualFreshnessCopy(page);
  await stabilizePropertyManagementVisualState(page, routeConfig);
}

async function prepareFullPageScreenshot(page) {
  await page.evaluate(async () => {
    for (const image of document.images) {
      if (image.loading === "lazy") {
        image.loading = "eager";
      }
    }

    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
    const step = Math.max(Math.floor(window.innerHeight * 0.75), 480);

    for (let top = 0; top <= maxScroll; top += step) {
      window.scrollTo(0, top);
      await new Promise((resolve) => window.requestAnimationFrame(() => resolve()));
    }

    window.scrollTo(0, 0);
  });

  await page.waitForFunction(() =>
    Array.from(document.images).every((image) => {
      const isRendered = image.getClientRects().length > 0;
      if (!isRendered && !image.currentSrc) {
        return true;
      }

      return image.complete && (!image.currentSrc || image.naturalWidth > 0);
    })
  );
  const badPhotos = await page.locator("[data-property-photo]").evaluateAll(nodes => nodes
    .filter(node => node.getClientRects().length && (node.tagName !== "IMG" || !node.naturalWidth || node.dataset.photoFailed || !new URL(node.currentSrc, location.href).pathname.startsWith("/images/homes/" + node.dataset.propertyPhoto + "/")))
    .map(node => ({property: node.dataset.propertyPhoto, src: node.currentSrc || "unavailable"})));
  if (badPhotos.length) throw new Error("Refusing visual proof: property photos missing or mismatched " + JSON.stringify(badPhotos));
  await waitForFonts(page);
  await waitForStableLayout(page);

  // The first full-page capture causes a browser reflow. Warm it up before the baseline assertion.
  await page.screenshot({ fullPage: true });
  await waitForStableLayout(page);
}

module.exports = {
  gotoMarketingRoute,
  prepareFullPageScreenshot,
  registerStableNetwork,
};
