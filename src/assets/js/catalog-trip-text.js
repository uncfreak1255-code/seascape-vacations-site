/* Date and trip-summary text helpers for the properties catalog (catalog.js) and the phone trip sheet. */
(function () {
  function validDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
    var date = new Date(value + "T00:00:00Z");
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0,10) === value;
  }
  function dateLabel(value) {
    return new Intl.DateTimeFormat("en-US", { month:"short", day:"numeric", year:"numeric", timeZone:"UTC" }).format(new Date(value + "T12:00:00Z"));
  }
  function tripText(trip) {
    var dates = trip.arrive && trip.depart ? dateLabel(trip.arrive) + " – " + dateLabel(trip.depart) : "Flexible dates";
    return dates + (trip.guests ? " · " + (trip.guests === "17" ? "More than 16 guests" : trip.guests + (trip.guests === "1" ? " guest" : " guests")) : "");
  }
  window.SeascapeTripText = { validDate: validDate, dateLabel: dateLabel, tripText: tripText };
})();
