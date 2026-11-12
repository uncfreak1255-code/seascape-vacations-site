const { moneyRoutes } = require("./routes");

// Shared by design-floors.spec.js and design-floors-desktop-overflow.spec.js so
// both F3 checks cover the same routes and measure overflow the same way.
const floorRoutes = moneyRoutes.concat(require("./extra-property-routes"));

function measureOverflow() {
  // Compare against the layout viewport, not window.innerWidth: under mobile
  // emulation Chromium widens innerWidth to swallow an overflowing document, so
  // scrollWidth <= innerWidth stayed true while the page really did scroll
  // sideways (measured 2026-09-10: a 391px document inside a 360px viewport
  // reported innerWidth 391 and passed).
  return {
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: document.documentElement.clientWidth,
  };
}

module.exports = { floorRoutes, measureOverflow };
