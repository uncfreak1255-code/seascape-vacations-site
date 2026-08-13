const moneyRoutes = [
  {
    slug: "home",
    path: "/",
    readySelector: ".hero-booking",
  },
  {
    slug: "property-management",
    path: "/property-management/",
    readySelector: "#owner-cta",
    screenshot: {
      maxDiffPixels: 35_000,
      maxDiffPixelRatio: 0.003,
      timeout: 20_000,
    },
  },
  {
    slug: "owner-fee-revenue-leak-benchmark-2026",
    path: "/research/owner-fee-revenue-leak-benchmark-2026/",
    readySelector: "main h1",
  },
  {
    slug: "how-seascape-protects-owner-net-2026",
    path: "/research/how-seascape-protects-owner-net-2026/",
    readySelector: "main h1",
    screenshot: {
      maxDiffPixels: 15_000,
      maxDiffPixelRatio: 0.012,
    },
  },
  {
    slug: "properties-catalog",
    path: "/properties/",
    readySelector: "main h1",
    screenshot: {
      maxDiffPixels: 25_000,
      maxDiffPixelRatio: 0.012,
    },
  },
  {
    slug: "guide-bradenton-vs-sarasota",
    path: "/guides/bradenton-vs-sarasota/",
    readySelector: "main h1",
  },
  {
    slug: "guide-ami-vs-siesta-key",
    path: "/guides/anna-maria-island-vs-siesta-key/",
    readySelector: "main h1",
  },
  {
    slug: "guide-siesta-vs-ami-families",
    path: "/guides/siesta-key-vs-anna-maria-island-families/",
    readySelector: "h1",
  },
  {
    slug: "guide-shelling-florida",
    path: "/guides/shelling-guide-florida/",
    readySelector: ".journal-cover h1",
  },
  {
    slug: "stay-fishing-vacation-rentals-bradenton",
    path: "/stays/fishing-vacation-rentals-bradenton/",
    readySelector: "main h1",
  },
];

module.exports = {
  moneyRoutes,
};
