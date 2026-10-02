(function () {
  'use strict';
  var pressedButton=null;
  function releasePress(){if(pressedButton){pressedButton.removeAttribute('data-pressed');pressedButton=null;}}
  document.addEventListener('pointerdown',function(event){
    if(!event.isPrimary||event.button!==0)return;
    releasePress();
    var button=event.target.closest('.guest-shell .g-button,.guest-site .g-button,.guest-site .btn-brand,.guest-site .btn');
    if(button){pressedButton=button;button.setAttribute('data-pressed','true');}
  });
  document.addEventListener('pointerup',releasePress);
  document.addEventListener('pointercancel',releasePress);
  document.addEventListener('pointermove',function(event){if(pressedButton&&!pressedButton.contains(document.elementFromPoint(event.clientX,event.clientY)))releasePress();});
  window.addEventListener('blur',releasePress);
  var menu=document.querySelector('.g-menu-button'),menuPanel=document.getElementById('guest-menu');
  if(menu&&menuPanel){menu.addEventListener('click',function(){var open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu');menuPanel.hidden=!open;});document.addEventListener('keydown',function(event){if(event.key==='Escape'&&!menuPanel.hidden){menuPanel.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open menu');menu.focus();}});}
})();
