(function(){
'use strict';
  // The collection preview is progressive: without JS these remain ordinary home links.
  var sceneRoot=document.querySelector('[data-home-scenes]');
  if(sceneRoot){
    var choices=Array.from(document.querySelectorAll('[data-scene-choice]'));
    var sceneStatus=document.querySelector('.g-scene-status');
    var sceneRequest=0;
    var requestedIndex=0;
    var reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
    async function chooseScene(choice,animateScene){
      var request=++sceneRequest;
      requestedIndex=choices.indexOf(choice);
      var focusedStep=document.activeElement&&document.activeElement.dataset.sceneStep;
      var slug=choice.dataset.sceneChoice;
      var panel=document.getElementById('scene-'+slug);
      if(!panel)return;
      var photo=panel.querySelector('img[data-scene-src]');
      var name=choice.querySelector('strong').textContent;
      sceneRoot.setAttribute('aria-busy','true');
      if(photo&&!photo.getAttribute('src')){
        sceneStatus.textContent='Loading '+name+'…';
        photo.srcset=photo.dataset.sceneSrcset;
        photo.src=photo.dataset.sceneSrc;
      }
      if(animateScene&&photo&&photo.decode){try{await photo.decode();}catch(error){/* The shared photo handler provides a named unavailable state. */}}
      if(request!==sceneRequest)return;
      sceneRoot.querySelectorAll('[data-scene]').forEach(function(scene){scene.hidden=scene!==panel;});
      choices.forEach(function(item){var selected=item===choice;item.classList.toggle('is-active',selected);item.setAttribute('aria-pressed',String(selected));});
      sceneRoot.setAttribute('aria-busy','false');
      if(focusedStep)panel.querySelector('[data-scene-step="'+focusedStep+'"]').focus({preventScroll:true});
      sceneStatus.textContent='Previewing '+name+'. Home '+(requestedIndex+1)+' of '+choices.length+'. '+panel.querySelector('.g-scene-caption p:last-child').textContent;
      if(panel.getAnimations)panel.getAnimations({subtree:true}).forEach(function(animation){animation.cancel();});
      if(animateScene&&!reducedMotion.matches&&panel.animate){
        var picture=panel.querySelector('.g-scene-photo');
        if(picture)picture.animate([{opacity:.45,transform:'scale(1.035)'},{opacity:1,transform:'scale(1)'}],{duration:650,easing:'cubic-bezier(.2,.7,.2,1)'});
        panel.querySelector('.g-scene-caption').animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:450,easing:'ease-out'});
      }
    }
    sceneRoot.querySelectorAll('[data-scene-step]').forEach(function(button){
      button.addEventListener('click',function(event){
        chooseScene(choices[(requestedIndex+Number(button.dataset.sceneStep)+choices.length)%choices.length],event.detail>0);
      });
      button.addEventListener('keydown',function(event){
        var next=event.key==='Home'?0:event.key==='End'?choices.length-1:event.key==='ArrowRight'?(requestedIndex+1)%choices.length:event.key==='ArrowLeft'?(requestedIndex+choices.length-1)%choices.length:-1;
        if(next<0)return;
        event.preventDefault();chooseScene(choices[next],false);
      });
    });
    sceneRoot.querySelectorAll('.g-scene-controls').forEach(function(controls){controls.hidden=false;});
    document.querySelector('.g-scene-picker').hidden=true;
  }
})();
