// Shared by live smoke; keep the approved offer, catalog size and authority confirmation intact.
module.exports = function hasOwnerOfferSurface(body, homeCountWord) {
  return /Know what your home earned <em>and what needs attention\.<\/em>/.test(body)
    && new RegExp(`\\b${homeCountWord} homes\\. One local team\\.`, "i").test(body)
    && body.includes("What we do for your home")
    && new RegExp(`Why a ${homeCountWord}-home operator`, "i").test(body)
    && body.includes("The homes we manage")
    && body.includes("Request your 48-hour revenue review")
    && body.includes('name="submitter_authority" value="owner_or_authorized_representative" required')
    && body.includes("I confirm I am the property owner or an authorized representative for this property.")
    && body.includes("Owner statement, optional")
    && /name=["']owner-revenue-teardown["']/.test(body)
    && body.includes('href="#owner-cta"');
};
