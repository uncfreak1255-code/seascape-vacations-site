"use strict";

const moneyRoutes = [
  "/property-management/vacation-rental-management-fees-florida/",
  "/property-management/vacation-rental-licensing-florida/",
  "/property-management/vrbo-management-services-florida/",
  "/stays/anna-maria-island-vacation-rentals/",
  "/stays/anna-maria-island-beachfront-rentals/",
];

// One page per guest and owner journey beyond the homepage: the property
// catalog (listing, guest trip form) and the owner page (owner evaluation
// form). The inquiry send itself is a live Netlify function call and is not
// a page load, so it is not measured here.
const journeyRoutes = ["/properties/", "/property-management/"];

module.exports = { journeyRoutes, moneyRoutes };
