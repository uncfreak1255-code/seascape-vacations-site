"use strict";
/**
 * Chrome for the preview cards: the eyebrow, title, note, frame and spec rows that
 * wrap each card's real site markup. Split out of build.js so that file stays under
 * the staged-file size gate. Takes the Waterline colour tokens from DESIGN.md.
 */
module.exports = function chromeCss(C) {
  return `.ds-doc{padding:32px 36px 40px}
.ds-eyebrow{font:500 12px/1.4 Poppins,sans-serif;letter-spacing:.13em;text-transform:uppercase;color:${C.muted};margin:0 0 10px}
.ds-title{font:400 30px/1.12 'Instrument Serif',Georgia,serif;letter-spacing:-.02em;color:${C.ink};margin:0 0 8px}
.ds-note{font:13px/1.65 Poppins,sans-serif;color:${C.muted};max-width:640px;margin:0 0 24px}
.ds-note strong{color:${C.ink};font-weight:500}
.ds-frame{position:relative;border:1px solid ${C.rule};background:${C.paper};overflow:hidden}
.ds-caption{font:12px/1.5 Poppins,sans-serif;color:${C.muted};margin:8px 0 24px}
.ds-grid{display:grid;gap:12px}
.ds-sw{min-height:124px;padding:14px;display:flex;flex-direction:column;justify-content:space-between;border:1px solid ${C.rule}}
.ds-sw b{font:400 20px 'Instrument Serif',serif;letter-spacing:-.01em}
.ds-sw small{font:12px/1.45 Poppins,sans-serif;display:block}
.ds-row{display:flex;gap:16px;flex-wrap:wrap;align-items:center}
.ds-spec{font:12px/1.5 Poppins,sans-serif;color:${C.muted};min-width:170px}
.ds-line{display:grid;grid-template-columns:190px 1fr;gap:24px;align-items:baseline;padding:18px 0;border-bottom:1px solid ${C.rule}}
.ds-line:last-child{border-bottom:0}
.ds-rule{height:1px;background:${C.rule};margin:24px 0}
`;
};
