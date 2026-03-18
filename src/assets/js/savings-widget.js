/**
 * PriceForge Direct Booking Savings Widget
 *
 * Self-contained vanilla JS widget that fetches pre-computed OTA vs direct
 * price comparisons from Supabase and renders an animated bar chart.
 *
 * Usage:
 *   <div data-savings-widget data-listing-id="206016" data-cleaning-fee="350"></div>
 *   <script src="/assets/js/savings-widget.js" defer></script>
 *
 * Design tokens match seascape-vacations.com (teal, gold, cream, Poppins).
 * ~3KB gzipped, zero dependencies, graceful degradation.
 */
(function () {
  "use strict";

  var SUPABASE_URL = "https://zsitbuwzxtsgfqzhtged.supabase.co";
  var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXRidXd6eHRzZ2Zxemh0Z2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwOTM5NjMsImV4cCI6MjA4ODY2OTk2M30.LoF6oXksHrzCYxlynOyr-lT28yCSrRe4JXd53kF4dRo";
  var STALE_HOURS = 48;

  var BRAND = "#5F8A8B";
  var BRAND_DARK = "#3D6B6D";
  var GOLD = "#C9A962";
  var CREAM = "#F5EED6";
  var STONE = "#2C2C2C";
  var AIRBNB_COLOR = "#FF5A5F";
  var VRBO_COLOR = "#3B5998";

  function init() {
    var container = document.querySelector("[data-savings-widget]");
    if (!container) return;

    var listingId = parseInt(container.getAttribute("data-listing-id"), 10);
    var cleaningFee = parseFloat(container.getAttribute("data-cleaning-fee") || "350");
    if (!listingId) return;

    injectStyles();
    container.innerHTML = buildShell();
    bindDateInputs(container, listingId, cleaningFee);
  }

  function buildShell() {
    return (
      '<div class="sw-root">' +
        '<div class="sw-header">' +
          '<span class="sw-badge">BOOK DIRECT & SAVE</span>' +
        "</div>" +
        '<div class="sw-dates">' +
          '<div class="sw-date-field">' +
            '<label for="sw-checkin">Check-in</label>' +
            '<input type="date" id="sw-checkin" class="sw-input">' +
          "</div>" +
          '<div class="sw-date-field">' +
            '<label for="sw-checkout">Check-out</label>' +
            '<input type="date" id="sw-checkout" class="sw-input">' +
          "</div>" +
        "</div>" +
        '<div class="sw-placeholder">Select your dates to see how much you save booking direct</div>' +
        '<div class="sw-results" style="display:none"></div>' +
        '<div class="sw-error" style="display:none"></div>' +
      "</div>"
    );
  }

  function bindDateInputs(container, listingId, cleaningFee) {
    var checkinEl = container.querySelector("#sw-checkin");
    var checkoutEl = container.querySelector("#sw-checkout");

    var today = new Date().toISOString().split("T")[0];
    checkinEl.setAttribute("min", today);
    checkoutEl.setAttribute("min", today);

    function onDateChange() {
      var checkin = checkinEl.value;
      var checkout = checkoutEl.value;
      if (!checkin || !checkout) return;
      if (checkout <= checkin) {
        showError(container, "Check-out must be after check-in");
        return;
      }
      fetchAndRender(container, listingId, checkin, checkout, cleaningFee);
    }

    checkinEl.addEventListener("change", function () {
      if (!checkoutEl.value || checkoutEl.value <= checkinEl.value) {
        var d = new Date(checkinEl.value);
        d.setDate(d.getDate() + 7);
        checkoutEl.value = d.toISOString().split("T")[0];
      }
      checkoutEl.setAttribute("min", checkinEl.value);
      onDateChange();
    });

    checkoutEl.addEventListener("change", onDateChange);
  }

  function fetchAndRender(container, listingId, checkin, checkout, cleaningFee) {
    var placeholder = container.querySelector(".sw-placeholder");
    var results = container.querySelector(".sw-results");
    var errorEl = container.querySelector(".sw-error");

    placeholder.style.display = "none";
    errorEl.style.display = "none";
    results.style.display = "block";
    results.classList.remove("sw-visible");
    results.innerHTML = '<div class="sw-loading"><div class="sw-spinner"></div>Checking prices\u2026</div>';

    var url =
      SUPABASE_URL +
      "/rest/v1/pricing_widget_cache" +
      "?listing_id=eq." + listingId +
      "&date=gte." + checkin +
      "&date=lt." + checkout +
      "&order=date" +
      "&select=date,direct_nightly,airbnb_guest_total,vrbo_guest_total,is_available,cleaning_fee,min_stay,updated_at";

    fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: "Bearer " + SUPABASE_ANON_KEY,
      },
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (rows) {
        if (!rows || rows.length === 0) {
          showError(container, "No pricing data for these dates. Try different dates.");
          return;
        }

        // Staleness check — hide if data is too old
        var latestUpdate = rows[0].updated_at;
        if (latestUpdate) {
          var hoursOld = (Date.now() - new Date(latestUpdate).getTime()) / 3600000;
          if (hoursOld > STALE_HOURS) {
            container.querySelector(".sw-root").style.display = "none";
            return;
          }
        }

        // Check availability
        var available = rows.filter(function (r) { return r.is_available; });
        if (available.length === 0) {
          showError(container, "These dates are booked. Try different dates!");
          return;
        }

        // Check min stay
        var minStay = rows[0].min_stay || 1;
        if (rows.length < minStay) {
          showError(container, "Minimum stay is " + minStay + " nights. You selected " + rows.length + ".");
          return;
        }

        renderComparison(container, available, checkin, checkout, cleaningFee, listingId);
      })
      .catch(function () {
        showError(container, "Unable to load pricing. Please try again later.");
      });
  }

  function renderComparison(container, rows, checkin, checkout, cleaningFee, listingId) {
    var results = container.querySelector(".sw-results");
    var nights = rows.length;

    var directTotal = 0;
    var airbnbTotal = 0;
    var vrboTotal = 0;
    for (var i = 0; i < rows.length; i++) {
      directTotal += parseFloat(rows[i].direct_nightly);
      airbnbTotal += parseFloat(rows[i].airbnb_guest_total);
      vrboTotal += parseFloat(rows[i].vrbo_guest_total);
    }

    // Cleaning fee is the same across all channels, so it cancels out.
    // Savings shown are purely the OTA service fee markup.
    var savingsAirbnb = airbnbTotal - directTotal;
    var savingsVrbo = vrboTotal - directTotal;
    var bestSavings = Math.max(savingsAirbnb, savingsVrbo);

    // If somehow direct is more expensive, don't show the widget
    if (bestSavings <= 0) {
      container.querySelector(".sw-root").style.display = "none";
      return;
    }

    var maxTotal = Math.max(airbnbTotal, vrboTotal, directTotal);
    var airbnbPct = Math.round((airbnbTotal / maxTotal) * 100);
    var vrboPct = Math.round((vrboTotal / maxTotal) * 100);
    var directPct = Math.round((directTotal / maxTotal) * 100);

    var bookingUrl =
      "https://book.seascape-vacations.com/listings/" + listingId +
      "?checkin=" + checkin + "&checkout=" + checkout;

    results.innerHTML =
      '<div class="sw-comparison">' +
        buildBar("Airbnb", airbnbTotal, airbnbPct, AIRBNB_COLOR) +
        buildBar("Vrbo", vrboTotal, vrboPct, VRBO_COLOR) +
        buildBar("Direct", directTotal, directPct, BRAND) +
        '<div class="sw-savings">' +
          '<span class="sw-savings-amount">YOU SAVE $' + formatNum(bestSavings) + "</span>" +
          '<span class="sw-savings-detail">' + nights + "-night stay</span>" +
        "</div>" +
      "</div>" +
      '<div class="sw-benefits">' +
        "<span>\u2713 No service fees</span>" +
        "<span>\u2713 Best rate guaranteed</span>" +
        "<span>\u2713 Direct host support</span>" +
      "</div>" +
      '<a href="' + bookingUrl + '" class="sw-cta" target="_blank" rel="noopener">' +
        "Book Direct \u2014 Save $" + formatNum(bestSavings) +
      "</a>" +
      '<div class="sw-disclaimer">Estimated savings based on typical platform fees. Prices updated daily.</div>';

    // Animate bars and fade in
    setTimeout(function () {
      results.classList.add("sw-visible");
    }, 50);

    updateStickyBar(bestSavings);
  }

  function buildBar(label, total, pct, color) {
    return (
      '<div class="sw-bar-row">' +
        '<span class="sw-bar-label">' + label + "</span>" +
        '<div class="sw-bar-track">' +
          '<div class="sw-bar-fill" style="width:0%;background:' + color + '" data-width="' + pct + '"></div>' +
        "</div>" +
        '<span class="sw-bar-value">$' + formatNum(total) + "</span>" +
      "</div>"
    );
  }

  function formatNum(n) {
    return Math.round(n).toLocaleString("en-US");
  }

  function showError(container, msg) {
    var placeholder = container.querySelector(".sw-placeholder");
    var results = container.querySelector(".sw-results");
    var errorEl = container.querySelector(".sw-error");
    placeholder.style.display = "none";
    results.style.display = "none";
    errorEl.style.display = "block";
    errorEl.textContent = msg;
  }

  function updateStickyBar(savings) {
    var bars = document.querySelectorAll(".mobile-cta-text, .sticky-book-text, .book-direct-text");
    for (var i = 0; i < bars.length; i++) {
      if (savings > 0) {
        bars[i].textContent = "Save $" + formatNum(savings) + " vs Airbnb";
      }
    }
  }

  function animateBars() {
    var fills = document.querySelectorAll(".sw-bar-fill");
    for (var i = 0; i < fills.length; i++) {
      (function (el, delay) {
        setTimeout(function () {
          el.style.width = el.getAttribute("data-width") + "%";
        }, delay);
      })(fills[i], i * 150);
    }
  }

  // Observe when results become visible to trigger bar animation
  var observer = null;
  function setupObserver() {
    if (!("MutationObserver" in window)) return;
    var results = document.querySelector(".sw-results");
    if (!results) return;
    observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].target.classList && mutations[i].target.classList.contains("sw-visible")) {
          animateBars();
          break;
        }
      }
    });
    observer.observe(results, { attributes: true, attributeFilter: ["class"] });
  }

  function injectStyles() {
    if (document.querySelector("#sw-styles")) return;
    var style = document.createElement("style");
    style.id = "sw-styles";
    style.textContent = [
      ".sw-root{max-width:560px;margin:24px auto;padding:28px;background:" + CREAM + ";border-radius:16px;font-family:Poppins,sans-serif;border:1px solid rgba(0,0,0,.06);box-shadow:0 2px 12px rgba(0,0,0,.04)}",
      ".sw-header{margin-bottom:20px}",
      ".sw-badge{display:inline-block;background:" + GOLD + ";color:#fff;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:.08em}",
      ".sw-dates{display:flex;gap:12px;margin-bottom:20px}",
      ".sw-date-field{flex:1}",
      ".sw-date-field label{display:block;font-size:12px;font-weight:600;color:" + BRAND_DARK + ";margin-bottom:4px;text-transform:uppercase;letter-spacing:.05em}",
      ".sw-input{width:100%;padding:10px 12px;border:1px solid #d0d0d0;border-radius:8px;font-size:15px;font-family:Poppins,sans-serif;background:#fff;color:" + STONE + ";box-sizing:border-box}",
      ".sw-input:focus{outline:none;border-color:" + BRAND + ";box-shadow:0 0 0 3px rgba(95,138,139,.15)}",
      ".sw-placeholder{text-align:center;color:#888;font-size:14px;padding:20px 0}",
      ".sw-loading{text-align:center;color:" + BRAND + ";font-size:14px;padding:20px 0;display:flex;align-items:center;justify-content:center;gap:8px}",
      ".sw-spinner{width:18px;height:18px;border:2px solid " + CREAM + ";border-top-color:" + BRAND + ";border-radius:50%;animation:sw-spin .6s linear infinite}",
      "@keyframes sw-spin{to{transform:rotate(360deg)}}",
      ".sw-error{text-align:center;color:#c0392b;font-size:14px;padding:16px 0}",
      ".sw-comparison{margin-bottom:20px}",
      ".sw-bar-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}",
      ".sw-bar-label{width:52px;font-size:12px;font-weight:600;color:" + STONE + "}",
      ".sw-bar-track{flex:1;height:28px;background:rgba(0,0,0,.06);border-radius:6px;overflow:hidden}",
      ".sw-bar-fill{height:100%;border-radius:6px;transition:width .8s cubic-bezier(.4,0,.2,1)}",
      ".sw-bar-value{width:72px;text-align:right;font-size:14px;font-weight:700;color:" + STONE + "}",
      ".sw-savings{text-align:center;padding:16px 0 8px}",
      ".sw-savings-amount{display:block;font-size:22px;font-weight:700;color:" + BRAND_DARK + "}",
      ".sw-savings-detail{font-size:13px;color:#888}",
      ".sw-benefits{display:flex;justify-content:center;gap:16px;margin-bottom:20px;flex-wrap:wrap}",
      ".sw-benefits span{font-size:13px;color:" + BRAND_DARK + ";font-weight:500}",
      ".sw-cta{display:block;width:100%;padding:14px;background:" + GOLD + ";color:#fff;text-align:center;border-radius:10px;font-size:16px;font-weight:700;text-decoration:none;letter-spacing:.02em;transition:opacity .2s;box-sizing:border-box}",
      ".sw-cta:hover{opacity:.9}",
      ".sw-disclaimer{text-align:center;font-size:11px;color:#aaa;margin-top:12px}",
      ".sw-results{opacity:0;transform:translateY(8px);transition:opacity .4s,transform .4s}",
      ".sw-results.sw-visible{opacity:1;transform:translateY(0)}",
      "@media(max-width:768px){.sw-root{margin:16px;padding:20px}.sw-benefits{flex-direction:column;align-items:center;gap:8px}.sw-bar-label{width:44px;font-size:11px}.sw-bar-value{width:64px;font-size:13px}}"
    ].join("");
    document.head.appendChild(style);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      init();
      setupObserver();
    });
  } else {
    init();
    setupObserver();
  }
})();
