# Source Of Truth

- Editable source: `src/`, `src/_data/`, `eleventy.config.js`, `package.json`, `netlify.toml`
- Generated output: `_site/`
- Build command: `npm run build`
- Publish directory: `_site`
- Legacy archival content only: `DEPLOY THIS FOLDER TO NETLIFY/`, top-level `stays/`, top-level `property-management/`, root `index.html`
- Public property/stay browsing source: `src/_data/properties.js`
- Public pages must not fetch Hostaway, Netlify functions, or PMS APIs at render time
- Direct booking widgets and booking-engine handoff are allowed only on intentional booking surfaces
- Never hand-edit generated output before deploy
