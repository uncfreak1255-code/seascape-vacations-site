const fs = require("fs");
const path = require("path");
const vm = require("vm");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const save50PartialPath = path.join(projectRoot, "src", "_includes", "partials", "save50-offer.njk");
const propertiesCatalogPath = path.join(projectRoot, "src", "properties", "index.njk");
const propertyPages = [
  "dockside-dreams",
  "the-oasis",
  "sarasota-luxe",
  "river-house",
  "bradenton-pool-home"
];
const allowedSave50IncludePaths = new Set([
  path.join("src", "properties", "index.njk"),
  ...propertyPages.map((slug) => path.join("src", "properties", slug, "index.njk"))
]);

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function walkFiles(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractOfferScript() {
  const partial = read(save50PartialPath);
  const match = partial.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(match, "SAVE50 partial should include its campaign activation script");
  return match[1];
}

function runOfferScript(url) {
  const offerNode = { hidden: true };
  const links = [
    {
      href: "/properties/the-oasis/",
      getAttribute(attribute) {
        return attribute === "href" ? this.href : null;
      },
      setAttribute(attribute, value) {
        if (attribute === "href") this.href = value;
      }
    },
    {
      href: "https://book.seascape-vacations.com/listings/189511",
      getAttribute(attribute) {
        return attribute === "href" ? this.href : null;
      },
      setAttribute(attribute, value) {
        if (attribute === "href") this.href = value;
      }
    },
    {
      href: "https://example.com/outside",
      getAttribute(attribute) {
        return attribute === "href" ? this.href : null;
      },
      setAttribute(attribute, value) {
        if (attribute === "href") this.href = value;
      }
    }
  ];
  const document = {
    readyState: "complete",
    querySelectorAll(selector) {
      if (selector === "[data-save50-offer]") return [offerNode];
      if (selector === "a[href]") return links;
      return [];
    },
    addEventListener() {}
  };
  const location = new URL(url);
  const context = {
    URL,
    URLSearchParams,
    window: {
      location: {
        href: location.href,
        origin: location.origin,
        search: location.search
      }
    },
    document
  };

  vm.runInNewContext(extractOfferScript(), context);

  return { offerNode, links };
}

test("SAVE50 offer copy matches the welcome email without overstating the booking rule", () => {
  const partial = read(save50PartialPath);

  for (const marker of [
    "SAVE50 welcome credit",
    "$50 off your first direct booking",
    "3 nights or more",
    "data-save50-offer"
  ]) {
    assert.equal(partial.includes(marker), true, `SAVE50 partial missing ${marker}`);
  }
  assert.match(partial, /enter\s+SAVE50\s+on the secure booking page/i);

  assert.equal(partial.includes("free stay"), false);
  assert.equal(partial.includes("no minimum"), false);
});

test("SAVE50 offer only opens from the email campaign query and preserves campaign parameters", () => {
  const partial = read(save50PartialPath);

  assert.match(partial, /campaign\s*===\s*SAVE50_CAMPAIGN/);
  assert.match(partial, /promo\s*===\s*"save50"/);
  assert.equal(partial.includes("PRESERVED_PARAM_KEYS"), true);
  assert.equal(partial.includes('"utm_campaign"'), true);
  assert.equal(partial.includes('"utm_source"'), true);
  assert.equal(partial.includes('"utm_medium"'), true);
  assert.equal(partial.includes("decorateCampaignLinks"), true);
  assert.equal(partial.includes("DOMContentLoaded"), true);
});

test("SAVE50 campaign visitors see the reminder and keep campaign attribution through handoffs", () => {
  const { offerNode, links } = runOfferScript(
    "https://seascape-vacations.com/properties/?utm_source=mailchimp&utm_medium=email&utm_campaign=save50_welcome&utm_content=hero"
  );

  assert.equal(offerNode.hidden, false, "campaign visitor should see the SAVE50 reminder");
  assert.equal(
    links[0].href,
    "/properties/the-oasis/?utm_source=mailchimp&utm_medium=email&utm_campaign=save50_welcome&utm_content=hero",
    "same-site property link should preserve SAVE50 campaign parameters"
  );
  assert.equal(
    links[1].href,
    "https://book.seascape-vacations.com/listings/189511?utm_source=mailchimp&utm_medium=email&utm_campaign=save50_welcome&utm_content=hero",
    "booking-page handoff should preserve SAVE50 campaign parameters"
  );
  assert.equal(links[2].href, "https://example.com/outside", "external non-booking links should not be decorated");
});

test("SAVE50 reminder stays hidden for normal property visitors", () => {
  const { offerNode, links } = runOfferScript("https://seascape-vacations.com/properties/");

  assert.equal(offerNode.hidden, true);
  assert.equal(links[0].href, "/properties/the-oasis/");
  assert.equal(links[1].href, "https://book.seascape-vacations.com/listings/189511");
});

test("promo fallback still records the canonical SAVE50 campaign", () => {
  const { offerNode, links } = runOfferScript("https://seascape-vacations.com/properties/the-oasis/?promo=save50");

  assert.equal(offerNode.hidden, false);
  assert.equal(links[0].href, "/properties/the-oasis/?utm_campaign=save50_welcome&promo=save50");
  assert.equal(
    links[1].href,
    "https://book.seascape-vacations.com/listings/189511?utm_campaign=save50_welcome&promo=save50"
  );
});

test("properties catalog and all email-linked property pages include the SAVE50 landing module", () => {
  const catalog = read(propertiesCatalogPath);
  assert.equal(catalog.includes('partials/save50-offer.njk'), true, "properties catalog missing SAVE50 partial");

  for (const slug of propertyPages) {
    const filePath = path.join(projectRoot, "src", "properties", slug, "index.njk");
    const source = read(filePath);
    assert.equal(source.includes('partials/save50-offer.njk'), true, `${slug} missing SAVE50 partial`);
  }
});

test("SAVE50 reminder is only mounted on the properties catalog and five email-linked homes", () => {
  const filesWithInclude = walkFiles(path.join(projectRoot, "src"))
    .filter((filePath) => read(filePath).includes('partials/save50-offer.njk'))
    .map((filePath) => path.relative(projectRoot, filePath));

  assert.deepEqual(filesWithInclude.sort(), [...allowedSave50IncludePaths].sort());
});
