const https = require("https");

const CLIENT_ID = process.env.HOSTAWAY_ID;
const CLIENT_SECRET = process.env.HOSTAWAY_SECRET;

function getAccessToken() {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: "general"
    }).toString();

    const options = {
      hostname: "api.hostaway.com",
      path: "/v1/accessTokens",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": body.length
      }
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json.access_token) {
            resolve(json.access_token);
            return;
          }
          reject(new Error(`Failed token: ${data}`));
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function fetchListings(token, limit = 200) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.hostaway.com",
      path: `/v1/listings?limit=${limit}`,
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json.status === "success") {
            resolve(json.result || []);
            return;
          }
          resolve(json.result || []);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

function fetchListing(token, id) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.hostaway.com",
      path: `/v1/listings/${id}`,
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json.result || json);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

function fetchListingCalendar(token, id, startDate, endDate) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    const query = params.toString();
    const options = {
      hostname: "api.hostaway.com",
      path: `/v1/listings/${id}/calendar${query ? `?${query}` : ""}`,
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json.result || json);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

module.exports = {
  getAccessToken,
  fetchListings,
  fetchListing,
  fetchListingCalendar
};
