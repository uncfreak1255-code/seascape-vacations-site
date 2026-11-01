// Share verified facts with the homepage and catalog.
module.exports = {
  propertyDetails: require("../../_data/properties-fallback.json").find(
    (property) => property.slug === "relaxing-oasis"
  )
};
