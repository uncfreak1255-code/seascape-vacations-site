'use strict';

// The preview is an ordinary page, not an editor. Each complete built page
// runs inside a sandbox on a distinct localhost origin. Local hashes work;
// outbound links, analytics and real transactions do not belong in a review.
const guard = `<meta name="robots" content="noindex,nofollow"><script>
const keepPreviewHref = a => { const h=a.getAttribute('href'); if(h && !h.startsWith('#')) { a.removeAttribute('href'); a.setAttribute('aria-disabled','true'); } };
const guardPreviewLinks = root => { if(root.matches?.('a[href]')) keepPreviewHref(root); root.querySelectorAll?.('a[href]').forEach(keepPreviewHref); };
new MutationObserver(records => records.forEach(r => { if(r.type==='attributes') guardPreviewLinks(r.target); else r.addedNodes.forEach(guardPreviewLinks); })).observe(document,{subtree:true,childList:true,attributes:true,attributeFilter:['href']});
for(const type of ['click','auxclick']) addEventListener(type,e=>{ const a=e.target.closest?.('a'); if(a?.getAttribute('aria-disabled')==='true'||(a && !a.getAttribute('href')?.startsWith('#'))) {e.preventDefault();e.stopImmediatePropagation();} },true);
addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();},true);
</script>`;
function protectPage(html) {
  const result = html.replace(/<head(?:\s[^>]*)?>/i, tag => tag + guard);
  if (result === html) throw new Error('Preview requires a built HTML page with a head.');
  return result;
}

const style = `*{box-sizing:border-box}body{margin:0;background:#eeeae0;color:#173d42;font:500 14px/1.4 system-ui,sans-serif;min-height:100dvh;display:flex;flex-direction:column}.review{position:sticky;top:0;z-index:2;color:#f6f3eb;background:#173d42;border-bottom:1px solid #527074;padding:10px clamp(12px,3vw,38px);display:flex;align-items:center;gap:10px 20px;flex-wrap:wrap}.brand{margin-right:auto}.brand p{color:#d6eb85;font-size:10px;font-weight:700;letter-spacing:.14em;margin:0}.brand h1{margin:2px 0 0;font-size:16px}.switch{display:flex;gap:4px;background:#24494d;border-radius:8px;padding:3px}button,select{font:inherit;min-height:44px;padding:6px 11px;border:1px solid #587376;border-radius:5px;background:#24494d;color:#fff;cursor:pointer}button[aria-pressed=true]{background:#d6eb85;border-color:#d6eb85;color:#173d42}button:hover,select:hover{border-color:#d6eb85}:focus-visible{outline:2px solid #d6eb85;outline-offset:2px}#status{flex-basis:100%;font-size:12px;color:#dde8e0;margin:0}.stage{flex:1;display:grid;justify-items:center;min-height:0}.stage iframe{display:block;width:100%;background:white;border:0;min-height:580px;height:100%}.stage.phone iframe{width:min(390px,100%);box-shadow:0 0 0 1px #b9c4bc}label{display:flex;gap:6px;align-items:center}#revision{font-variant-numeric:tabular-nums}#decision{max-width:100%}`;

function client(config) {
  const $ = id => document.getElementById(id);
  const value = new URLSearchParams(location.search);
  let route = config.routes.includes(value.get('page')) ? value.get('page') : config.routes[0];
  let variant = config.variants.some(v => v.id === value.get('view')) ? value.get('view') : 'current';
  let phone = value.get('size') === 'phone';
  const buttons = new Map();
  $('title').textContent = config.title;
  for (const r of config.routes) $('page').add(new Option(r, r, false, r === route));
  $('page').closest('label').hidden = config.routes.length === 1;
  for (const v of config.variants) {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = v.label;
    button.addEventListener('click', () => { if (variant !== v.id) { variant = v.id; draw(true); } });
    $('variants').append(button); buttons.set(v.id, button);
  }
  function draw(reload) {
    const v = config.variants.find(item => item.id === variant);
    for (const [id, button] of buttons) button.setAttribute('aria-pressed', String(variant === id));
    $('phone').setAttribute('aria-pressed', String(phone));
    $('stage').classList.toggle('phone', phone);
    $('revision').textContent = `${v.label} · ${v.revision}`;
    const next = new URLSearchParams({ page: route, view: v.id, size: phone ? 'phone' : 'desktop' });
    history.replaceState(null, '', '?' + next);
    const frame = $('frame');
    if (reload) { frame.title = `${v.label}: ${route}`; frame.src = v.origin + route; }
  }
  $('page').addEventListener('change', e => { route = e.target.value; draw(true); });
  $('phone').addEventListener('click', () => { phone = !phone; draw(false); });
  $('reload').addEventListener('click', () => draw(true));
  draw(true);
}

function reviewPage(config, origins) {
  const state = { title: config.title, routes: config.routes, variants: config.variants.map(({ id, label, revision }, i) => ({ id, label, revision, origin: origins[i] })) };
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Seascape private design review</title><style>${style}</style></head><body><header class="review"><div class="brand"><p>SEASCAPE / PRIVATE DESIGN REVIEW</p><h1 id="title"></h1></div><div id="variants" class="switch" role="group" aria-label="Preview version"></div><label>Page <select id="page"></select></label><button id="phone" type="button">390px preview</button><button id="reload" type="button">Reload version</button><p id="status"><span id="revision" role="status"></span> · Forms and external links disabled</p></header><main id="stage" class="stage"><iframe id="frame" title="Design preview" sandbox="allow-scripts allow-same-origin"></iframe></main><script>(${client.toString()})(${JSON.stringify(state).replace(/</g, '\\u003c')});</script></body></html>`;
}
module.exports = { reviewPage, protectPage };
