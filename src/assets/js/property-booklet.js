import {installContactSheet} from './property-contact-sheet.js';
// Progressive desktop enhancement of the server-rendered photo gallery.
const frame=document.querySelector('[data-booklet-gallery]');
if(frame) installBooklet(frame);
function installBooklet(frame) {
 const desktop=matchMedia('(min-width:900px)'), reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const original=frame.querySelector('.g-gallery');
 const photos=[...original.querySelectorAll('.g-gallery-photo')].map(a=>{const i=a.querySelector('img');return {src:i.getAttribute('src')||i.dataset.src,srcset:i.getAttribute('srcset')||i.dataset.srcset,alt:i.alt,width:Number(i.getAttribute('width')),height:Number(i.getAttribute('height'))};});
 if(photos.length<2)return;
 const book=document.createElement('section');book.className='inpage-book';book.setAttribute('aria-label',original.getAttribute('aria-label'));
 book.innerHTML='<div class="book-top"><span>Explore the home</span></div><div class="stage" role="region" tabindex="0" aria-label="Photo booklet. Use left and right arrow keys."><div class="spread"></div></div><div class="controls"><button type="button" data-previous>← Previous</button><p role="status" aria-live="polite"></p><button type="button" data-next>Next →</button></div><div class="thumbnails" role="group" aria-label="Choose a photo"></div>';
 const stage=book.querySelector('.stage'),spread=book.querySelector('.spread'),previous=book.querySelector('[data-previous]'),next=book.querySelector('[data-next]'),position=book.querySelector('[role=status]'),thumbs=book.querySelector('.thumbnails');
 let index=0,animation,motion=[];
 const pageSize=()=>2,caption=photo=>photo.alt.replace(/^.*? — /,'');
 const viewer=installContactSheet(desktop);
 function openPhoto(photo,trigger){viewer.open(photos.indexOf(photo),trigger);}

function image(photo) {
 const img = document.createElement('img'); img.srcset = photo.srcset; img.sizes = '(min-width:1400px) 560px, calc((100vw - 104px)/2)'; img.src = photo.src; img.loading='eager'; img.decoding='async'; img.alt = photo.alt; img.width=photo.width; img.height=photo.height;
 img.addEventListener('error',()=>{ const parent=img.parentElement; if(!parent)return; parent.classList.add('missing'); const text=document.createElement('span'); text.textContent=`${caption(photo)} — photo unavailable`; parent.append(text); },{once:true});
 return img;
}
function page(photo, number) {
 const fig=document.createElement('figure');fig.className='page';
 if(!photo){
  fig.classList.add('endpaper');
  const name=document.createElement('p'),note=document.createElement('p');
  name.textContent=document.querySelector('.g-property-heading h1').textContent;note.textContent='End of photo collection';
  fig.append(name,note);return fig;
 }
 const button=document.createElement('button');button.className='photo-button';button.setAttribute('aria-label',`View ${caption(photo)} full size`);button.append(image(photo));button.addEventListener('click',()=>openPhoto(photo,button));
 const cap=document.createElement('figcaption'),label=document.createElement('span'),n=document.createElement('span');label.textContent=caption(photo);n.textContent=String(number+1).padStart(2,'0');cap.append(label,n);fig.append(button,cap);return fig;
}
function render() {
 const pages=photos.slice(index,index+pageSize()).map((p,n)=>page(p,index+n));
 if(pageSize()===2 && pages.length===1)pages.push(page(null));
 spread.replaceChildren(...pages);
 position.textContent=`${index+1}${pageSize()>1 && index+1<photos.length?'–'+Math.min(index+pageSize(),photos.length):''} / ${photos.length}`;
 previous.disabled=index===0;next.disabled=index+pageSize()>=photos.length;
 thumbs.querySelectorAll('button').forEach((b,n)=>b.setAttribute('aria-current',String(n>=index && n<index+pageSize())));
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
 const leaf=decorative('turn-leaf');
 const front=decorative('turn-face turn-front');
 const back=decorative('turn-face turn-back');
 const rest=decorative('turn-rest');
 let from=0,to=forward?-180:180;
 leaf.style.left=forward?'50%':'0';
 leaf.style.transformOrigin=forward?'left center':'right center';
 front.append(page(photos[old+(forward?1:0)],old+(forward?1:0)));
 back.append(page(photos[index+(forward?0:1)],index+(forward?0:1)));
 rest.style.left=forward?'0':'50%';rest.append(page(photos[old+(forward?0:1)],old+(forward?0:1)));spread.append(rest);
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
 turnSheet(old,index>old);

}

 previous.addEventListener('click',e=>move(index-2,e.detail!==0));next.addEventListener('click',e=>move(index+2,e.detail!==0));
 stage.addEventListener('keydown',e=>{if(e.target!==stage)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(index+(e.key==='ArrowRight'?2:-2),false);}});
 reduced.addEventListener('change',finishMotion);
 // Small derivatives keep the complete selector strip inexpensive.
 photos.forEach((p,n)=>{const b=document.createElement('button');b.type='button';b.textContent=String(n+1);const thumbnail=document.createElement('img');thumbnail.alt='';thumbnail.src=p.src.replace(/(?:-800)?\.webp$/, '-160.webp');thumbnail.width=80;thumbnail.height=54;thumbnail.loading='lazy';thumbnail.addEventListener('error',()=>thumbnail.remove(),{once:true});b.append(thumbnail);b.setAttribute('aria-label','Show photo '+(n+1)+': '+p.alt);b.addEventListener('click',e=>move(Math.floor(n/2)*2,e.detail!==0));thumbs.append(b);});
 function sync(){finishMotion();book.hidden=!desktop.matches;original.hidden=desktop.matches;frame.classList.toggle('has-booklet',desktop.matches);if(desktop.matches)render();else{original.scrollLeft=0;}}
 frame.insertBefore(book,original);desktop.addEventListener('change',sync);sync();
}
