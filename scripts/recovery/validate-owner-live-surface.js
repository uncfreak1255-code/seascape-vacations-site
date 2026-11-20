const { catalogHomeCountWord } = require("../enforcement/home-count-word");

const FEE_PASSAGE_INCLUDES = [
  "How our management fee works",
  "Seascape charges a share of your home's net rent, with a lower rate for homes that earn more and a monthly minimum.",
  "Patrick quotes your exact fee after looking at your home."
];

const FEE_PASSAGE_EXCLUDES = [
  "Vacation rental management from 17%",
  "17–20% of net rent",
  "17-20% of net rent",
  "$85 a month",
  "most homes are 20%",
  "headline fee"
];

function visibleText(body) {
  return String(body)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function assertNoPublishedFeeNumbers(body) {
  const text = visibleText(body).replace(/\s+/g, " ").trim();
  if (!text) {
    throw new Error("/property-management/ live-smoke fee scan received empty copy");
  }
  if (/\d+(?:\.\d+)?\s*%/.test(text) || /\$\d/.test(text)) {
    throw new Error("/property-management/ still publishes a fee percentage or dollar amount");
  }
}

function validateOwnerLiveSurface(body, { requireIncludes, requireExcludes }) {
    const homeCountWord = catalogHomeCountWord();
    const hasOwnerOfferSurface = require("./owner-offer-surface")(body, homeCountWord);

    if (!hasOwnerOfferSurface) {
      throw new Error("property-management hub is missing the Waterline owner offer surface");
    }

    if (
      body.includes("What Is Vacation Rental Property Management?")
      || body.includes("View All Properties")
      || body.includes("Request a property evaluation")
      || body.includes("$119,923")
      || body.includes("13.4%")
      || body.includes("Reply guaranteed")
      || body.includes("The Fee Comparison")
      || body.includes("Before you renew,")
    ) {
      throw new Error("property-management hub is serving retired owner copy");
    }

    requireExcludes("/property-management/", body, [
      "/property-management/vacation-rental-taxes-florida/",
      "/property-management/vacation-rental-insurance-florida/",
      "Average Guest Rating",
      "g-header-owners"
    ]);
    requireIncludes("/property-management/ management fee", body, FEE_PASSAGE_INCLUDES);
    requireExcludes("/property-management/", body, FEE_PASSAGE_EXCLUDES);
    assertNoPublishedFeeNumbers(body);
    requireIncludes("/property-management/ local-alternative", body, [
      "Is Seascape a local alternative to Vacasa or Evolve?",
      "Seascape Vacations is an owner-operated vacation rental manager",
    ]);
    if (!/data-placement=["\']local-alternative["\']/.test(body)) {
      throw new Error("property-management local-alternative action is missing tracking");
    }
}

validateOwnerLiveSurface.FEE_PASSAGE_INCLUDES = FEE_PASSAGE_INCLUDES;
validateOwnerLiveSurface.FEE_PASSAGE_EXCLUDES = FEE_PASSAGE_EXCLUDES;
validateOwnerLiveSurface.assertNoPublishedFeeNumbers = assertNoPublishedFeeNumbers;

module.exports = validateOwnerLiveSurface;
