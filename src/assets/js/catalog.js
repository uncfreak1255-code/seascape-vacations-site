(function () {
  "use strict";
  var root = document.querySelector("[data-catalog-version]");
  if (!root) return;
  var form = document.getElementById("catalog-trip-form");
  var arrive = document.getElementById("trip-arrive");
  var depart = document.getElementById("trip-depart");
  var guests = document.getElementById("trip-guests");
  var status = document.getElementById("trip-status");
  var cards = Array.from(root.querySelectorAll(".catalog-card"));
  var filters = Array.from(root.querySelectorAll("[data-filter]"));
  var dialog = document.getElementById("catalog-comparison");
  var params = new URLSearchParams(location.search);
  var today = new Intl.DateTimeFormat("en-CA", { timeZone:"America/New_York", year:"numeric", month:"2-digit", day:"2-digit" }).format(new Date());
  var trip = { arrive:"", depart:"", guests:"" };
  var selected = [];
  var activeFilter = "all";
  var originalLinks = new Map();

  function validDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
    var date = new Date(value + "T00:00:00Z");
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0,10) === value;
  }
  function dateLabel(value) {
    return new Intl.DateTimeFormat("en-US", { month:"short", day:"numeric", year:"numeric", timeZone:"UTC" }).format(new Date(value + "T12:00:00Z"));
  }
  function tripText() {
    var dates = trip.arrive && trip.depart ? dateLabel(trip.arrive) + " – " + dateLabel(trip.depart) : "Flexible dates";
    return dates + (trip.guests ? " · " + (trip.guests === "17" ? "More than 16 guests" : trip.guests + (trip.guests === "1" ? " guest" : " guests")) : "");
  }
  function emit(name, extras) {
    if (window.SeascapeConversionTracking) window.SeascapeConversionTracking.trackEvent(name, Object.assign({ page_slug:"properties", placement:"catalog_journey" },extras || {}));
  }
  function itineraryParams() {
    var query = new URLSearchParams();
    if (trip.arrive && trip.depart) {
      query.set("arrive",trip.arrive); query.set("depart",trip.depart);
    }
    if (trip.guests) query.set("guests",trip.guests);
    if (activeFilter !== "all") query.set("area",activeFilter === "bradenton" ? "anna-maria-island" : activeFilter);
    if (selected.length) query.set("compare",selected.join(","));
    return query;
  }
  function syncUrl() {
    var url = new URL(location.href);
    ["arrive","depart","checkin","checkout","guests","area","compare"].forEach(function (key) { url.searchParams.delete(key); });
    itineraryParams().forEach(function (value,key) { url.searchParams.set(key,value); });
    history.replaceState(null,"",url.pathname + url.search + url.hash);
  }
  function syncLinks() {
    root.querySelectorAll("[data-trip-link]").forEach(function (link) {
      var url = new URL(originalLinks.get(link),location.href);
      itineraryParams().forEach(function (value,key) { url.searchParams.set(key,value); });
      link.href = url.pathname + url.search + url.hash;
    });
    // Only the main CTAs inherit the chosen trip. A recent-opening link owns its own dates.
    document.querySelectorAll("[data-booking-base]").forEach(function (link) {
      var url = new URL(link.dataset.bookingBase);
      if (trip.arrive && trip.depart) { url.searchParams.set("start",trip.arrive); url.searchParams.set("end",trip.depart); }
      if (trip.guests && Number(trip.guests) <= 16) url.searchParams.set("numberOfGuests",trip.guests);
      link.href = url.toString();
    });
  }
  function renderComparison() {
    root.querySelectorAll("[data-compare]").forEach(function (button) {
      var chosen = selected.includes(button.dataset.compare);
      button.setAttribute("aria-pressed",String(chosen));
      button.querySelector("span:last-child").textContent = chosen ? "Selected" : "Compare";
    });
    document.getElementById("catalog-shortlist").hidden = selected.length === 0;
    document.documentElement.classList.toggle("has-catalog-shortlist",selected.length > 0);
    document.getElementById("shortlist-count").textContent = selected.length + (selected.length === 1 ? " home selected" : " homes selected");
    document.getElementById("shortlist-hint").textContent = selected.length === 1 ? "Add one more to compare." : "Compare, then share with your group.";
    document.getElementById("open-comparison").disabled = selected.length < 2;
    root.querySelectorAll("[data-compare-column]").forEach(function (cell) { cell.hidden = !selected.includes(cell.dataset.compareColumn); });
    root.querySelectorAll("[data-capacity]").forEach(function (cell) {
      cell.textContent = trip.guests && Number(trip.guests) > Number(cell.dataset.capacity) ? "Too small for your group" : "";
    });
    document.getElementById("comparison-trip").textContent = tripText() + " · Dates and prices need confirmation.";
  }
  function render() {
    var count = 0;
    cards.forEach(function (card) {
      var fitsArea = activeFilter === "all" || card.dataset.filters.split("|").includes(activeFilter);
      var fitsGroup = !trip.guests || Number(card.dataset.maxGuests) >= Number(trip.guests);
      card.hidden = !(fitsArea && fitsGroup);
      if (!card.hidden) count++;
    });
    filters.forEach(function (button) {
      var active = button.dataset.filter === activeFilter;
      button.classList.toggle("active",active); button.setAttribute("aria-pressed",String(active));
    });
    document.getElementById("catalog-count").textContent = count + (count === 1 ? " home fits" : " homes fit") + " · Check dates on each booking page";
    document.getElementById("catalog-empty").hidden = count > 0;
    document.getElementById("catalog-empty-copy").textContent = Number(trip.guests) > 16
      ? "Our largest home sleeps 16. Call us to discuss separate homes for a larger group; availability and suitability need confirmation."
      : "Try another area or check your group size. Changing dates will not change a home’s maximum capacity.";
    status.textContent = tripText() + ". Availability, fees and the full total are confirmed on the booking page.";
    document.getElementById("clear-dates").hidden = !trip.arrive && !trip.depart;
    root.querySelectorAll(".catalog-opening").forEach(function (opening) {
      var age = Date.now() - Date.parse(opening.dataset.openingSynced);
      opening.hidden = Boolean(trip.arrive || trip.depart) || !validDate(opening.dataset.openingStart) || !validDate(opening.dataset.openingEnd)
        || opening.dataset.openingStart < today || opening.dataset.openingEnd <= opening.dataset.openingStart
        || !Number.isFinite(age) || age < -300000 || age > 36*60*60*1000;
    });
    renderComparison(); syncUrl(); syncLinks();
  }
  root.querySelectorAll("[data-trip-link]").forEach(function(link) { originalLinks.set(link,link.getAttribute("href")); });
  document.querySelectorAll('a[href]').forEach(function(link) {
    if (root.contains(link)) return;
    var url;
    try { url=new URL(link.href,location.href); } catch (_error) { return; }
    if (url.hostname !== "book.seascape-vacations.com") return;
    ["start","end","startingDate","endingDate","numberOfGuests","guests","checkin","checkout"].forEach(function(key) { url.searchParams.delete(key); });
    link.dataset.bookingBase=url.toString();
  });
  arrive.min = today; depart.min = today;
  var rawArrive = params.get("arrive") || params.get("checkin") || "";
  var rawDepart = params.get("depart") || params.get("checkout") || "";
  var invalidDates = Boolean(rawArrive || rawDepart) && !(validDate(rawArrive) && validDate(rawDepart) && rawArrive >= today && rawDepart > rawArrive);
  if (!invalidDates) { arrive.value=rawArrive; depart.value=rawDepart; }
  var rawGuests = params.get("guests") || "";
  if (/^\d+$/.test(rawGuests) && Number(rawGuests) > 0) guests.value=String(Math.min(Number(rawGuests),17));
  var area = (params.get("area") || "").toLowerCase();
  if (area === "anna-maria-island" || area === "ami") area="bradenton";
  if (filters.some(function(button) { return button.dataset.filter === area; })) activeFilter=area;
  trip = { arrive:arrive.value, depart:depart.value, guests:guests.value };
  // Preserve old incoming pool / hot-tub links; every current home has a pool and spa.
  if (area === "pool" || area === "hot-tub") activeFilter="all";
  selected = Array.from(new Set((params.get("compare") || "").split(","))).filter(function(slug) {
    return cards.some(function(card) { return card.dataset.property === slug; });
  }).slice(0,3);
  root.querySelectorAll("[data-compare]").forEach(function(button) {
    button.hidden=false;
    button.addEventListener("click",function() {
      var slug=button.dataset.compare;
      if (selected.includes(slug)) selected=selected.filter(function(item) { return item!==slug; });
      else if (selected.length < 3) selected.push(slug);
      else { status.textContent="Your comparison has three homes. Remove one with its Selected button or clear the comparison to choose another."; status.scrollIntoView({block:"center"}); return; }
      emit("catalog_compare_select",{page_slug:slug,selected_count:selected.length});
      renderComparison(); syncUrl(); syncLinks();
    });
  });
  filters.forEach(function(button) { button.addEventListener("click",function() { activeFilter=button.dataset.filter; render(); emit("catalog_filter_change",{filter:activeFilter}); }); });
  form.addEventListener("submit",function(event) {
    event.preventDefault(); depart.setCustomValidity("");
    if (Boolean(arrive.value) !== Boolean(depart.value) || (arrive.value && depart.value <= arrive.value)) {
      depart.setCustomValidity("Choose a departure after your arrival, or clear both dates."); depart.reportValidity(); return;
    }
    if (!form.reportValidity()) return;
    trip = { arrive:arrive.value, depart:depart.value, guests:guests.value };
    render(); emit("catalog_trip_update",{guest_count:Number(guests.value)||0,has_dates:Boolean(arrive.value)});
  });
  depart.addEventListener("input",function() { depart.setCustomValidity(""); });
  arrive.addEventListener("input",function() { depart.setCustomValidity(""); depart.min=arrive.value || today; });
  document.getElementById("clear-dates").addEventListener("click",function() {
    arrive.value=""; depart.value=""; depart.setCustomValidity(""); depart.min=today; trip.arrive=""; trip.depart=""; render();
  });
  document.getElementById("reset-filter").addEventListener("click",function() { activeFilter="all"; render(); });
  document.getElementById("clear-comparison").addEventListener("click",function() { selected=[]; renderComparison(); syncUrl(); syncLinks(); });
  document.getElementById("open-comparison").addEventListener("click",function() { renderComparison(); dialog.showModal(); emit("catalog_compare_open",{selected_count:selected.length}); });
  document.getElementById("close-comparison").addEventListener("click",function() { dialog.close(); });
  dialog.addEventListener("close",function() {
    if (location.hash === "#compare") history.replaceState(null,"",location.pathname+location.search);
  });
  document.getElementById("share-comparison").addEventListener("click",async function() {
    // Explicit allowlist prevents campaign/session IDs, unknown params and contact details entering a shared link.
    var url=new URL("/properties/",location.origin); url.search=itineraryParams().toString(); url.hash="compare";
    var shareStatus=document.getElementById("share-status");
    try {
      await navigator.clipboard.writeText(url.toString());
      shareStatus.textContent="Link copied. Paste it into your group chat.";
      emit("catalog_shortlist_copy",{selected_count:selected.length});
    } catch(_error) {
      document.getElementById("share-fallback-label").hidden=false;
      var field=document.getElementById("share-fallback"); field.hidden=false; field.value=url.toString(); field.focus(); field.select();
      shareStatus.textContent="Select and copy the link below.";
    }
  });
  render();
  if (invalidDates) status.textContent="Those dates are incomplete, past or out of order. Choose new dates, or browse with flexible dates.";
  if (location.hash === "#compare" && selected.length >= 2) dialog.showModal();
  window.addEventListener("pageshow",function(event) { if(event.persisted) render(); });
})();
