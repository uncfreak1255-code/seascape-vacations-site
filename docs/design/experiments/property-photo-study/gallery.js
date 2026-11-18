const mode = new URLSearchParams(location.search).get('view') === 'folio' ? 'folio' : 'book';
const stage = document.querySelector('#stage'), spread = document.querySelector('#spread');
const previous = document.querySelector('#previous'), next = document.querySelector('#next');
const status = document.querySelector('#load-status'), position = document.querySelector('#position');
const phone = matchMedia('(max-width:700px)'), reduced = matchMedia('(prefers-reduced-motion:reduce)');
let photos = [], index = 0, animation, motion = [];
document.body.classList.toggle('folio', mode === 'folio');
document.querySelector(`[data-view="${mode}"]`).setAttribute('aria-current','page');
if(mode === 'folio') {
 document.querySelector('#direction-number').textContent='DIRECTION 02';
 document.querySelector('#gallery-title').textContent='Give every room its moment.';
 document.querySelector('#note-label').textContent='THE PHOTOGRAPHIC FOLIO';
 document.querySelector('#note').textContent='One generous photograph, a hint of what comes next, and every room within reach.';
}
const pageSize = () => mode === 'book' && !phone.matches ? 2 : 1;
const caption = photo => photo.alt.replace('Dockside Dreams — ', '');
function image(photo) {
 const img = document.createElement('img'); img.src = photo.src; img.alt = photo.alt; img.width=photo.width; img.height=photo.height;
 img.addEventListener('error',()=>{ const parent=img.parentElement; if(!parent)return; parent.classList.add('missing'); const text=document.createElement('span'); text.textContent=`${caption(photo)} — photo unavailable`; parent.append(text); },{once:true});
 return img;
}
function page(photo, number) {
 const fig=document.createElement('figure');fig.className='page';
 if(!photo){
  fig.classList.add('endpaper');
  const name=document.createElement('p'),note=document.createElement('p');
  name.textContent='Dockside Dreams';note.textContent='End of photo collection';
  fig.append(name,note);return fig;
 }
 const button=document.createElement('button');button.className='photo-button';button.setAttribute('aria-label',`View ${caption(photo)} full size`);button.append(image(photo));button.addEventListener('click',()=>openPhoto(photo));
 const cap=document.createElement('figcaption'),label=document.createElement('span'),n=document.createElement('span');label.textContent=caption(photo);n.textContent=String(number+1).padStart(2,'0');cap.append(label,n);fig.append(button,cap);return fig;
}
function render() {
 const pages=photos.slice(index,index+pageSize()).map((p,n)=>page(p,index+n));
 if(pageSize()===2 && pages.length===1)pages.push(page(null));
 spread.replaceChildren(...pages);
 position.textContent=`${index+1}${pageSize()>1 && index+1<photos.length?'–'+Math.min(index+pageSize(),photos.length):''} / ${photos.length}`;
 previous.disabled=index===0;next.disabled=index+pageSize()>=photos.length;
 document.querySelectorAll('.thumbnails button').forEach((b,n)=>b.setAttribute('aria-current',String(n>=index && n<index+pageSize())));
}
// A sheet has two printed faces. Keep the outgoing resting page visible until
// its new counterpart physically lands over it; never flash the whole spread.
function finishMotion() {
 const active=motion;motion=[];animation=null;
 active.forEach(a=>a.cancel());
 spread.querySelectorAll('.turn-leaf,.turn-rest,.turn-shadow').forEach(n=>n.remove());
}
function decorative(className, content) {
 const node=document.createElement('div');node.className=className;
 node.setAttribute('aria-hidden','true');node.inert=true;
 if(content)node.append(content);
 return node;
}
function turnSheet(old, forward) {
 const single=phone.matches;
 const leaf=decorative('turn-leaf');
 const front=decorative('turn-face turn-front');
 const back=decorative('turn-face turn-back');
 const rest=decorative('turn-rest');
 let from=0,to=forward?-180:180;
 leaf.style.left=single?'0':forward?'50%':'0';
 leaf.style.transformOrigin=single||forward?'left center':'right center';
 if(single){
  leaf.classList.add('turn-single');rest.classList.add('turn-single');
  front.append(page(photos[forward?old:index],forward?old:index));
  back.append(page(null));
  if(!forward){from=-180;to=0;rest.append(page(photos[old],old));spread.append(rest);}
 }else{
  front.append(page(photos[old+(forward?1:0)],old+(forward?1:0)));
  back.append(page(photos[index+(forward?0:1)],index+(forward?0:1)));
  rest.style.left=forward?'0':'50%';
  rest.append(page(photos[old+(forward?0:1)],old+(forward?0:1)));
  spread.append(rest);
 }
 const frontShade=decorative('turn-shade'),backShade=decorative('turn-shade');
 front.append(frontShade);back.append(backShade);leaf.append(front,back);
 const shadow=decorative('turn-shadow');spread.append(shadow,leaf);
 // Deliberate photographic storytelling: longer than a utility-control response
 // so the full physical turn can be read. State and navigation update immediately.
 const timing={duration:700,easing:'cubic-bezier(.77,0,.175,1)',fill:'both'};
 const turning=leaf.animate([{transform:`rotateY(${from}deg)`},{transform:`rotateY(${to}deg)`}],timing);
 animation=turning;
 motion=[turning,
  frontShade.animate([{opacity:0},{opacity:.24},{opacity:0}],timing),
  backShade.animate([{opacity:.2},{opacity:.12},{opacity:0}],timing),
  shadow.animate([{opacity:0,transform:'scaleX(.25)'},{opacity:.2,transform:'scaleX(1)'},{opacity:0,transform:'scaleX(.4)'}],timing)];
 turning.onfinish=()=>{if(animation===turning)finishMotion();};
}
function move(target, animate=true) {
 if(!photos.length)return;
 finishMotion();
 const old=index;
 index=Math.max(0,Math.min(target,Math.floor((photos.length-1)/pageSize())*pageSize()));
 render();
 if(!animate || reduced.matches || old===index)return;
 if(mode==='book')turnSheet(old,index>old);
 else{
  animation=spread.animate([{opacity:.65,transform:`translateX(${index>old?10:-10}px)`},{opacity:1,transform:'translateX(0)'}],{duration:200,easing:'cubic-bezier(.23,1,.32,1)'});
  motion=[animation];
 }
}
previous.addEventListener('click',e=>move(index-pageSize(),e.detail!==0));next.addEventListener('click',e=>move(index+pageSize(),e.detail!==0));
stage.addEventListener('keydown',e=>{if(e.target!==stage)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(index+(e.key==='ArrowRight'?pageSize():-pageSize()),false);}});
phone.addEventListener('change',()=>move(Math.floor(index/pageSize())*pageSize(),false));
reduced.addEventListener('change',finishMotion);
const dialog=document.querySelector('dialog');
document.querySelector('#full-image').addEventListener('error',()=>{document.querySelector('#full-image').hidden=true;document.querySelector('#full-error').hidden=false;});
function openPhoto(photo){const img=document.querySelector('#full-image');img.hidden=false;document.querySelector('#full-error').hidden=true;img.src=photo.src;img.alt=photo.alt;document.querySelector('#full-caption').textContent=caption(photo);document.querySelector('#original').href=photo.src;dialog.showModal();}
document.querySelector('#close').addEventListener('click',()=>dialog.close());
fetch('/property.json').then(r=>{if(!r.ok)throw Error('Photo data unavailable');return r.json();}).then(data=>{
 photos=data.photography.photos;if(!photos.length)throw Error('No verified photographs are available.');
 const grid=document.querySelector('#photo-grid'),thumbs=document.querySelector('.thumbnails');
 photos.forEach((p,n)=>{const fig=document.createElement('figure'),a=document.createElement('a'),cap=document.createElement('figcaption');a.href=p.src;a.setAttribute('aria-label',`View ${caption(p)} full size`);a.append(image(p));a.addEventListener('click',e=>{e.preventDefault();openPhoto(p);});cap.textContent=caption(p);fig.append(a,cap);grid.append(fig);
 const b=document.createElement('button');b.setAttribute('aria-label',`Show photo ${n+1}: ${caption(p)}`);const img=image(p);img.alt='';b.append(img);b.addEventListener('click',e=>move(Math.floor(n/pageSize())*pageSize(),e.detail!==0));thumbs.append(b);});
 document.querySelector('.all-link').firstChild.textContent=`All ${photos.length} photos `;status.hidden=true;stage.hidden=false;document.querySelector('.controls').hidden=false;thumbs.hidden=false;render();
}).catch(()=>{status.textContent='Dockside Dreams photos are unavailable. Please reload, or use the current gallery.';});
