// Shared by the photo lightbox's two node tests: the macro rendered with the sample rooms, and a
// small DOM over that output, enough to run the real script against it with no browser.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const partialEnv = require('../design/design-sync/partial-env');
const photoLightboxSample = require('../design/design-sync/photo-lightbox-sample');
const lightbox = require('../../src/assets/js/photo-lightbox.js');

const root = path.resolve(__dirname, '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const env = partialEnv();
const sample = photoLightboxSample(read);
const render = (data) => env.renderString('{% import "partials/photo-lightbox.njk" as plb %}{{ plb.photoLightbox(id, title, rooms, eyebrow) }}', data).trim();
const shot = (n, extra = {}) => ({ src: `/p/${n}.webp`, alt: `Alt ${n}`, label: `Label ${n}`, ...extra });

// Tag and [attribute] selectors only.
const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };
const decode = (text) => text.replace(/&(?:amp|lt|gt|quot|#39);/g, (entity) => ENTITIES[entity]);
class Node {
  constructor(tag, attrs = {}) { Object.assign(this, { tag, attrs, children: [], parent: null, listeners: {}, text: '' }); }
  getAttribute(name) { return name in this.attrs ? this.attrs[name] : null; }
  setAttribute(name, value) { this.attrs[name] = String(value); }
  removeAttribute(name) { delete this.attrs[name]; }
  get hidden() { return 'hidden' in this.attrs; }
  set hidden(on) { if (on) this.attrs.hidden = ''; else delete this.attrs.hidden; }
  get textContent() { return this.tag === '#text' ? this.text : this.children.map((child) => child.textContent).join(''); }
  set textContent(value) { const text = new Node('#text'); text.text = String(value); text.parent = this; this.children = [text]; }
  matches(selector) { const attr = selector.match(/^\[([a-z-]+)\]$/); return attr ? attr[1] in this.attrs : this.tag === selector; }
  closest(selector) { for (let node = this; node; node = node.parent) if (node.tag !== '#text' && node.matches(selector)) return node; return null; }
  querySelectorAll(selector) { return this.children.flatMap((child) => (child.tag === '#text' ? [] : [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)])); }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  getElementById(id) { return this.querySelectorAll('[id]').find((node) => node.attrs.id === id) || null; }
  addEventListener(type, handler) { (this.listeners[type] ||= []).push(handler); }
  // Bubbles like a real event; returns whether a listener called preventDefault().
  fire(type, init = {}) {
    let prevented = false;
    const event = { target: this, button: 0, ...init, preventDefault() { prevented = true; } };
    for (let node = this; node; node = node.parent) for (const handler of node.listeners[type] || []) handler(event);
    return prevented;
  }
}
function parse(html) {
  const doc = new Node('#document');
  let at = doc;
  for (const [, close, open, attrs, text] of html.matchAll(/<\/([a-z0-9]+)>|<([a-z0-9]+)((?:\s+[a-zA-Z-]+(?:="[^"]*")?)*)\s*>|([^<]+)/g)) {
    if (close) { assert.equal(at.tag, close, `unbalanced </${close}>`); at = at.parent; continue; }
    const node = new Node(open || '#text', Object.fromEntries([...(attrs || '').matchAll(/([a-zA-Z-]+)(?:="([^"]*)")?/g)].map(([, name, value]) => [name, decode(value || '')])));
    if (!open) node.text = decode(text);
    node.parent = at;
    at.children.push(node);
    if (open && open !== 'img') at = node;
  }
  assert.equal(at, doc, 'unclosed element');
  return doc;
}

// A page holding the sample lightbox and its opener, with the script started. `layout.wide` says
// whether the stage is laid out; `view` is the window, which hears `resize`.
function page({ wide, data = sample, modal = true } = {}) {
  const doc = parse(`<button type="button" data-plb-open="${data.id}" hidden>All photos</button>${render(data)}`);
  const dialog = doc.getElementById(data.id);
  const calls = [];
  const layout = { wide };
  const view = new Node('#window');
  doc.defaultView = view;
  if (dialog) dialog.ownerDocument = doc;
  if (dialog && modal) dialog.showModal = () => { calls.push('showModal'); dialog.open = true; };
  if (dialog) dialog.show = () => calls.push('show');
  const at = (selector) => doc.querySelector(selector);
  if (dialog) at('[data-plb-stage]').getClientRects = () => (layout.wide ? [{}] : []);
  lightbox.start(doc);
  const all = (selector) => doc.querySelectorAll(selector);
  return {
    doc, dialog, calls, at, all, layout, view, opener: at('[data-plb-open]'),
    pressed: () => all('[data-plb-room]').map((room) => room.attrs['aria-pressed']).join(','),
    hidden: () => all('[data-plb-panel]').map((panel) => panel.hidden).join(','),
    current: () => all('[data-plb-photo]').filter((photo) => 'aria-current' in photo.attrs).map((photo) => photo.attrs['data-plb-label']),
    stage: () => ({ href: at('[data-plb-stage]').querySelector('a').attrs.href, image: at('[data-plb-stage]').querySelector('img').attrs, label: at('[data-plb-stage-label]').textContent, position: at('[data-plb-stage-position]').textContent }),
  };
}

module.exports = { read, sample, render, shot, parse, page, lightbox };
