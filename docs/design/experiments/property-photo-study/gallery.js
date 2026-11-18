const mode = new URLSearchParams(location.search).get('view') === 'folio' ? 'folio' : 'book';
const stage = document.querySelector('#stage'), spread = document.querySelector('#spread');
const previous = document.querySelector('#previous'), next = document.querySelector('#next');
const status = document.querySelector('#load-status'), position = document.querySelector('#position');
const phone = matchMedia('(max-width:700px)'), reduced = matchMedia('(prefers-reduced-motion:reduce)');
let photos = [], index = 0, animation;
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
 const button=document.createElement('button');button.className='photo-button';button.setAttribute('aria-label',`View ${caption(photo)} full size`);button.append(image(photo));button.addEventListener('click',()=>openPhoto(photo));
 const cap=document.createElement('figcaption'),label=document.createElement('span'),n=document.createElement('span');label.textContent=caption(photo);n.textContent=String(number+1).padStart(2,'0');cap.append(label,n);fig.append(button,cap);return fig;
}
function render() {
 spread.replaceChildren(...photos.slice(index,index+pageSize()).map((p,n)=>page(p,index+n)));
 position.textContent=`${index+1}${pageSize()>1 && index+1<photos.length?'–'+Math.min(index+pageSize(),photos.length):''} / ${photos.length}`;
 previous.disabled=index===0;next.disabled=index+pageSize()>=photos.length;
 document.querySelectorAll('.thumbnails button').forEach((b,n)=>b.setAttribute('aria-current',String(n>=index && n<index+pageSize())));
}
function move(target, animate=true) {
 animation?.cancel();document.querySelectorAll('.turn-leaf').forEach(n=>n.remove());
 const old=index;index=Math.max(0,Math.min(target,Math.floor((photos.length-1)/pageSize())*pageSize()));
 const leafPhoto=photos[old+(index>old?Math.min(pageSize()-1,photos.length-1-old):0)];render();
 if(!animate || reduced.matches || old===index)return;
 if(mode==='book' && !phone.matches) {
  const leaf=document.createElement('div');leaf.className='turn-leaf';leaf.setAttribute('aria-hidden','true');leaf.inert=true;leaf.style.left=index>old?'50%':'0';leaf.style.transformOrigin=index>old?'left center':'right center';leaf.append(page(leafPhoto,old+(index>old?1:0)));spread.append(leaf);
  animation=leaf.animate([{transform:'rotateY(0deg)'},{transform:`rotateY(${index>old?-105:105}deg)`}],{duration:200,easing:'cubic-bezier(.23,1,.32,1)'});animation.onfinish=()=>leaf.remove();animation.oncancel=()=>leaf.remove();
 } else {animation=spread.animate([{opacity:.65,transform:`translateX(${index>old?10:-10}px)`},{opacity:1,transform:'translateX(0)'}],{duration:200,easing:'cubic-bezier(.23,1,.32,1)'});}
}
previous.addEventListener('click',e=>move(index-pageSize(),e.detail!==0));next.addEventListener('click',e=>move(index+pageSize(),e.detail!==0));
stage.addEventListener('keydown',e=>{if(e.target!==stage)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(index+(e.key==='ArrowRight'?pageSize():-pageSize()),false);}});
phone.addEventListener('change',()=>move(Math.floor(index/pageSize())*pageSize(),false));
reduced.addEventListener('change',()=>{animation?.cancel();document.querySelectorAll('.turn-leaf').forEach(n=>n.remove());});
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
