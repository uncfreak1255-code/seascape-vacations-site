// Body classes that widen F1/F2 from the shell to the whole page, and one
// route per family with the class its layout must keep. Dropping the class
// would otherwise shrink the floors silently (PR C, 2026-10-25).
const WHOLE_PAGE_CLASSES = ["guest-site", "planning-guide"];
const WHOLE_PAGE_FAMILIES = {
  owner: ["property-management", "guest-site"],
  about: ["about-seascape", "guest-site"],
  catalog: ["properties-catalog", "guest-site"],
  property: ["the-oasis", "guest-site"],
  guide: ["guide-ami-how-to-get-to", "planning-guide"],
  comparison: ["guide-bradenton-vs-sarasota", "planning-guide"],
  activity: ["guide-rainy-day", "planning-guide"],
};

module.exports = { WHOLE_PAGE_CLASSES, WHOLE_PAGE_FAMILIES };
