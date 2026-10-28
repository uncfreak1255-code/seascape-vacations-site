// The live stylesheets design-sync copies verbatim to waterline/<name>.css.
// guest.css loses its @font-face blocks (fonts.css carries them). Add a sheet
// here and in templates/README.md together.
module.exports = ["base", "guest", "motion", "arrival", "catalog", "catalog-card", "about", "property-gallery", "owner", "planning-guide", "comparison-guide"];
