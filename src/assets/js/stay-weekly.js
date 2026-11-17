(function () {
  'use strict';
  var root = document.querySelector('[data-weekly-guide]');
  var dialog = document.querySelector('[data-weekly-dialog]');
  if (!root || !dialog || typeof dialog.showModal !== 'function') return;
  var tracking = window.SeascapeConversionTracking;
  var opener = root.querySelector('[data-weekly-open]');
  var form = dialog.querySelector('form');
  var arrive = form.elements.start, depart = form.elements.end, guests = form.elements.numberOfGuests;
  var status = form.querySelector('[data-weekly-status]');
  var alternatives = form.querySelector('[data-weekly-alternatives]');
  var handoff = form.querySelector('[data-weekly-handoff]');
  var maxGuests = Number(dialog.dataset.maxGuests);
  var params = new URLSearchParams(location.search);
  var guideClickId = params.get('sv_guide_click_id') || '';
  function prepareGuideLineage() {
    if (!guideClickId) {
      var token = window.crypto && typeof window.crypto.randomUUID === 'function'
        ? window.crypto.randomUUID() : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
      // Match the shared tracker: opaque IDs must not resemble phone numbers.
      token = token.replace(/[0-9q]/g, function (character) {
        return character === 'q' ? 'qq' : 'q' + String.fromCharCode(97 + Number(character));
      });
      guideClickId = ('svg_' + token).replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 96);
    }
    var direct = new URL(opener.href);
    direct.searchParams.set('sv_guide_click_id', guideClickId);
    opener.href = tracking ? tracking.buildBookingEngineHandoffUrl(direct.href, opener) : direct.href;
  }
  var trip = tracking ? tracking.readTripParams(params) : {};
  var today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  arrive.min = today; depart.min = today;
  arrive.value = trip.arrive || ''; depart.value = trip.depart || '';
  if (trip.guests && !Array.from(guests.options).some(function (option) { return option.value === trip.guests; })) {
    var incomingGroup = document.createElement('option');
    incomingGroup.value = trip.guests;
    incomingGroup.textContent = trip.guests + ' guests · compare homes';
    guests.appendChild(incomingGroup);
  }
  guests.value = trip.guests || '1';
  function addDays(value, days) {
    var date = new Date(value + 'T12:00:00Z'); date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  }
  function sync() {
    arrive.setCustomValidity(''); depart.setCustomValidity(''); guests.setCustomValidity('');
    alternatives.hidden = true;
    if (!guests.value || !Number.isSafeInteger(Number(guests.value)) || Number(guests.value) < 1) {
      guests.setCustomValidity('Choose your group size.'); status.textContent = guests.validationMessage; return false;
    }
    depart.min = arrive.value ? addDays(arrive.value, 1) : today;
    if (Number(guests.value) > maxGuests) {
      guests.setCustomValidity('Dockside Dreams hosts up to ' + maxGuests + ' guests. Compare homes for your group.');
      status.textContent = guests.validationMessage;
      var homes = new URL('/properties/', location.origin);
      if (arrive.value && depart.value && depart.value > arrive.value && arrive.value >= today) { homes.searchParams.set('arrive', arrive.value); homes.searchParams.set('depart', depart.value); }
      homes.searchParams.set('guests', guests.value); alternatives.href = homes.href; alternatives.hidden = false;
      return false;
    }
    if (arrive.value && arrive.value < today) { arrive.setCustomValidity('Choose an arrival today or later.'); status.textContent = arrive.validationMessage; return false; }
    if (arrive.value && depart.value && depart.value <= arrive.value) { depart.setCustomValidity('Choose a departure after arrival.'); status.textContent = depart.validationMessage; return false; }
    if (!arrive.value || !depart.value) { status.textContent = 'Select your arrival and departure.'; return false; }
    var nights = Math.round((new Date(depart.value + 'T12:00:00Z') - new Date(arrive.value + 'T12:00:00Z')) / 86400000);
    status.textContent = nights + ' nights · ' + guests.value + ' guests · Availability checked next';
    var url = new URL(dialog.dataset.bookingUrl);
    url.searchParams.set('start', arrive.value); url.searchParams.set('end', depart.value); url.searchParams.set('numberOfGuests', guests.value);
    if (guideClickId) url.searchParams.set('sv_guide_click_id', guideClickId);
    handoff.href = tracking ? tracking.buildBookingEngineHandoffUrl(url.href, handoff) : url.href;
    return true;
  }
  opener.addEventListener('pointerdown', prepareGuideLineage);
  opener.addEventListener('click', function (event) {
    prepareGuideLineage();
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); event.stopPropagation(); sync(); dialog.showModal();
    if (tracking) tracking.trackEvent('property_check_availability_click', { property_slug: dialog.dataset.propertySlug, placement: 'weekly_photo' });
  });
  dialog.querySelector('[data-weekly-close]').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('close', function () { opener.focus(); });
  dialog.addEventListener('click', function (event) {
    if (event.target !== dialog) return;
    var box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  [arrive, depart, guests].forEach(function (input) { input.addEventListener('change', sync); input.addEventListener('input', sync); });
  form.querySelector('[data-weekly-seven]').addEventListener('click', function () {
    if (!arrive.value) { status.textContent = 'Choose an arrival first, then add seven nights.'; arrive.focus(); return; }
    depart.value = addDays(arrive.value, 7); sync();
  });
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!sync() || !form.reportValidity()) return;
    if (tracking && tracking.rememberTrip) tracking.rememberTrip({ arrive: arrive.value, depart: depart.value, guests: guests.value });
    handoff.click();
  });
  var photo = root.querySelector('.sv-photo');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');
  var pointer = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 701px)');
  function reset() { photo.style.removeProperty('transform'); photo.style.removeProperty('--mx'); photo.style.removeProperty('--my'); }
  photo.addEventListener('pointermove', function (event) {
    if (reduced.matches || !pointer.matches) { reset(); return; }
    var rect = photo.getBoundingClientRect(), x = (event.clientX - rect.left) / rect.width, y = (event.clientY - rect.top) / rect.height;
    photo.style.transform = 'rotateX(' + ((.5 - y) * 5) + 'deg) rotateY(' + ((x - .5) * 5) + 'deg) rotate(-1deg)';
    photo.style.setProperty('--mx', (x * 100) + '%'); photo.style.setProperty('--my', (y * 100) + '%');
  });
  photo.addEventListener('pointerleave', reset);
  reduced.addEventListener('change', reset); pointer.addEventListener('change', reset);
  sync();
})();
