const { catalogHomeCountWord } = require("../enforcement/home-count-word");

module.exports = function validateOwnerLiveSurface(body, { requireIncludes, requireExcludes }) {
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
      "Average Guest Rating"
    ]);
    requireIncludes("/property-management/ local-alternative", body, [
      "Is Seascape a local alternative to Vacasa or Evolve?",
      "Seascape Vacations is an owner-operated vacation rental manager",
    ]);
    if (!/data-placement=["\']local-alternative["\']/.test(body)) {
      throw new Error("property-management local-alternative action is missing tracking");
    }
};
