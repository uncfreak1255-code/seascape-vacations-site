(function () {
  'use strict';
  if (!document.body.classList.contains('guest-site')) return;
  var tracking = window.SeascapeConversionTracking;
  if (tracking) document.querySelectorAll('[data-email-capture-root]').forEach(function (root) {
    var form = root.querySelector('[data-guest-email-form]');
    if (form) form.hidden = false;
    var fallback = root.querySelector('[data-email-capture-unavailable]');
    if (fallback) fallback.hidden = true;
  });
  // Homepage leave-the-page signup: desktop only, once a week, never after a signup.
  var exitSignup = document.querySelector('[data-home-exit-signup]');
  if (exitSignup && tracking && typeof exitSignup.showModal === 'function' && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var exitKey = 'seascape_email_popup_shown';
    var exitRecentlyShown = function () {
      try {
        var shown = localStorage.getItem(exitKey);
        if (!shown) return false;
        return shown === 'subscribed' || (Date.now() - parseInt(shown, 10)) / 864e5 < 7;
      } catch (error) {
        return true;
      }
    };
    var onPageLeave = function (event) {
      if (event.relatedTarget || event.clientY > 0) return;
      document.removeEventListener('mouseout', onPageLeave);
      if (exitRecentlyShown()) return;
      try { localStorage.setItem(exitKey, String(Date.now())); } catch (error) { return; }
      exitSignup.showModal();
    };
    document.addEventListener('mouseout', onPageLeave);
    exitSignup.querySelector('[data-home-exit-close]').addEventListener('click', function () { exitSignup.close(); });
    exitSignup.addEventListener('click', function (event) { if (event.target === exitSignup) exitSignup.close(); });
  }
  var parseTrip = tracking && tracking.readTripParams;
  var trip = parseTrip ? parseTrip(new URLSearchParams(location.search)) : {};
  function rememberTrip(){if(tracking&&tracking.rememberTrip)tracking.rememberTrip(trip);}
  var pageRoot = document.querySelector('[data-property-page]');
  var originalLinks = new Map();
  function preserveSave50Params(url) {
    var params=new URLSearchParams(location.search);
    var campaign=(params.get('utm_campaign')||'').trim().toLowerCase();
    var promo=(params.get('promo')||'').trim().toLowerCase();
    if(!['save50_welcome','guest_social_proof'].includes(campaign)&&promo!=='save50')return url;
    ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','utm_id','promo'].forEach(function(key){
      var value=(params.get(key)||'').trim();if(!value&&key==='utm_campaign')value='save50_welcome';
      if(value&&!url.searchParams.get(key))url.searchParams.set(key,value);
    });
    return url;
  }
  document.querySelectorAll('a[href]').forEach(function (link) {
    var rawHref = link.getAttribute('href') || '';
    // Same-page hash jumps must stay hashes. Rewriting #owner-cta to
    // /property-management/#owner-cta makes conversion-tracking treat it as a
    // real navigation and hold the click ~800ms.
    if (rawHref.charAt(0) === '#') return;
    var url = new URL(rawHref, location.href);
    if (url.origin === location.origin && (link.hasAttribute('data-trip-link') || /^(?:\/(?:properties|guides|stays)\/|\/about-us\/|\/$)/.test(url.pathname))) originalLinks.set(link, rawHref);
  });
  function label(value) { return new Intl.DateTimeFormat('en-US', {month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z')); }
  function summary() { return (trip.arrive ? label(trip.arrive)+' – '+label(trip.depart) : 'Flexible dates') + (trip.guests ? ' · '+(trip.guests === '17' ? 'more than 16' : trip.guests)+' guests' : ''); }
  function emit(name, extras) { if (tracking) tracking.trackEvent(name, Object.assign({page_slug:pageRoot ? pageRoot.dataset.propertyPage : 'home',placement:'guest_journey'},extras || {})); }
  // One state sets the word, destination and event of every booking control on a home's page.
  var bookingForm=document.querySelector('form[data-booking-url]');
  var checkoutLink=document.querySelector('[data-property-checkout]');
  var bookingDefault=bookingForm?bookingForm.querySelector('.g-form-status').textContent:'';
  var bookingState='none',tripNotice='',openHomes='',stayRequest=0,stayResult=null;
  var datesOpen='These dates are open. You’ll see the full price on the next screen, before you pay.';
  var groupNeeded='These dates are open. Choose your group size to book them.';
  // Hostaway's priced checkout for one home. Return listingUrl unchanged to send guests to the listing page instead.
  function checkoutUrl(listingUrl){return listingUrl.replace('/listings/','/checkout/');}
  function withStay(base){
    var url=preserveSave50Params(new URL(base));
    if(trip.arrive){url.searchParams.set('start',trip.arrive);url.searchParams.set('end',trip.depart);}
    if(trip.guests)url.searchParams.set('numberOfGuests',trip.guests);
    return url.toString();
  }
  function renderBooking(state,message){
    bookingState=state;
    var open=state==='open',outbound=open||state==='failed',booked=state==='booked';
    var word=open||state==='needs-guests'?'Book these dates':booked?'See open homes':'Check dates';
    var handoff=withStay(open?checkoutUrl(bookingForm.dataset.bookingUrl):bookingForm.dataset.bookingUrl);
    var homes=preserveSave50Params(new URL('/properties/',location.origin));
    ['arrive','depart','guests'].forEach(function(key){if(trip[key])homes.searchParams.set(key,trip[key]);});
    openHomes=homes.pathname+homes.search;
    checkoutLink.textContent=word;checkoutLink.dataset.trackLabel=word;
    if(state==='oversized'||state==='invalid')checkoutLink.removeAttribute('href');
    else checkoutLink.href=tracking?tracking.buildBookingEngineHandoffUrl(handoff,checkoutLink):handoff;
    document.querySelectorAll('[data-booking-action]').forEach(function(control){
      var link=control.tagName==='A';
      control.textContent=word;
      // The panel button hands off through the checkout link, so that link reports the booking click.
      if(booked||(outbound&&!link))control.removeAttribute('data-track-event');
      else control.dataset.trackEvent=outbound?'property_booking_page_click':'property_check_availability_click';
      if(link)control.href=outbound?(tracking?tracking.buildBookingEngineHandoffUrl(handoff,control):handoff):booked?openHomes:'#booking';
    });
    bookingForm.querySelector('.g-form-status').textContent=message;
  }
  function syncTrip() {
    var stayCheck=null;
    originalLinks.forEach(function (href, link) {
      var url = preserveSave50Params(new URL(href, location.href));
      ['arrive','depart','checkin','checkout','guests','area'].forEach(function(key){url.searchParams.delete(key);});
      if(trip.compare&&url.searchParams.has('compare')){var comparison=trip.compare.split(',');var currentHome=url.searchParams.get('compare');if(!comparison.includes(currentHome)&&comparison.length<3)comparison.push(currentHome);url.searchParams.set('compare',comparison.join(','));}
      Object.keys(trip).forEach(function (key) { if (key !== 'compare' || !url.searchParams.has('compare')) url.searchParams.set(key,trip[key]); });
      link.href = url.pathname+url.search+url.hash;
    });
    document.querySelectorAll('[data-trip-summary]').forEach(function (node) { node.textContent=summary(); });
    document.querySelectorAll('[data-mobile-trip]').forEach(function (node) { node.textContent=summary(); });
    if (checkoutLink && bookingForm) {
      var listing=withStay(bookingForm.dataset.bookingUrl);
      document.querySelectorAll('[data-property-booking-link]').forEach(function(link){link.href=tracking ? tracking.buildBookingEngineHandoffUrl(listing,link) : listing;});
      var arrive=bookingForm.querySelector('.g-arrive'),depart=bookingForm.querySelector('.g-depart');
      var invalidDates=Boolean(arrive.value)!==Boolean(depart.value)||(arrive.value&&(depart.value<=arrive.value||arrive.value<arrive.min));
      if(Number(trip.guests||0)>Number(bookingForm.dataset.maxGuests)){stayRequest+=1;renderBooking('oversized','This home hosts up to '+bookingForm.dataset.maxGuests+' guests. Compare the collection or ask us about separate homes.');}
      else if(invalidDates){stayRequest+=1;renderBooking('invalid','Choose a departure after arrival, or clear both dates to stay flexible.');}
      else if(trip.arrive&&trip.depart){
        // Visual captures skip the availability request and show these dates as open.
        if(new URLSearchParams(location.search).get('visual-test')==='1'){stayRequest+=1;renderBooking(trip.guests?'open':'needs-guests',trip.guests?datesOpen:groupNeeded);}
        else stayCheck=requestStayCheck();
      }
      else {stayRequest+=1;renderBooking('none',tripNotice||bookingDefault);}
    }
    updateQuestion();
    return stayCheck;
  }
  function stayMessage(home){
    if(home.reason==='minimum-stay'&&home.minimumStay)return 'This home needs '+home.minimumStay+' nights. Choose a longer stay or compare the other homes.';
    if(home.reason==='closed-arrival')return 'Check-in is not available that day. Choose a different arrival.';
    if(home.reason==='closed-departure')return 'Check-out is not available that day. Choose a different departure.';
    return 'These dates are booked. Choose different dates or compare the other homes.';
  }
  function showStay(home){
    // Only dates that are taken send the guest to the other homes; a stay rule keeps them choosing dates here.
    var stayRule=home.reason==='closed-arrival'||home.reason==='closed-departure'||(home.reason==='minimum-stay'&&home.minimumStay);
    if(home.bookable)renderBooking(trip.guests?'open':'needs-guests',trip.guests?datesOpen:groupNeeded);
    else renderBooking(stayRule?'restricted':'booked',stayMessage(home));
    return home;
  }
  function requestStayCheck(){
    var request=++stayRequest,dates=trip.arrive+'|'+trip.depart;
    // A changed group size reuses the answer already given for the same dates.
    if(stayResult&&stayResult.dates===dates)return Promise.resolve(showStay(stayResult.home));
    renderBooking('pending','Checking these dates.');
    return fetch('/.netlify/functions/booking-availability?arrive='+encodeURIComponent(trip.arrive)+'&depart='+encodeURIComponent(trip.depart),{headers:{accept:'application/json'}})
      .then(function(response){if(!response.ok)throw new Error('stay check failed');return response.json();})
      .then(function(body){
        if(request!==stayRequest)return null;
        if(!body||body.ok!==true||!Array.isArray(body.homes))throw new Error('stay check failed');
        var home=body.homes.find(function(item){return item.slug===pageRoot.dataset.propertyPage;});
        if(!home||home.reason==='no-calendar')throw new Error('stay check incomplete');
        stayResult={dates:dates,home:home};
        return showStay(home);
      })
      .catch(function(){
        if(request!==stayRequest)return null;
        renderBooking('failed','Availability could not be checked. Confirm it on the booking page.');
        return null;
      });
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
    if((raw.has('arrive')||raw.has('depart'))&&!trip.arrive){status.textContent='Those dates are incomplete, past or out of order. Choose new dates, or keep both blank.';if(form.dataset.bookingUrl)tripNotice=status.textContent;}
    function clearValidity(){depart.setCustomValidity('');depart.min=arrive.value||today;}
    arrive.addEventListener('input',clearValidity);depart.addEventListener('input',clearValidity);
    form.addEventListener('submit',function(event){
      event.preventDefault();clearValidity();
      if(Boolean(arrive.value)!==Boolean(depart.value)||(arrive.value&&depart.value<=arrive.value)){depart.setCustomValidity('Choose a departure after arrival, or clear both dates.');depart.reportValidity();return;}
      if(!form.reportValidity())return;
      var count=Number(guests.value||0),max=Number(form.dataset.maxGuests);
      if(form.dataset.bookingUrl&&count>max){status.textContent='This home hosts up to '+max+' guests. Compare the collection or ask us about separate homes.';emit('property_group_no_fit',{guest_count:count});return;}
      var pressed=[trip.arrive,trip.depart,trip.guests].join('|');
      delete trip.arrive;delete trip.depart;delete trip.guests;
      if(arrive.value){trip.arrive=arrive.value;trip.depart=depart.value;}
      if(guests.value)trip.guests=guests.value;
      rememberTrip();
      if(!form.dataset.bookingUrl){
        var target=preserveSave50Params(new URL('/properties/',location.origin));Object.keys(trip).forEach(function(key){target.searchParams.set(key,trip[key]);});
        emit('homepage_search_submit',{guest_count:count,has_dates:Boolean(arrive.value)});location.assign(target.pathname+target.search);return;
      }
      var current=new URL(location.href);['arrive','depart','checkin','checkout','guests'].forEach(function(key){current.searchParams.delete(key);});Object.keys(trip).forEach(function(key){current.searchParams.set(key,trip[key]);});history.replaceState(null,'',current.pathname+current.search+current.hash);
      // A press acts on the answer already on screen; a finished check never moves the guest by itself.
      if(pressed!==[trip.arrive,trip.depart,trip.guests].join('|')){tripNotice='';syncTrip();}
      else if(bookingState==='open'||bookingState==='failed'){checkoutLink.click();return;}
      else if(bookingState==='booked'){location.assign(openHomes);return;}
      if(bookingState==='none'){status.textContent='Choose your arrival and departure dates.';arrive.focus();}
      else if(bookingState==='needs-guests')guests.focus();
      else if(bookingState==='restricted')arrive.focus();
    });
    // Keep valid trip edits with home links and prepared questions.
    form.addEventListener('change',function(){
      var query=new URLSearchParams();if(arrive.value)query.set('arrive',arrive.value);if(depart.value)query.set('depart',depart.value);if(guests.value)query.set('guests',guests.value);
      var next=parseTrip ? parseTrip(query) : {};
      ['arrive','depart','guests'].forEach(function(key){delete trip[key];if(next[key])trip[key]=next[key];});
      var current=new URL(location.href);['arrive','depart','checkin','checkout','guests'].forEach(function(key){current.searchParams.delete(key);});Object.keys(trip).forEach(function(key){current.searchParams.set(key,trip[key]);});history.replaceState(null,'',current.pathname+current.search+current.hash);
      rememberTrip();
      tripNotice='';
      syncTrip();
    });
  });
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
    async function chooseScene(choice,animateScene){
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
      if(animateScene&&photo&&photo.decode){try{await photo.decode();}catch(error){/* The shared photo handler provides a named unavailable state. */}}
      if(request!==sceneRequest)return;
      sceneRoot.querySelectorAll('[data-scene]').forEach(function(scene){scene.hidden=scene!==panel;});
      choices.forEach(function(item){var selected=item===choice;item.classList.toggle('is-active',selected);item.setAttribute('aria-pressed',String(selected));});
      sceneRoot.setAttribute('aria-busy','false');
      sceneStatus.textContent='Previewing '+name+'. '+panel.querySelector('.g-scene-caption p:last-child').textContent;
      if(panel.getAnimations)panel.getAnimations({subtree:true}).forEach(function(animation){animation.cancel();});
      if(animateScene&&!reducedMotion.matches&&panel.animate){
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
      choice.addEventListener('click',function(event){if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;event.preventDefault();chooseScene(choice,event.detail>0);});
      choice.addEventListener('keydown',function(event){
        if(event.key===' '){event.preventDefault();chooseScene(choice,false);return;}
        var next=event.key==='ArrowRight'?(index+1)%choices.length:event.key==='ArrowLeft'?(index+choices.length-1)%choices.length:event.key==='Home'?0:event.key==='End'?choices.length-1:-1;
        if(next<0)return;
        event.preventDefault();choices[next].focus({preventScroll:true});
        // Scroll the horizontal selector only; never move the guest away from the scene.
        var rail=choice.parentElement;
        rail.scrollTo({left:choices[next].offsetLeft-rail.offsetLeft-14,behavior:'instant'});
        chooseScene(choices[next],false);
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
