// Installed only with the desktop booklet's successfully loaded stylesheet/module.
export function installContactSheet(desktop) {
 const dialog=document.querySelector('.g-photo-dialog'), opener=document.querySelector('[data-open-gallery]');
 const grid=dialog.querySelector('.g-photo-grid'), close=dialog.querySelector('[data-close-gallery]');
 const photos=[...grid.querySelectorAll('img')].map(img=>({src:img.dataset.gallerySrc,alt:img.alt,label:img.alt.replace(/^.*? — /,'')}));
 const pane=document.createElement('section');pane.className='contact-pane';pane.hidden=true;pane.setAttribute('aria-label','Contact sheet viewer');
 pane.innerHTML='<div class="contact-overview"><div class="contact-lead"><h3>All photos</h3><span></span></div><div class="contact-sheet" role="group" aria-label="All photo thumbnails"></div></div><div class="contact-detail" hidden><button type="button" class="contact-back">← All photos</button><div class="contact-stage"><button type="button" data-step="-1" aria-label="Previous photo">←</button><figure><div class="contact-photo"><img alt="" decoding="async"><p hidden>Photo unavailable</p></div><figcaption aria-live="polite" aria-atomic="true"><span data-label></span><span data-photo-count></span></figcaption></figure><button type="button" data-step="1" aria-label="Next photo">→</button></div></div>';
 const overview=pane.querySelector('.contact-overview'), detail=pane.querySelector('.contact-detail'),sheet=pane.querySelector('.contact-sheet'),back=pane.querySelector('.contact-back'),image=pane.querySelector('.contact-photo img'),unavailable=pane.querySelector('.contact-photo p');
 const steps=[...pane.querySelectorAll('[data-step]')];
 pane.querySelector('.contact-lead span').textContent=`${photos.length} photographs`;
 let index=0, detailOpen=false, lastOpener=null, built=false;
 let pendingPhoto;
 const number=n=>String(n+1).padStart(2,'0');
 function buildSheet(){
  if(built)return;built=true;
  photos.forEach((photo,n)=>{
   const name=`Photo ${n+1} of ${photos.length}: ${photo.label}`;
   const tile=document.createElement('button');tile.type='button';tile.className='contact-tile';tile.dataset.photo=String(n);tile.setAttribute('aria-label',name);
   const thumb=document.createElement('img');thumb.alt=photo.alt;thumb.src=photo.src.replace(/\.webp$/, '-800.webp');thumb.loading='lazy';thumb.decoding='async';
   thumb.addEventListener('error',()=>{
    const missing=document.createElement('span');
    missing.className='contact-thumb-unavailable';
    missing.textContent='Thumbnail unavailable';
    tile.setAttribute('aria-label',`${name}. ${missing.textContent}`);
    thumb.replaceWith(missing);
   },{once:true});
   const row=document.createElement('span'),count=document.createElement('b');row.className='contact-caption';row.textContent=photo.label;count.textContent=number(n);row.append(count);tile.append(thumb,row);
   tile.addEventListener('click',()=>{index=n;detailOpen=true;render();dialog.scrollTop=0;back.focus({preventScroll:true});});sheet.append(tile);
  });
 }
 function render(){
  const active=desktop.matches && dialog.open;
  pane.hidden=!active;grid.hidden=active;dialog.classList.toggle('has-contact-sheet',active);
  if(!active)return;
  overview.hidden=detailOpen;detail.hidden=!detailOpen;
  if(!detailOpen){buildSheet();return;}
  const photo=photos[index];
  if(image.dataset.index!==String(index)){
   // The browser may keep painting the previous source while the new one loads.
   image.hidden=true;
   unavailable.hidden=true;
   image.alt=photo.alt;
   image.src=photo.src;
   image.dataset.index=String(index);
   const decoded=image.decode();
   pendingPhoto=decoded;
   decoded.then(
    ()=>{if(pendingPhoto===decoded)image.hidden=false;},
    ()=>{if(pendingPhoto===decoded)unavailable.hidden=false;}
   );
  }
  pane.querySelector('[data-label]').textContent=photo.label;pane.querySelector('[data-photo-count]').textContent=`${number(index)} / ${photos.length}`;
  steps[0].disabled=index===0;steps[1].disabled=index===photos.length-1;
 }
 function move(delta,trigger){
  index=Math.max(0,Math.min(photos.length-1,index+delta));render();
  if(trigger?.disabled)steps.find(button=>!button.disabled)?.focus({preventScroll:true});
 }
 function open(n,trigger){
  if(!desktop.matches)return false;
  index=n??0;detailOpen=n!=null;lastOpener=trigger||opener;
  dialog.showModal();render();dialog.scrollTop=0;close.focus({preventScroll:true});return true;
 }
 opener.addEventListener('click',event=>{
  if(!desktop.matches)return;
  event.preventDefault();event.stopImmediatePropagation();open(null,opener);
 },true);
 back.addEventListener('click',()=>{detailOpen=false;render();sheet.children[index].focus();});
 steps.forEach(button=>button.addEventListener('click',()=>move(Number(button.dataset.step),button)));
 dialog.addEventListener('keydown',event=>{
  if(!desktop.matches||!['ArrowRight','ArrowLeft'].includes(event.key)||event.altKey||event.ctrlKey||event.metaKey)return;
  const delta=event.key==='ArrowRight'?1:-1;
  if(!detailOpen){const tile=event.target.closest('[data-photo]');if(!tile)return;event.preventDefault();sheet.children[Math.max(0,Math.min(photos.length-1,Number(tile.dataset.photo)+delta))].focus();return;}
  event.preventDefault();move(delta,event.target);
 });
 dialog.addEventListener('close',()=>{render();if(lastOpener){const target=lastOpener.isConnected&&!lastOpener.closest('[hidden]')?lastOpener:opener;target.focus({preventScroll:true});}lastOpener=null;});
 desktop.addEventListener('change',()=>{
  if(!dialog.open)return;
  detailOpen=false;render();
  if(!desktop.matches)grid.querySelectorAll('[data-gallery-src]').forEach(img=>{if(!img.getAttribute('src'))img.src=img.dataset.gallerySrc;});
  close.focus({preventScroll:true});
 });
 grid.after(pane);
 if(dialog.open){
  lastOpener=opener;
  render();
 }
 return {open};
}
