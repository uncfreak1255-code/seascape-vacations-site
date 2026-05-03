const https = require("https");

const DEFAULT_BOOKING_BASE_URL = "https://book.seascape-vacations.com";

function toBookingEngineHostname(baseUrl = DEFAULT_BOOKING_BASE_URL) {
  return new URL(baseUrl).hostname;
}

function calendarDaysFromBookingEngineResponse(json) {
  if (!json || json.status !== "success" || !json.result || typeof json.result !== "object") {
    return [];
  }

  return Object.values(json.result);
}

function fetchJson(path) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "booking-engine.hostaway.com",
        path,
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    req.on("error", reject);
    req.end();
  });
}

async function fetchBookingEngineCalendar(listingId, startingDate, options = {}) {
  const hostname = toBookingEngineHostname(options.baseUrl);
  const params = new URLSearchParams({ startingDate });
  const path = `/bookingEngines/${encodeURIComponent(hostname)}/listings/${encodeURIComponent(
    listingId
  )}/calendar?${params.toString()}`;
  const json = await fetchJson(path);
  return calendarDaysFromBookingEngineResponse(json);
}

module.exports = {
  calendarDaysFromBookingEngineResponse,
  fetchBookingEngineCalendar,
  toBookingEngineHostname
};
