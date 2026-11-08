# Page transitions

Every guest page opts into same-origin cross-document view transitions (`@view-transition{navigation:auto}` in `src/css/guest.css` and the guest layout head). Home photos already morph from the homepage and catalog into the property page. This note covers the page-to-page change added in November 2026 (`src/css/motion.css`, `src/assets/js/guest-menu.js`).

- The header carries `view-transition-name: g-header`, so it stays in place while the page underneath changes.
- The old page fades out over 150ms. The new page fades in over 200ms and settles from 8px below. Both use `cubic-bezier(.23,1,.32,1)`. Nothing slides sideways and nothing scales.
- If the user has scrolled past the header before leaving, `pageswap` clears the header's transition name. Otherwise an off-screen header would fly down into place. `pageshow` restores it after a back/forward cache return.
- With reduced motion, no transition runs; the opt-in itself sits behind `prefers-reduced-motion: no-preference`. Browsers without cross-document view transitions navigate normally.
