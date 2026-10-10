// Inline this before every GA4 loader, including legacy standalone guide tags.
// Google's supported ga-disable switch prevents collection without changing reports.
function renderAnalyticsTrafficScript(measurementId) {
  if (!/^G-[A-Z0-9]+$/.test(measurementId || "")) {
    throw new Error("analytics traffic: a valid GA4 measurement ID is required");
  }
  return `<script>
(function () {
  var location = window.location;
  var production = location.hostname === "seascape-vacations.com" || location.hostname === "www.seascape-vacations.com";
  var marker = new URLSearchParams(location.search).get("sv_developer");
  var developer = marker === "1";
  try {
    if (marker === "1") window.localStorage.setItem("seascape_developer_traffic", "1");
    else if (marker === "0") window.localStorage.removeItem("seascape_developer_traffic");
    if (marker !== "0") developer = developer || window.localStorage.getItem("seascape_developer_traffic") === "1";
  } catch (error) {
    // A URL marker still works for this page when storage is unavailable.
  }
  var automated = window.navigator && window.navigator.webdriver === true;
  window.__seascapeAnalyticsSuppressed = !production || developer || automated;
  if (window.__seascapeAnalyticsSuppressed) window[${JSON.stringify(`ga-disable-${measurementId}`)}] = true;
})();
</script>`;
}

module.exports = { renderAnalyticsTrafficScript };
