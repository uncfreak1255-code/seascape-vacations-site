(function () {
  'use strict';
  var pressedButton=null;
  function releasePress(){if(pressedButton){pressedButton.removeAttribute('data-pressed');pressedButton=null;}}
  document.addEventListener('pointerdown',function(event){
    if(!event.isPrimary||event.button!==0)return;
    releasePress();
    var button=event.target.closest('.guest-shell .g-button,.guest-site .g-button,.guest-site .btn-brand,.guest-site .btn,.guest-site .catalog-filter,.guest-site .catalog-compare-toggle');
    if(button){pressedButton=button;button.setAttribute('data-pressed','true');}
  });
  document.addEventListener('pointerup',releasePress);
  document.addEventListener('pointercancel',releasePress);
  document.addEventListener('pointermove',function(event){if(pressedButton&&!pressedButton.contains(document.elementFromPoint(event.clientX,event.clientY)))releasePress();});
  window.addEventListener('blur',releasePress);
  var menu=document.querySelector('.g-menu-button'),menuPanel=document.getElementById('guest-menu'),menuCloseTimer=null;
  function overlayOutMs(){var raw=getComputedStyle(menuPanel).getPropertyValue('--g-overlay-out').trim();var value=parseFloat(raw);return !value||window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:raw.indexOf('ms')>=0?value:value*1000;}
  function clearMenuTimer(){if(menuCloseTimer){clearTimeout(menuCloseTimer);menuCloseTimer=null;}}
  function setMenuOpen(open){menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu');}
  function closeMenu(instant){clearMenuTimer();setMenuOpen(false);menuPanel.classList.remove('is-open');if(instant){menuPanel.hidden=true;return;}menuCloseTimer=setTimeout(function(){menuPanel.hidden=true;menuCloseTimer=null;},overlayOutMs());}
  function openMenu(){clearMenuTimer();menuPanel.hidden=false;setMenuOpen(true);requestAnimationFrame(function(){requestAnimationFrame(function(){menuPanel.classList.add('is-open');});});}
  if(menu&&menuPanel){menu.addEventListener('click',function(){if(menu.getAttribute('aria-expanded')==='true')closeMenu(false);else openMenu();});document.addEventListener('keydown',function(event){if(event.key==='Escape'&&!menuPanel.hidden){closeMenu(true);menu.focus();}});}
})();
