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
      return applyStayFacts(page, catalog);
    });
};
