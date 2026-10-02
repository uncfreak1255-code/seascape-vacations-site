const https = require("https");
const { isCurrentAvailabilityRange } = require("../cache/normalize-hostaway");
const { LISTINGS } = require("../booking/stay-availability");

// "Book these dates" on a home's page and on a catalog card opens this Hostaway address. Hostaway does
// not document it, so the daily smoke loads it for an open stay and fails when the priced checkout stops appearing.
// Rollback: make checkoutUrl() in src/assets/js/guest.js return the listing address, and remove the
// "/checkout/" line in syncLinks() in src/assets/js/catalog.js.
const CHECKOUT_ORIGIN = "https://book.seascape-vacations.com";
