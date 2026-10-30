const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const siteRoot = path.resolve(__dirname, "../../_site");
const measurementId = require("../../src/_data/site.json").analytics.ga4MeasurementId;
const disableKey = `ga-disable-${measurementId}`;
const routes = ["index.html", "properties/index.html", "property-management/index.html", "guides/anna-maria-island-beaches/index.html", "guides/rainy-day-activities-bradenton-sarasota/index.html"];
routes.push("guides/anna-maria-island-vs-clearwater-beach/index.html");
routes.push("guides/anna-maria-island-vs-longboat-key/index.html");

// Execute the built inline scripts in document order and observe the public GA4 switch.
function runPage(route, href, { storage = new Map(), webdriver = false, storageBlocked = false } = {}) {
  const html = fs.readFileSync(path.join(siteRoot, route), "utf8");
  const configurations = [];
  const context = {
    URL, URLSearchParams, console, setTimeout() {}, clearTimeout() {},
    location: new URL(href), navigator: { webdriver },
    localStorage: {
      getItem(key) { if (storageBlocked) throw new Error("blocked"); return storage.get(key) || null; },
      setItem(key, value) { if (storageBlocked) throw new Error("blocked"); storage.set(key, value); },
      removeItem(key) { if (storageBlocked) throw new Error("blocked"); storage.delete(key); }
    },
    addEventListener() {},
    document: { addEventListener() {}, createElement: () => ({}), querySelector: () => null, head: { appendChild() {} } }
  };
  context.window = context;
  const commands = [];
  context.dataLayer = { push(command) {
    commands.push(command);
    if (command[0] === "config") configurations.push({ disabled: context[disableKey] === true });
  } };
  vm.createContext(context);
  for (const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=|\btype\s*=\s*["']application\/ld\+json/i.test(script[1])) continue;
    vm.runInContext(script[2], context);
  }
  return { context, configurations, commands };
}

for (const route of routes) {
  test(`${route}: local, preview, and automated browser visits disable GA4 before configuration`, () => {
    for (const href of ["http://localhost:4173/", "http://127.0.0.1:4173/", "https://deploy-preview-1--seascape.netlify.app/"]) {
      const result = runPage(route, href);
      assert.equal(result.context[disableKey], true, href);
      assert.ok(result.configurations.every(config => config.disabled), "GA4 must be disabled before its first config");
    }
    assert.equal(runPage(route, "https://seascape-vacations.com/", { webdriver: true }).context[disableKey], true);
  });
}

test("the explicit agent marker persists across routes and can be removed", () => {
  const storage = new Map();
  assert.equal(runPage(routes[0], "https://seascape-vacations.com/?sv_developer=1", { storage }).context[disableKey], true);
  assert.equal(runPage(routes[3], "https://seascape-vacations.com/guides/anna-maria-island-beaches/", { storage }).context[disableKey], true);
  assert.notEqual(runPage(routes[2], "https://seascape-vacations.com/?sv_developer=0", { storage }).context[disableKey], true);
  assert.notEqual(runPage(routes[1], "https://seascape-vacations.com/properties/", { storage }).context[disableKey], true);
});

test("ordinary production visitors remain tracked, including when browser storage is unavailable", () => {
  for (const route of routes) {
    for (const origin of ["https://seascape-vacations.com", "https://www.seascape-vacations.com"]) {
      const result = runPage(route, `${origin}/`, { storageBlocked: true });
      assert.notEqual(result.context[disableKey], true);
      assert.ok(result.configurations.length > 0, "ordinary visitors retain GA4 configuration");
      assert.ok(result.configurations.every(config => !config.disabled));
    }
  }
  assert.equal(runPage(routes[0], "https://seascape-vacations.com/?sv_developer=1", { storageBlocked: true }).context[disableKey], true);
});


for (const route of ["guides/rainy-day-activities-bradenton-sarasota/index.html", "guides/anna-maria-island-vs-clearwater-beach/index.html", "guides/anna-maria-island-vs-longboat-key/index.html"]) test(`${route} initializes GA4 once for an ordinary production visitor`, () => {
  for (const origin of ["https://seascape-vacations.com", "https://www.seascape-vacations.com"]) {
    for (const storageBlocked of [false, true]) {
      const result = runPage(route, `${origin}/${route.replace(/index.html$/, '')}`, { storageBlocked });
      assert.equal(result.configurations.length, 1, "one initializer must queue one automatic page view");
      assert.equal(result.configurations[0].disabled, false);
    }
  }
});
