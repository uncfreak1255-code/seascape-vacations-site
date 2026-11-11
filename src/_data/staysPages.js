const getProperties = require("./properties");
const seoPages = require("./seoPages.json");
const { applyStayFacts, assertNoHandTypedStayFacts, assertStayCapacityBindings } = require("./stayFacts");

module.exports = async function staysPages() {
  const catalog = await getProperties();
  return seoPages.vacationer
    .filter((page) => !page.rehomeTo)
    .map((page) => {
      assertNoHandTypedStayFacts(page);
      assertStayCapacityBindings(page, catalog);
      const resolvedPage = applyStayFacts(page, catalog);
      if (page.heroBookingAction) {
        const home = catalog.find(property => property.slug === page.heroBookingAction.propertySlug);
        const photo = home?.photography?.photos?.[0];
        if (!photo) throw new Error(`Missing verified hero photo for ${page.heroBookingAction.propertySlug}`);
        resolvedPage.heroImage = photo.src;
      }
      return resolvedPage;
    });
};
