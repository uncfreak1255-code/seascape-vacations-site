(function () {
  'use strict';
  if (!document.body.classList.contains('guest-site')) return;
  var tracking = window.SeascapeConversionTracking;
  var parseTrip = tracking && tracking.readTripParams;
  var trip = parseTrip ? parseTrip(new URLSearchParams(location.search)) : {};
  var pageRoot = document.querySelector('[data-property-page]');
  var originalLinks = new Map();
  document.querySelectorAll('[data-trip-link]').forEach(function (link) { originalLinks.set(link, link.getAttribute('href')); });
  function label(value) { return new Intl.DateTimeFormat('en-US', {month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z')); }
  function summary() { return (trip.arrive ? label(trip.arrive)+' – '+label(trip.depart) : 'Flexible dates') + (trip.guests ? ' · '+(trip.guests === '17' ? 'more than 16' : trip.guests)+' guests' : ''); }
  function emit(name, extras) { if (tracking) tracking.trackEvent(name, Object.assign({page_slug:pageRoot ? pageRoot.dataset.propertyPage : 'home',placement:'guest_journey'},extras || {})); }
  function syncTrip() {
    originalLinks.forEach(function (href, link) {
      var url = new URL(href, location.href);
      ['arrive','depart','checkin','checkout','guests','area'].forEach(function(key){url.searchParams.delete(key);});
      if(trip.compare&&url.searchParams.has('compare')){var comparison=trip.compare.split(',');var currentHome=url.searchParams.get('compare');if(!comparison.includes(currentHome)&&comparison.length<3)comparison.push(currentHome);url.searchParams.set('compare',comparison.join(','));}
      Object.keys(trip).forEach(function (key) { if (key !== 'compare' || !url.searchParams.has('compare')) url.searchParams.set(key,trip[key]); });
      link.href = url.pathname+url.search+url.hash;
    });
    document.querySelectorAll('[data-trip-summary]').forEach(function (node) { node.textContent=summary(); });
    document.querySelectorAll('[data-mobile-trip]').forEach(function (node) { node.textContent=summary(); });
    var checkout=document.querySelector('[data-property-checkout]');
    var form=document.querySelector('form[data-booking-url]');
    if (checkout && form) {
      var url=new URL(form.dataset.bookingUrl);
      if (trip.arrive) {url.searchParams.set('start',trip.arrive);url.searchParams.set('end',trip.depart);}
      if (trip.guests) url.searchParams.set('numberOfGuests',trip.guests);
      var oversized=Number(trip.guests||0)>Number(form.dataset.maxGuests);
      var arrive=form.querySelector('.g-arrive'),depart=form.querySelector('.g-depart');
      var invalidDates=Boolean(arrive.value)!==Boolean(depart.value)||(arrive.value&&(depart.value<=arrive.value||arrive.value<arrive.min));
      checkout.hidden=oversized||invalidDates;
      if(oversized){checkout.removeAttribute('href');form.querySelector('.g-form-status').textContent='This home hosts up to '+form.dataset.maxGuests+' guests. Compare the collection or ask us about separate homes.';}
      else if(invalidDates){checkout.removeAttribute('href');form.querySelector('.g-form-status').textContent='Choose a departure after arrival, or clear both dates to stay flexible.';}
      else checkout.href=url.toString();
    }
    updateQuestion();
  }
  function updateQuestion() {
    var email=document.querySelector('[data-question-email]');
    var topic=document.getElementById('question-topic');
    if (!email || !topic || !pageRoot) return;
    var form=document.querySelector('form[data-property-name]');
    var cleanUrl=new URL(location.pathname,location.origin);
    Object.keys(trip).filter(function(key){return ['arrive','depart','guests'].includes(key);}).forEach(function(key){cleanUrl.searchParams.set(key,trip[key]);});
    var body='Hi Seascape,\n\nI’m considering '+form.dataset.propertyName+'.\n'+summary()+'.\n\nCould you help me confirm '+topic.value+'?\n\n'+cleanUrl.toString()+'\n\nMy question:\n';
    email.href='mailto:info@seascape-vacations.com?subject='+encodeURIComponent(form.dataset.propertyName+' — '+topic.value)+'&body='+encodeURIComponent(body);
  }
  var today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  document.querySelectorAll('[data-guest-trip-form]').forEach(function(form){
    var arrive=form.querySelector('.g-arrive'),depart=form.querySelector('.g-depart'),guests=form.querySelector('.g-guests'),status=form.querySelector('.g-form-status');
    arrive.min=today;depart.min=today;
    arrive.value=trip.arrive||'';depart.value=trip.depart||'';
    if(form.dataset.bookingUrl&&Number(trip.guests)>Number(form.dataset.maxGuests)){
      var oversizedOption=document.createElement('option');oversizedOption.value=trip.guests;oversizedOption.textContent=(trip.guests==='17'?'More than 16':trip.guests)+' guests — exceeds this home’s capacity';oversizedOption.disabled=true;guests.appendChild(oversizedOption);
    }
    guests.value=trip.guests||'';
    var raw=new URLSearchParams(location.search);
    if((raw.has('arrive')||raw.has('depart'))&&!trip.arrive)status.textContent='Those dates are incomplete, past or out of order. Choose new dates, or keep both blank.';
    function clearValidity(){depart.setCustomValidity('');depart.min=arrive.value||today;}
    arrive.addEventListener('input',clearValidity);depart.addEventListener('input',clearValidity);
    form.addEventListener('submit',function(event){
      event.preventDefault();clearValidity();
      if(Boolean(arrive.value)!==Boolean(depart.value)||(arrive.value&&depart.value<=arrive.value)){depart.setCustomValidity('Choose a departure after arrival, or clear both dates.');depart.reportValidity();return;}
      if(!form.reportValidity())return;
      var count=Number(guests.value||0),max=Number(form.dataset.maxGuests);
      if(form.dataset.bookingUrl&&count>max){status.textContent='This home hosts up to '+max+' guests. Compare the collection or ask us about separate homes.';emit('property_group_no_fit',{guest_count:count});return;}
      delete trip.arrive;delete trip.depart;delete trip.guests;
      if(arrive.value){trip.arrive=arrive.value;trip.depart=depart.value;}
      if(guests.value)trip.guests=guests.value;
      if(!form.dataset.bookingUrl){
        var target=new URL('/properties/',location.origin);Object.keys(trip).forEach(function(key){target.searchParams.set(key,trip[key]);});
        emit('homepage_search_submit',{guest_count:count,has_dates:Boolean(arrive.value)});location.assign(target.pathname+target.search);return;
      }
      var current=new URL(location.href);['arrive','depart','checkin','checkout','guests'].forEach(function(key){current.searchParams.delete(key);});Object.keys(trip).forEach(function(key){current.searchParams.set(key,trip[key]);});history.replaceState(null,'',current.pathname+current.search+current.hash);
      syncTrip();status.textContent='Opening availability and the full total for '+summary()+'.';document.querySelector('[data-property-checkout]').click();
    });
    // Keep valid trip edits with home links and prepared questions.
    form.addEventListener('change',function(){
      var query=new URLSearchParams();if(arrive.value)query.set('arrive',arrive.value);if(depart.value)query.set('depart',depart.value);if(guests.value)query.set('guests',guests.value);
      var next=parseTrip ? parseTrip(query) : {};
      ['arrive','depart','guests'].forEach(function(key){delete trip[key];if(next[key])trip[key]=next[key];});
      var current=new URL(location.href);['arrive','depart','checkin','checkout','guests'].forEach(function(key){current.searchParams.delete(key);});Object.keys(trip).forEach(function(key){current.searchParams.set(key,trip[key]);});history.replaceState(null,'',current.pathname+current.search+current.hash);
      syncTrip();
    });
  });
  var menu=document.querySelector('.g-menu-button'),menuPanel=document.getElementById('guest-menu');
  if(menu&&menuPanel){menu.addEventListener('click',function(){var open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu');menuPanel.hidden=!open;});document.addEventListener('keydown',function(event){if(event.key==='Escape'&&!menuPanel.hidden){menuPanel.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open menu');menu.focus();}});}
  function photoFailed(image){
    if(image.dataset.photoFailed)return;image.dataset.photoFailed='true';
    var notice=document.createElement('div');notice.className='g-photo-unavailable';notice.dataset.propertyPhoto=image.dataset.propertyPhoto;notice.dataset.photoFailed='true';notice.setAttribute('role','img');notice.setAttribute('aria-label',image.alt+' unavailable');notice.textContent='Photo unavailable. View this home’s photos on the booking page.';image.replaceWith(notice);
  }
  document.querySelectorAll('img[data-property-photo]').forEach(function(image){image.addEventListener('error',function(){photoFailed(image);});if(image.getAttribute('src')&&image.complete&&!image.naturalWidth)photoFailed(image);});
  // The collection preview is progressive: without JS these remain ordinary home links.
  var sceneRoot=document.querySelector('[data-home-scenes]');
  if(sceneRoot){
    var choices=Array.from(document.querySelectorAll('[data-scene-choice]'));
    var sceneStatus=document.querySelector('.g-scene-status');
    var sceneRequest=0;
    var reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
    async function chooseScene(choice){
      var request=++sceneRequest;
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
      if(photo&&photo.decode){try{await photo.decode();}catch(error){/* The shared photo handler provides a named unavailable state. */}}
      if(request!==sceneRequest)return;
      sceneRoot.querySelectorAll('[data-scene]').forEach(function(scene){scene.hidden=scene!==panel;});
      choices.forEach(function(item){var selected=item===choice;item.classList.toggle('is-active',selected);item.setAttribute('aria-pressed',String(selected));});
      sceneRoot.setAttribute('aria-busy','false');
      sceneStatus.textContent='Previewing '+name+'. '+panel.querySelector('.g-scene-caption p:last-child').textContent;
      if(!reducedMotion.matches&&panel.animate){
        var picture=panel.querySelector('.g-scene-photo');
        if(picture)picture.animate([{opacity:.45,transform:'scale(1.035)'},{opacity:1,transform:'scale(1)'}],{duration:650,easing:'cubic-bezier(.2,.7,.2,1)'});
        panel.querySelector('.g-scene-caption').animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:450,easing:'ease-out'});
      }
    }
    choices.forEach(function(choice,index){
      choice.setAttribute('role','button');
      choice.setAttribute('aria-pressed',String(choice.classList.contains('is-active')));
      choice.setAttribute('aria-label','Preview '+choice.querySelector('strong').textContent);
      choice.setAttribute('aria-controls','scene-'+choice.dataset.sceneChoice);
      choice.addEventListener('click',function(event){if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;event.preventDefault();chooseScene(choice);});
      choice.addEventListener('keydown',function(event){
        if(event.key===' '){event.preventDefault();chooseScene(choice);return;}
        var next=event.key==='ArrowRight'?(index+1)%choices.length:event.key==='ArrowLeft'?(index+choices.length-1)%choices.length:event.key==='Home'?0:event.key==='End'?choices.length-1:-1;
        if(next<0)return;
        event.preventDefault();choices[next].focus({preventScroll:true});
        // Scroll the horizontal selector only; never move the guest away from the scene.
        var rail=choice.parentElement;
        rail.scrollTo({left:choices[next].offsetLeft-rail.offsetLeft-14,behavior:reducedMotion.matches?'instant':'smooth'});
        chooseScene(choices[next]);
      });
    });
  }
  var gallery=document.querySelector('.g-photo-dialog'),openGallery=document.querySelector('[data-open-gallery]');
  if(gallery&&openGallery){openGallery.hidden=false;openGallery.addEventListener('click',function(){gallery.querySelectorAll('[data-gallery-src]').forEach(function(image){if(!image.src)image.src=image.dataset.gallerySrc;});gallery.showModal();});gallery.querySelector('[data-close-gallery]').addEventListener('click',function(){gallery.close();});}
  var sticky=document.querySelector('.g-mobile-booking'),booking=document.getElementById('booking');
  if(sticky&&booking&&'IntersectionObserver' in window){new IntersectionObserver(function(entries){sticky.hidden=entries[0].isIntersecting;},{threshold:.15}).observe(booking);}
  var topic=document.getElementById('question-topic');if(topic)topic.addEventListener('change',updateQuestion);
  var question=document.querySelector('[data-question-email]');if(question)question.addEventListener('click',function(){emit('property_question_prepare',{topic:topic.value});});
  if(!document.querySelector('[data-catalog-version]'))syncTrip();
})();
