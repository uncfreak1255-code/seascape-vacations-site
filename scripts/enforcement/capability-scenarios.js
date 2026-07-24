const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const {
  assertRequiredHeadTags,
  readBuiltRoute
} = require("./rendered-route-contract");
const directBookingSmoke = require("../recovery/assert-direct-booking-event-smoke");

const projectRoot = path.resolve(__dirname, "..", "..");
const siteDir = path.join(projectRoot, "_site");
const DEFAULT_OUT_DIR = path.join(projectRoot, ".tmp", "capability-scenarios");

function normalizeRoutePath(routePath) {
  if (!routePath || routePath === "/") return "/";
  const withLeading = routePath.startsWith("/") ? routePath : `/${routePath}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

function builtFilePath(routePath) {
  const normalized = normalizeRoutePath(routePath);
  return normalized === "/"
    ? path.join(siteDir, "index.html")
    : path.join(siteDir, normalized, "index.html");
}

function readBuiltHtml(routePath) {
  const filePath = builtFilePath(routePath);
  return fs.readFileSync(filePath, "utf8");
}

function readSource(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function listBuiltHtmlFiles(dir = siteDir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listBuiltHtmlFiles(fullPath);
    return entry.isFile() && entry.name.endsWith(".html") ? [fullPath] : [];
  });
}

function extractJsonLdObjects(html) {
  const objects = [];
  const pattern = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = pattern.exec(html)) !== null) {
    const parsed = JSON.parse(match[1]);
    objects.push(...(Array.isArray(parsed) ? parsed : [parsed]));
  }

  return objects;
}

function hasJsonLdType(routePath, typeName) {
  return extractJsonLdObjects(readBuiltHtml(routePath)).some((entry) => {
    const rawType = entry && entry["@type"];
    const types = Array.isArray(rawType) ? rawType : [rawType];
    return types.includes(typeName);
  });
}

function countMatches(value, pattern) {
  return Array.from(String(value || "").matchAll(pattern)).length;
}

function assertIncludes(haystack, needle, label) {
  if (!String(haystack).includes(needle)) {
    throw new Error(label || `Missing expected marker: ${needle}`);
  }
}

function assertExcludes(haystack, needle, label) {
  if (String(haystack).includes(needle)) {
    throw new Error(label || `Found forbidden marker: ${needle}`);
  }
}

function assertRouteExists(routePath) {
  const filePath = builtFilePath(routePath);
  if (!fs.existsSync(filePath)) {
    throw new Error(`${routePath} did not build to ${path.relative(projectRoot, filePath)}`);
  }
}

function assertCommandPasses(command, args) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    encoding: "utf8"
  });

  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(output || `${command} ${args.join(" ")} failed`);
  }

  return [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
}

function check(label, fn) {
  return { label, fn };
}

function passEvidence(message, extra = {}) {
  return { message, ...extra };
}

const propertySlugs = [
  "dockside-dreams",
  "the-oasis",
  "sarasota-luxe",
  "river-house",
  "bradenton-pool-home"
];

const SCENARIOS = [
  {
    id: "S01",
    name: "Guest homepage entry",
    capability: "Guest discovery, primary navigation, homepage trust signals",
    userStory: "A guest lands on the homepage and needs clear property options, booking paths, and owner proof without broken runtime dependencies.",
    successCriteria: [
      "Homepage builds and exposes required SEO head tags.",
      "Homepage links to stable property detail pages and property catalog.",
      "Homepage carries owner and direct-booking paths without public runtime API dependencies.",
      "Homepage has no undefined property specs or stale carousel renderer markers."
    ],
    checks: [
      check("homepage route builds", () => {
        assertRouteExists("/");
        return passEvidence("_site/index.html exists");
      }),
      check("homepage head tags are complete", () => {
        const contract = readBuiltRoute(projectRoot, "/");
        assertRequiredHeadTags(contract);
        return passEvidence("title, description, and canonical are present", contract.head);
      }),
      check("homepage exposes stable property links", () => {
        const html = readBuiltHtml("/");
        for (const slug of ["dockside-dreams", "the-oasis"]) {
          assertIncludes(html, `/properties/${slug}/`, `homepage missing ${slug} detail link`);
        }
        assertIncludes(html, "/properties/", "homepage missing property catalog link");
        return passEvidence("featured property and catalog links found");
      }),
      check("homepage avoids stale runtime and renderer markers", () => {
        const html = readBuiltHtml("/");
        for (const marker of [
          "undefined BR",
          "prop-card-carousel",
          "nextCardImage(",
          "/.netlify/functions/get-properties",
          "api.hostaway.com",
          "images.weserv.nl"
        ]) {
          assertExcludes(html, marker);
        }
        return passEvidence("no stale homepage runtime markers found");
      })
    ]
  },
  {
    id: "S02",
    name: "Property browsing and booking handoff",
    capability: "Property catalog, property detail pages, Hostaway booking handoff",
    userStory: "A guest browses properties, opens detail pages, and can reach the secure booking engine with tracked clicks.",
    successCriteria: [
      "Property catalog builds and links to every managed property detail page.",
      "Each property detail page has direct booking and availability tracking.",
      "Booking links use book.seascape-vacations.com, not public Hostaway APIs.",
      "Property pages do not leak raw S3 image URLs or undefined specs."
    ],
    checks: [
      check("property catalog links to all property detail pages", () => {
        const html = readBuiltHtml("/properties/");
        for (const slug of propertySlugs) {
          assertIncludes(html, `/properties/${slug}/`, `properties catalog missing ${slug}`);
        }
        assertIncludes(html, "Book Direct");
        return passEvidence(`${propertySlugs.length} property detail links found`);
      }),
      check("property detail pages expose tracked booking actions", () => {
        const evidence = [];
        for (const slug of propertySlugs) {
          const html = readBuiltHtml(`/properties/${slug}/`);
          assertIncludes(html, "book.seascape-vacations.com", `${slug} missing booking engine URL`);
          assertIncludes(html, 'data-track-event="property_booking_page_click"', `${slug} missing booking click tracking`);
          assertIncludes(html, 'data-track-event="property_check_availability_click"', `${slug} missing availability tracking`);
          assertExcludes(html, "undefined BR", `${slug} includes undefined specs`);
          assertExcludes(html, "hostaway-platform.s3.us-west-2.amazonaws.com", `${slug} leaks raw S3 URLs`);
          evidence.push(slug);
        }
        return passEvidence("property booking events found on every detail page", { routes: evidence });
      })
    ]
  },
  {
    id: "S03",
    name: "Stay collection money pages",
    capability: "Stay hub, stay SEO landers, guide-to-money-page routing",
    userStory: "A guest researching Anna Maria Island or Bradenton stay options can move from stay collections to actual properties without false location claims.",
    successCriteria: [
      "The stay hub builds as a real collection page.",
      "Priority stay pages build and expose property handoff links.",
      "AMI stay copy keeps the near-island boundary instead of claiming on-island inventory.",
      "Stay pages include tracked property click events."
    ],
    checks: [
      check("stay hub routes to priority collections", () => {
        const html = readBuiltHtml("/stays/");
        assertIncludes(html, "Stay Collections");
        assertIncludes(html, "/stays/anna-maria-island-vacation-rentals/");
        assertIncludes(html, "/stays/bradenton-vacation-rentals-near-beaches/");
        assertIncludes(html, "/properties/");
        return passEvidence("stay hub links to AMI, Bradenton, and property catalog paths");
      }),
      check("priority stay pages expose property handoffs", () => {
        const routes = [
          "/stays/anna-maria-island-vacation-rentals/",
          "/stays/bradenton-vacation-rentals-near-beaches/",
          "/stays/anna-maria-island-beachfront-rentals/"
        ];
        const evidence = [];
        for (const route of routes) {
          const html = readBuiltHtml(route);
          assertIncludes(html, 'data-track-event="stay_view_property_click"', `${route} missing stay property click tracking`);
          assertIncludes(html, "/properties/", `${route} missing property link`);
          assertExcludes(html.toLowerCase(), "complimentary kayaks", `${route} has unsupported amenity claim`);
          evidence.push({ route, propertyLinkCount: countMatches(html, /href="\/properties\//g) });
        }
        const amiHtml = readBuiltHtml("/stays/anna-maria-island-vacation-rentals/").toLowerCase();
        if (!/(near anna maria island|near-island|not on anna maria island|bradenton)/.test(amiHtml)) {
          throw new Error("AMI stay page does not preserve the near-island location boundary");
        }
        return passEvidence("priority stay pages have property handoffs and location boundary copy", { routes: evidence });
      })
    ]
  },
  {
    id: "S04",
    name: "Guide research to direct booking",
    capability: "Guide pages, research navigation, email capture, direct-book CTA routing",
    userStory: "A traveler reading a guide can compare destinations, join the email path, and reach relevant direct-book stay pages.",
    successCriteria: [
      "Priority guide pages build with current proof markers.",
      "Guide pages include direct-book click tracking and email capture.",
      "Guides link into relevant stay money pages.",
      "Guide pages do not contain stale relative image paths or raw S3 URLs."
    ],
    checks: [
      check("priority guide pages expose guide conversion paths", () => {
        const routes = [
          "/guides/best-time-visit-anna-maria-island/",
          "/guides/bradenton-vs-sarasota/",
          "/guides/anna-maria-island-vs-siesta-key/"
        ];
        const evidence = [];
        for (const route of routes) {
          const html = readBuiltHtml(route);
          assertIncludes(html, 'data-track-event="guide_book_direct_click"', `${route} missing guide direct-book tracking`);
          assertIncludes(html, 'data-form-submit-event="email_capture_submit"', `${route} missing email capture tracking`);
          assertIncludes(html, "/stays/", `${route} missing stay page routing`);
          assertExcludes(html, "hostaway-platform.s3.us-west-2.amazonaws.com", `${route} leaks raw S3 URL`);
          if (/(?:src|href)=["']images\//i.test(html) || /url\((["']?)images\//i.test(html)) {
            throw new Error(`${route} contains broken relative image paths`);
          }
          evidence.push(route);
        }
        return passEvidence("guide conversion markup found on priority guides", { routes: evidence });
      }),
      check("AMI vs Siesta guide carries current freshness markers", () => {
        const html = readBuiltHtml("/guides/anna-maria-island-vs-siesta-key/");
        for (const marker of [
          "Reviewed July 22, 2026",
          "950 free parking spaces",
          "Early-2026 Seascape rate checks offer context"
        ]) {
          assertIncludes(html, marker);
        }
        for (const stale of ["Updated April 2026", "99% pure quartz", "$250–$700/night"]) {
          assertExcludes(html, stale);
        }
        return passEvidence("current guide proof markers present; stale markers absent");
      })
    ]
  },
  {
    id: "S05",
    name: "Owner acquisition funnel",
    capability: "Owner hub, owner revenue review form, owner-specific pages",
    userStory: "A property owner can reach the proof-first owner hub, submit useful property context, and land on an owner-specific confirmation route.",
    successCriteria: [
      "Owner hub builds with proof-first revenue review surface.",
      "Owner form keeps Netlify handling, friction-light fields, and owner tracking.",
      "Owner confirmation and priority owner pages build.",
      "Owner routes avoid the old generic explainer surface."
    ],
    checks: [
      check("owner hub includes proof-first form surface", () => {
        const html = readBuiltHtml("/property-management/");
        assertIncludes(html, "Before you renew,");
        assertIncludes(html, "actually keep?");
        assertIncludes(html, "15.5%");
        assertIncludes(html, "2.9% + 30¢");
        assertIncludes(html, "Property-specific");
        assertExcludes(html, "$119,923");
        assertExcludes(html, "13.4%");
        assertIncludes(html, "Request Your Revenue Review");
        assertIncludes(html, 'data-track-event="owner_primary_cta_click"');
        assertIncludes(html, 'data-form-submit-event="owner_form_submit"');
        assertIncludes(html, 'data-netlify="true"');
        assertExcludes(html, "What Is Vacation Rental Property Management?");
        return passEvidence("owner hub proof, form, and tracking markers found");
      }),
      check("owner route family builds", () => {
        const routes = [
          "/property-management/revenue-review-requested/",
          "/property-management/vacation-rental-management-sarasota/",
          "/property-management/vacation-rental-management-anna-maria-island/",
          "/property-management/vacation-rental-management-fees-florida/"
        ];
        for (const route of routes) {
          assertRouteExists(route);
          const html = readBuiltHtml(route);
          if (!/owner|revenue|property management|review/i.test(html)) {
            throw new Error(`${route} did not render owner-funnel content`);
          }
        }
        return passEvidence("owner confirmation and priority owner pages build", { routes });
      })
    ]
  },
  {
    id: "S06",
    name: "Conversion tracking runtime",
    capability: "Guest and owner event instrumentation, booking URL decoration, sensitive payload stripping",
    userStory: "Marketing clicks and forms emit useful analytics without leaking personal details into the data layer.",
    successCriteria: [
      "Direct-booking smoke simulation emits all required guest funnel events.",
      "Popup email capture simulation emits the email capture event.",
      "Owner analytics payloads remove email, phone, address, and free-text fields.",
      "Booking engine handoff preserves allowed campaign and stay parameters."
    ],
    checks: [
      check("direct-booking runtime emits required events", () => {
        const observed = directBookingSmoke.simulateDirectBookingEvents();
        const events = observed.map((entry) => entry.event);
        for (const eventName of directBookingSmoke.REQUIRED_EVENTS) {
          if (!events.includes(eventName)) {
            throw new Error(`missing simulated event ${eventName}`);
          }
        }
        const handoff = observed.find((entry) => entry.event === "booking_engine_handoff");
        assertIncludes(handoff.payload.link_url, "utm_source=mcp");
        assertIncludes(handoff.payload.link_url, "checkin=2026-06-01");
        assertIncludes(handoff.payload.link_url, "guests=4");
        return passEvidence("guest funnel events emitted", { events });
      }),
      check("email capture and owner payloads are sanitized", () => {
        const popupEvents = directBookingSmoke.simulatePopupEmailCaptureEvent().map((entry) => entry.event);
        if (!popupEvents.includes("email_capture_submit")) {
          throw new Error("popup capture simulation did not emit email_capture_submit");
        }

        const ownerEvents = directBookingSmoke.simulateSanitizedAnalyticsPayload({
          email: "owner@example.com",
          phone: "(941) 555-1234",
          property_address: "123 Palm Ave",
          what_feels_off: "The statement is confusing",
          source_page_slug: "property-management",
          source_context: "ai_referral",
          listing_url: "https://example.com/listing?email=owner@example.com&utm_source=test",
          safe_bucket: "owner-review"
        });
        const ownerEvent = ownerEvents.find((entry) => entry.event === "owner_form_submit");
        if (!ownerEvent) throw new Error("owner_form_submit was not emitted");
        for (const sensitiveKey of ["email", "phone", "property_address", "what_feels_off"]) {
          if (Object.prototype.hasOwnProperty.call(ownerEvent.payload, sensitiveKey)) {
            throw new Error(`sensitive key was not stripped: ${sensitiveKey}`);
          }
        }
        assertIncludes(JSON.stringify(ownerEvent.payload), "owner-review");
        assertExcludes(JSON.stringify(ownerEvent.payload), "owner@example.com");
        return passEvidence("email capture emitted and owner payload stripped sensitive fields", {
          popupEvents,
          ownerPayloadKeys: Object.keys(ownerEvent.payload)
        });
      })
    ]
  },
  {
    id: "S07",
    name: "AI discovery, metadata, and schema",
    capability: "AI discovery endpoints, canonical metadata, JSON-LD validity",
    userStory: "Search engines and AI assistants can read canonical, proof-bounded site facts without malformed schema.",
    successCriteria: [
      "AI discovery endpoints build and cross-reference the primary contract.",
      "Selected routes have canonical metadata and JSON-LD where expected.",
      "Global JSON-LD validation passes across the built site.",
      "AI surfaces do not overclaim direct-booking revenue or on-island inventory."
    ],
    checks: [
      check("AI discovery endpoints build and point to the primary contract", () => {
        const routes = [
          "/ai-discovery.json",
          "/.well-known/ai.txt",
          "/ai/summary.json",
          "/ai/service.json",
          "/ai/faq.json"
        ];
        for (const route of routes) {
          const clean = route.endsWith(".json") || route.endsWith(".txt")
            ? path.join(siteDir, route)
            : builtFilePath(route);
          if (!fs.existsSync(clean)) {
            throw new Error(`${route} did not build`);
          }
        }
        const aiDiscovery = fs.readFileSync(path.join(siteDir, "ai-discovery.json"), "utf8");
        assertIncludes(aiDiscovery, "direct-booking revenue requires reviewed attributed reservation rows");
        assertIncludes(aiDiscovery, '"owner_lead": ["owner_form_submit"]');
        assertIncludes(readBuiltHtml("/"), "https://seascape-vacations.com/ai-discovery.json");
        return passEvidence("AI endpoint files and homepage alternate contract are present", { routes });
      }),
      check("selected routes expose parseable JSON-LD types", () => {
        const expectedTypes = [
          ["/", "WebSite"],
          ["/properties/dockside-dreams/", "VacationRental"],
          ["/guides/anna-maria-island-vs-siesta-key/", "Article"],
          ["/guides/rainy-day-activities-bradenton-sarasota/", "FAQPage"]
        ];
        for (const [route, typeName] of expectedTypes) {
          const contract = readBuiltRoute(projectRoot, route);
          assertRequiredHeadTags(contract);
          if (!hasJsonLdType(route, typeName)) {
            throw new Error(`${route} missing JSON-LD type ${typeName}`);
          }
        }
        return passEvidence("selected metadata and JSON-LD route contracts passed", { expectedTypes });
      }),
      check("global JSON-LD validator passes", () => {
        const output = assertCommandPasses("node", ["scripts/enforcement/validate-jsonld.js"]);
        return passEvidence(output || "validate-jsonld passed");
      })
    ]
  },
  {
    id: "S08",
    name: "Release routing and static integrity",
    capability: "Redirects, internal links, sitemap, generated-output safety",
    userStory: "The static site can be released without broken internal paths, stale redirect chains, or generated-output leaks.",
    successCriteria: [
      "Redirect targets resolve without avoidable redirect chains.",
      "Internal links and fragments resolve across the built site.",
      "Sitemap includes the major money-page families.",
      "Generated output does not include forbidden public runtime paths."
    ],
    checks: [
      check("redirect and internal-link validators pass", () => {
        const redirectOutput = assertCommandPasses("node", ["scripts/enforcement/validate-redirect-targets.js"]);
        const linkOutput = assertCommandPasses("node", ["scripts/enforcement/validate-internal-links.js"]);
        return passEvidence("redirect and internal-link validators passed", {
          redirectOutput,
          linkOutput
        });
      }),
      check("sitemap and generated output include only expected route families", () => {
        const sitemap = fs.readFileSync(path.join(siteDir, "sitemap.xml"), "utf8");
        for (const route of [
          "/properties/",
          "/property-management/",
          "/stays/",
          "/guides/"
        ]) {
          assertIncludes(sitemap, `https://seascape-vacations.com${route}`, `sitemap missing ${route}`);
        }
        const allHtml = listBuiltHtmlFiles().map((filePath) => fs.readFileSync(filePath, "utf8")).join("\n");
        for (const marker of [
          "/.netlify/functions/get-properties",
          "api.hostaway.com",
          "hostaway-platform.s3.us-west-2.amazonaws.com",
          "Standalone route leaked legacy SPA shell markers"
        ]) {
          assertExcludes(allHtml, marker);
        }
        return passEvidence("sitemap has major families and generated HTML avoids forbidden runtime markers");
      })
    ]
  }
];

function parseArgs(argv) {
  const parsed = {
    scenarioId: "",
    outDir: DEFAULT_OUT_DIR
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--scenario") {
      parsed.scenarioId = argv[index + 1] || "";
      index += 1;
      continue;
    }
    if (arg === "--out") {
      parsed.outDir = path.resolve(argv[index + 1] || DEFAULT_OUT_DIR);
      index += 1;
    }
  }

  return parsed;
}

function runScenario(scenario) {
  const startedAt = process.hrtime.bigint();
  const checks = [];

  for (const scenarioCheck of scenario.checks) {
    const checkStart = process.hrtime.bigint();
    try {
      const evidence = scenarioCheck.fn() || {};
      checks.push({
        label: scenarioCheck.label,
        status: "passed",
        duration_ms: Number(process.hrtime.bigint() - checkStart) / 1e6,
        evidence,
        error: ""
      });
    } catch (error) {
      checks.push({
        label: scenarioCheck.label,
        status: "failed",
        duration_ms: Number(process.hrtime.bigint() - checkStart) / 1e6,
        evidence: {},
        error: error.message
      });
      break;
    }
  }

  const failed = checks.some((entry) => entry.status !== "passed");
  return {
    id: scenario.id,
    name: scenario.name,
    capability: scenario.capability,
    user_story: scenario.userStory,
    success_criteria: scenario.successCriteria,
    status: failed ? "failed" : "passed",
    duration_ms: Number(process.hrtime.bigint() - startedAt) / 1e6,
    checks
  };
}

function renderMarkdown(receipt) {
  const lines = [
    "# Capability Scenario Evidence",
    "",
    `- Generated: ${receipt.generated_at}`,
    `- Method: ${receipt.method}`,
    `- Scenario count: ${receipt.summary.total}`,
    `- Passed: ${receipt.summary.passed}`,
    `- Failed: ${receipt.summary.failed}`,
    `- Verdict: ${receipt.summary.verdict}`,
    "",
    "## Success Criteria",
    "",
    "Each scenario is pass/fail. A scenario passes only when every named check passes under the same built-site condition: `npm run build` first, then this runner against `_site` and source runtime helpers.",
    ""
  ];

  for (const scenario of receipt.scenarios) {
    lines.push(`## ${scenario.id} ${scenario.name}`, "");
    lines.push(`- Capability: ${scenario.capability}`);
    lines.push(`- User story: ${scenario.user_story}`);
    lines.push(`- Status: ${scenario.status}`);
    lines.push("- Criteria:");
    for (const criterion of scenario.success_criteria) {
      lines.push(`  - ${criterion}`);
    }
    lines.push("- Checks:");
    for (const checkResult of scenario.checks) {
      const suffix = checkResult.error ? ` - ${checkResult.error}` : "";
      lines.push(`  - ${checkResult.status}: ${checkResult.label}${suffix}`);
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

function writeReceipt(receipt, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const jsonPath = path.join(outDir, "capability-scenarios.json");
  const markdownPath = path.join(outDir, "capability-scenarios.md");
  fs.writeFileSync(jsonPath, `${JSON.stringify(receipt, null, 2)}\n`);
  fs.writeFileSync(markdownPath, renderMarkdown(receipt));
  return { jsonPath, markdownPath };
}

function run({ scenarioId = "", outDir = DEFAULT_OUT_DIR } = {}) {
  if (!fs.existsSync(siteDir)) {
    throw new Error("_site directory not found. Run `npm run build` before capability scenarios.");
  }

  const selectedScenarios = scenarioId
    ? SCENARIOS.filter((scenario) => scenario.id === scenarioId || scenario.name === scenarioId)
    : SCENARIOS;

  if (selectedScenarios.length === 0) {
    throw new Error(`Unknown scenario: ${scenarioId}`);
  }

  const receipt = {
    receipt_type: "capability_scenario_evidence",
    generated_at: new Date().toISOString(),
    source: "scripts/enforcement/capability-scenarios.js",
    method: "Pass/fail checks with named evidence. All scenarios run against the same built `_site` output and local source runtime helpers.",
    repo_root: projectRoot,
    git: {
      branch: spawnSync("git", ["branch", "--show-current"], { cwd: projectRoot, encoding: "utf8" }).stdout.trim(),
      head: spawnSync("git", ["rev-parse", "HEAD"], { cwd: projectRoot, encoding: "utf8" }).stdout.trim()
    },
    scenarios: selectedScenarios.map(runScenario)
  };

  const failed = receipt.scenarios.filter((scenario) => scenario.status !== "passed");
  receipt.summary = {
    verdict: failed.length ? "fail" : "pass",
    total: receipt.scenarios.length,
    passed: receipt.scenarios.length - failed.length,
    failed: failed.length,
    failed_scenarios: failed.map((scenario) => scenario.id)
  };

  const paths = writeReceipt(receipt, outDir);
  receipt.receipt_paths = {
    json: path.relative(projectRoot, paths.jsonPath),
    markdown: path.relative(projectRoot, paths.markdownPath)
  };
  fs.writeFileSync(paths.jsonPath, `${JSON.stringify(receipt, null, 2)}\n`);
  fs.writeFileSync(paths.markdownPath, renderMarkdown(receipt));

  return receipt;
}

if (require.main === module) {
  try {
    const parsed = parseArgs(process.argv.slice(2));
    const receipt = run(parsed);
    console.log(`capability-scenarios: ${receipt.summary.passed}/${receipt.summary.total} passed`);
    console.log(`receipt: ${receipt.receipt_paths.markdown}`);
    if (receipt.summary.failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  SCENARIOS,
  run,
  runScenario
};
