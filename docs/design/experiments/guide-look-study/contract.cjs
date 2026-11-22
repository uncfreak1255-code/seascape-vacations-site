// The copy contract for the guide look study.
//
// A view may move and restyle what the built guide already says. It may not drop, hide, retype
// or add to it, except for strings named in that view's `strings.json`. `snapshot` runs in the
// page and records what is there; `compare` runs in Node and lists every difference between
// today's page and a view. verify.cjs proves the contract bites by breaking the page on purpose.

// Runs in the browser, so it must not use anything defined outside itself.
function snapshot() {
  const SKIP = 'script,style,noscript,template';
  const norm = (value) => String(value || '').replace(/\s+/g, ' ').trim();
  // A closed toggle must not hide copy from the check, so every one is opened first.
  for (const details of document.querySelectorAll('details')) details.open = true;
  const root = document.documentElement;
  const pageWidth = root.scrollWidth;
  const pageHeight = root.scrollHeight;

  function overlaps(a, b) {
    return Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0.5
      && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0.5;
  }

  // Rendered means: it has a box with area, on the page, that no ancestor hides or clips away.
  function rendered(node) {
    const parent = node.parentElement;
    if (!parent || !parent.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
    const range = document.createRange();
    range.selectNodeContents(node);
    let rects = [...range.getClientRects()].filter((rect) => rect.width > 0.5 && rect.height > 0.5);
    if (!rects.length && parent instanceof SVGElement) {
      rects = [parent.getBoundingClientRect()].filter((rect) => rect.width > 0.5 && rect.height > 0.5);
    }
    if (!rects.length) return false;
    const page = { left: -window.scrollX, top: -window.scrollY, right: pageWidth - window.scrollX, bottom: pageHeight - window.scrollY };
    rects = rects.filter((rect) => overlaps(rect, page));
    for (let el = parent; el && el !== document.body && rects.length; el = el.parentElement) {
      const style = getComputedStyle(el);
      if (style.clipPath !== 'none' || (style.clip !== 'auto' && style.position !== 'static')) return false;
      if (/hidden|clip/.test(style.overflowX + style.overflowY)) {
        const box = el.getBoundingClientRect();
        rects = rects.filter((rect) => overlaps(rect, box));
      }
    }
    return rects.length > 0;
  }

  const text = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const value = norm(node.nodeValue);
    if (!value || !node.parentElement || node.parentElement.closest(SKIP)) continue;
    text.push([value, rendered(node)]);
  }

  const attrs = [];
  for (const el of document.body.querySelectorAll('[alt],[aria-label],[title],[placeholder]')) {
    for (const name of ['alt', 'aria-label', 'title', 'placeholder']) {
      const value = norm(el.getAttribute(name));
      if (value) attrs.push(name + ': ' + value);
    }
  }

  const idCount = {};
  for (const el of document.querySelectorAll('[id]')) idCount[el.id] = (idCount[el.id] || 0) + 1;

  const all = (selector, map) => [...document.querySelectorAll(selector)].map(map);
  return {
    text,
    attrs,
    headings: all('body h1,body h2,body h3,body h4,body h5,body h6', (el) => el.tagName.toLowerCase() + ' ' + norm(el.textContent)),
    idCount,
    hrefs: all('body a[href]', (el) => el.getAttribute('href')),
    brokenHashes: all('body a[href^="#"]', (el) => el.getAttribute('href'))
      .filter((href) => href.length > 1 && idCount[decodeURIComponent(href.slice(1))] !== 1),
    images: all('body img', (el) => (el.getAttribute('src') || '') + ' | ' + norm(el.getAttribute('alt'))),
    tracked: all('body [data-track-event]', (el) => [el.tagName, el.dataset.trackEvent, el.dataset.trackLabel || '', el.getAttribute('href') || ''].join(' | ')),
    fields: all('body form, body input, body select, body textarea, body button', (el) => [el.tagName, el.getAttribute('type') || '', el.getAttribute('name') || '', el.id].join(' | ')),
    meta: {
      title: document.title,
      lang: root.lang,
      tags: all('head meta', (el) => [...el.attributes].map((attr) => attr.name + '=' + attr.value).join(' ')),
      links: all('link', (el) => [...el.attributes].map((attr) => attr.name + '=' + attr.value).join(' '))
        .filter((line) => !line.includes('/__study/')),
      jsonLd: all('script[type="application/ld+json"]', (el) => norm(el.textContent)),
    },
    overflow: root.scrollWidth - window.innerWidth,
  };
}

function tally(list) {
  const counts = new Map();
  for (const item of list) counts.set(item, (counts.get(item) || 0) + 1);
  return counts;
}

// Items in `from` that `other` has fewer of, with how many are short.
function shortfall(from, other) {
  const out = [];
  for (const [item, count] of from) {
    const gap = count - (other.get(item) || 0);
    if (gap > 0) out.push([item, gap]);
  }
  return out;
}

const clip = (value) => (value.length > 90 ? value.slice(0, 87) + '...' : value);

// `strings` is the view's strings.json: { added, removed, hidden, addedLinks }, each a list of
// { text | href, why, count? }. Returns one line per broken promise; an empty list is a pass.
function compare(control, view, strings = {}) {
  const fails = [];
  const allow = (key) => new Map((strings[key] || []).map((entry) => [entry.text || entry.href, entry.count || 1]));
  const added = allow('added');
  const removed = allow('removed');
  const hidden = allow('hidden');
  const addedLinks = allow('addedLinks');
  const usedAdded = new Map();
  const usedRemoved = new Map();
  const spend = (budget, used, item, count) => {
    used.set(item, (used.get(item) || 0) + count);
    return used.get(item) <= (budget.get(item) || 0);
  };

  const controlText = tally(control.text.map((row) => row[0]));
  const viewText = tally(view.text.map((row) => row[0]));
  for (const [item, count] of shortfall(controlText, viewText)) {
    if (!spend(removed, usedRemoved, item, count)) fails.push(`copy removed (${count}x): "${clip(item)}"`);
  }
  for (const [item, count] of shortfall(viewText, controlText)) {
    if (!spend(added, usedAdded, item, count)) fails.push(`text added without being listed (${count}x): "${clip(item)}"`);
  }

  const seen = (snap) => tally(snap.text.filter((row) => row[1]).map((row) => row[0]));
  for (const [item, count] of shortfall(seen(control), seen(view))) {
    const excused = (removed.get(item) || 0) + (hidden.get(item) || 0);
    if (count > excused) fails.push(`copy no longer rendered (${count}x): "${clip(item)}"`);
  }

  const controlAttrs = tally(control.attrs);
  const viewAttrs = tally(view.attrs);
  for (const [item, count] of shortfall(controlAttrs, viewAttrs)) fails.push(`attribute text removed (${count}x): "${clip(item)}"`);
  for (const [item, count] of shortfall(viewAttrs, controlAttrs)) {
    const value = item.slice(item.indexOf(': ') + 2);
    if (!spend(added, usedAdded, value, count)) fails.push(`attribute text added without being listed (${count}x): "${clip(item)}"`);
  }

  const controlHeadings = tally(control.headings);
  const viewHeadings = tally(view.headings);
  for (const [item] of shortfall(controlHeadings, viewHeadings)) fails.push(`heading changed or removed: "${clip(item)}"`);
  for (const [item] of shortfall(viewHeadings, controlHeadings)) {
    if (!added.has(item.slice(item.indexOf(' ') + 1))) fails.push(`heading added without being listed: "${clip(item)}"`);
  }
  const h1s = view.headings.filter((item) => item.startsWith('h1 ')).length;
  if (h1s !== 1) fails.push(`expected one h1, found ${h1s}`);

  for (const id of Object.keys(control.idCount)) {
    if (!view.idCount[id]) fails.push(`id removed: #${id}`);
  }
  for (const [id, count] of Object.entries(view.idCount)) {
    if (count > 1 && count > (control.idCount[id] || 0)) fails.push(`id used ${count} times: #${id}`);
  }
  for (const href of view.brokenHashes) {
    if (!control.brokenHashes.includes(href)) fails.push(`link target missing or duplicated: ${href}`);
  }

  const controlHrefs = tally(control.hrefs);
  const viewHrefs = tally(view.hrefs);
  for (const [item, count] of shortfall(controlHrefs, viewHrefs)) fails.push(`link removed (${count}x): ${clip(item)}`);
  for (const [item, count] of shortfall(viewHrefs, controlHrefs)) {
    const sameSection = /^#pg-\d+$/.test(item);
    if (!sameSection && count > (addedLinks.get(item) || 0)) fails.push(`link added without being listed (${count}x): ${clip(item)}`);
  }

  for (const [item] of shortfall(tally(control.images), tally(view.images))) fails.push(`image removed or its alt changed: ${clip(item)}`);
  for (const [item] of shortfall(tally(view.images), tally(control.images))) {
    if (!item.startsWith('/__study/photos/')) fails.push(`image added from outside the study photos folder: ${clip(item)}`);
    else if (item.endsWith(' | ')) fails.push(`study photo has no alt text: ${clip(item)}`);
  }

  for (const key of ['tracked', 'fields']) {
    const before = tally(control[key]);
    const after = tally(view[key]);
    for (const [item] of shortfall(before, after)) fails.push(`${key} element removed or changed: ${clip(item)}`);
    for (const [item] of shortfall(after, before)) fails.push(`${key} element added: ${clip(item)}`);
  }

  if (JSON.stringify(control.meta) !== JSON.stringify(view.meta)) {
    const part = Object.keys(control.meta).find((key) => JSON.stringify(control.meta[key]) !== JSON.stringify(view.meta[key]));
    fails.push(`metadata changed: ${part}`);
  }
  if (view.overflow > 0) fails.push(`page is ${view.overflow}px wider than the screen with every toggle open`);

  return { fails, usedAdded, usedRemoved, added, removed };
}

// A listed string that no viewport ever used means the list is out of date.
function staleEntries(strings, results) {
  const out = [];
  for (const [key, usedKey] of [['added', 'usedAdded'], ['removed', 'usedRemoved']]) {
    for (const entry of strings[key] || []) {
      if (!results.some((result) => result[usedKey].has(entry.text))) out.push(`${key} string is listed but never appears: "${clip(entry.text)}"`);
    }
  }
  return out;
}

// Floors F1 and F2 from DESIGN.md, the same rules as tests/visual/design-floors.spec.js. Both run
// in the browser and return one key per offender so a view can be compared with today's page.
function smallText() {
  const SKIP = 'script,style,noscript,template,option,[hidden],.g-sr-only,[aria-hidden="true"]';
  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const el = node.parentElement;
    const value = node.nodeValue.replace(/\s+/g, ' ').trim();
    if (!value || !el || el.closest(SKIP) || !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
    const box = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    if (box.width === 0 || box.height === 0 || (style.clipPath !== 'none' && box.width <= 1)) continue;
    const size = parseFloat(style.fontSize);
    if (size < 12) out.push(`${size}px ${el.tagName.toLowerCase()} "${value.slice(0, 50)}"`);
  }
  for (const field of document.body.querySelectorAll('input[placeholder], textarea[placeholder]')) {
    if (field.closest('[hidden]') || !field.checkVisibility({ checkVisibilityCSS: true })) continue;
    const size = parseFloat(getComputedStyle(field, '::placeholder').fontSize);
    if (size < 12) out.push(`${size}px placeholder "${field.getAttribute('placeholder').slice(0, 50)}"`);
  }
  return out;
}

function smallTargets() {
  const out = [];
  for (const el of document.querySelectorAll('a[href], button, input, select, textarea, summary, [role="button"]')) {
    if (el.closest('[hidden], dialog:not([open]), .g-skip')) continue;
    if (!el.checkVisibility({ checkVisibilityCSS: true })) continue;
    const box = el.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) continue;
    if (box.bottom < 0 || box.top > document.documentElement.scrollHeight) continue;
    if (el.tagName === 'A' && getComputedStyle(el).display === 'inline') {
      // A link inside a sentence is exempt; a link standing alone is a control.
      const own = (el.textContent || '').trim();
      const around = (el.parentElement.textContent || '').trim().replace(own, ' ');
      if (own.length >= 2 && around.split(/\s+/).filter((word) => /[A-Za-z0-9]{2,}/.test(word)).length >= 3) continue;
    }
    if (box.width < 44 || box.height < 44) {
      const name = (el.textContent || el.getAttribute('aria-label') || el.getAttribute('name') || '').replace(/\s+/g, ' ').trim();
      out.push(`${el.tagName.toLowerCase()} "${name.slice(0, 50)}"`);
    }
  }
  return out;
}

module.exports = { snapshot, compare, staleEntries, tally, shortfall, smallText, smallTargets };
