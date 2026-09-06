(function () {
  'use strict';
  var menu=document.querySelector('.g-menu-button'),menuPanel=document.getElementById('guest-menu');
  if(menu&&menuPanel){menu.addEventListener('click',function(){var open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu');menuPanel.hidden=!open;});document.addEventListener('keydown',function(event){if(event.key==='Escape'&&!menuPanel.hidden){menuPanel.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open menu');menu.focus();}});}
})();
