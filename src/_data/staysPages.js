const getProperties = require("./properties");
const seoPages = require("./seoPages.json");
const { applyStayFacts, assertNoHandTypedStayFacts } = require("./stayFacts");

module.exports = async function staysPages() {
  const catalog = await getProperties();
  return seoPages.vacationer
    .filter((page) => !page.rehomeTo)
    .map((page) => {
      assertNoHandTypedStayFacts(page);
      return applyStayFacts(page, catalog);
    });
};
