// Local design alternatives composed from the existing built guest components.
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../../..');
const output = process.env.STAY_FLOW_PREVIEW_DIR || '/private/tmp/stay-flow-previews';
const read = (route) => fs.readFileSync(path.join(root, '_site', route, 'index.html'), 'utf8');

(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    for (const flow of ['browse', 'dockside']) {
      const html = await page.evaluate(({ stay, catalog, dockside, flow }) => {
        const parse = (html) => new DOMParser().parseFromString(html, 'text/html');
        const doc = parse(stay), source = parse(catalog), detail = parse(dockside);
        const main = doc.querySelector('main');
        const hero = main.querySelector('.hero');
        const oldHomes = main.querySelector('#rentals');
        const cards = [...oldHomes.querySelectorAll('.property-card')];
        const slugs = cards.map((card) => card.querySelector('[data-placement="stay_property_card"]').dataset.pageSlug);
        const intro = main.querySelector('.intro-copy').closest('section');
        const stats = main.querySelector('.stats-bar');
        const supportingActions = hero.querySelector('.hero-actions');
        const supportingProof = hero.querySelector('.trust-chips');
        intro.querySelector('.container-narrow').prepend(supportingActions, supportingProof);
        doc.body.classList.add('stay-flow', `flow-${flow}`);
        for (const href of ['/css/catalog.css', '/css/catalog-card.css?v=waterline-v3', '/__stay-flow-preview.css']) {
          const link = doc.createElement('link'); link.rel = 'stylesheet'; link.href = href; doc.head.append(link);
        }
        const addScript = (src) => { const script = doc.createElement('script'); script.src = src; script.defer = true; doc.body.append(script); };
        const root = source.querySelector('[data-catalog-version]');
        root.querySelectorAll('.catalog-breadcrumb,.catalog-intro,.save50-offer,.catalog-help').forEach((node) => node.remove());
        [...root.children].filter((node) => ['STYLE', 'SCRIPT'].includes(node.tagName)).forEach((node) => node.remove());
        root.querySelectorAll('[data-property]').forEach((node) => { if (!slugs.includes(node.dataset.property)) node.remove(); });
        root.querySelectorAll('[data-compare-column]').forEach((node) => { if (!slugs.includes(node.dataset.compareColumn)) node.remove(); });
        root.querySelectorAll('[data-filter]').forEach((node) => { if (!['all', 'waterfront'].includes(node.dataset.filter)) node.remove(); });
        root.querySelector('#catalog-count').textContent = `${slugs.length} homes · Availability confirmed on the booking page`;
        root.querySelector('#catalog-heading').textContent = oldHomes.querySelector('h2').textContent;
        root.querySelector('.catalog-collection-heading .section-tag').textContent = oldHomes.querySelector('.section-tag').textContent;
        root.querySelector('.catalog-collection-heading > p').textContent = oldHomes.querySelector('.section-subtitle').textContent;
        for (const card of cards) {
          const action = card.querySelector('[data-placement="stay_property_card"]');
          const current = root.querySelector(`[data-property="${action.dataset.pageSlug}"]`);
          current.querySelector('.catalog-card-media').innerHTML = card.querySelector('.property-img').outerHTML;
          current.querySelector('h3 a').textContent = card.querySelector('.property-title').textContent;
          current.querySelector('.catalog-card-specs').textContent = card.querySelector('.property-meta').textContent;
          current.querySelector('.catalog-card-reason > p:last-child').textContent = card.querySelector('.property-highlight').textContent;
          current.querySelector('.catalog-fit-note')?.remove();
          current.querySelector('.catalog-card-foot').before(card.querySelector('.property-price').cloneNode(true));
          const explore = current.querySelector('.catalog-details-link');
          for (const attr of action.attributes) if (attr.name.startsWith('data-') || attr.name === 'href') explore.setAttribute(attr.name, attr.value);
          root.querySelector('#catalog-grid').append(current);
        }
        if (flow === 'browse') {
          root.id = 'rentals';
          root.querySelector('.catalog-collection').id = 'featured-homes';
          oldHomes.replaceWith(root);
          hero.after(root); root.after(stats); stats.after(intro);
          hero.append(root.querySelector('.catalog-trip'));
          addScript('/assets/js/catalog.js');
        } else {
          const selected = root.querySelector('[data-property="dockside-dreams"]');
          selected.querySelector('.catalog-card-topline')?.remove();
          selected.querySelector('.catalog-card-foot')?.remove();
          selected.querySelector('.catalog-quote-note')?.remove();
          selected.querySelector('h3').outerHTML = `<h2>${selected.querySelector('h3').innerHTML}</h2>`;
          const feature = doc.createElement('section'); feature.className = 'flow-feature'; feature.setAttribute('aria-label', 'Dockside Dreams and booking');
          feature.dataset.propertyPage = 'dockside-dreams';
          const booking = detail.querySelector('.g-booking');
          feature.append(selected, booking);
          const chooser = doc.createElement('nav'); chooser.className = 'flow-home-chooser'; chooser.setAttribute('aria-label', 'Choose a family home');
          for (const card of cards) {
            const action = card.querySelector('[data-placement="stay_property_card"]');
            const link = doc.createElement('a'); link.href = action.getAttribute('href') + '#booking'; link.dataset.tripLink = '';
            link.textContent = card.querySelector('.property-title').textContent;
            chooser.append(link);
            action.textContent = 'Explore this home'; action.setAttribute('data-trip-link', '');
          }
          hero.after(chooser); chooser.after(feature); feature.after(stats); stats.after(intro);
          oldHomes.classList.add('flow-more-homes');
          addScript('/assets/js/guest.js');
        }
        // Keep the old secondary escape link available, without covering inputs.
        doc.querySelector('.sticky-mobile-cta').className = 'flow-secondary-links';
        return '<!doctype html>\n' + doc.documentElement.outerHTML;
      }, { stay: read('stays/family-vacation-rentals-anna-maria-island'), catalog: read('properties'), dockside: read('properties/dockside-dreams'), flow });
      fs.mkdirSync(output, { recursive: true });
      fs.writeFileSync(path.join(output, `${flow}.html`), html);
    }
    console.log(JSON.stringify({ output, variants: ['browse', 'dockside'], publicSourceChanged: false }));
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
