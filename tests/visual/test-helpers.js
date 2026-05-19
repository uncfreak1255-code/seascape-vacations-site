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

async function gotoMarketingRoute(page, routeConfig) {
  await registerStableNetwork(page);
  const separator = routeConfig.path.includes("?") ? "&" : "?";
  await page.goto(`${routeConfig.path}${separator}visual-test=1`, { waitUntil: "networkidle" });
  await page.evaluate((slug) => {
    document.documentElement.dataset.visualRoute = slug;
  }, routeConfig.slug);

  const readySelector = routeConfig.readySelector || "main h1";
  await page.locator(readySelector).first().waitFor({ state: "visible" });
  await waitForFonts(page);
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
    Array.from(document.images).every((image) => image.complete && (!image.currentSrc || image.naturalWidth > 0))
  );
  await waitForFonts(page);
}

module.exports = {
  gotoMarketingRoute,
  prepareFullPageScreenshot,
};
