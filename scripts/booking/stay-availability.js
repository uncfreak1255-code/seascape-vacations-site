const LISTINGS = Object.freeze([
  { slug: "dockside-dreams", id: "206016" },
  { slug: "the-oasis", id: "189511" },
  { slug: "sarasota-luxe", id: "135881" },
  { slug: "river-house", id: "135880" },
  { slug: "bradenton-pool-home", id: "487798" },
  { slug: "blue-house", id: "589288" }
]);

const DATE_STAMP = /^\d{4}-\d{2}-\d{2}$/;
const MAX_NIGHTS = 60;

function parseStamp(value) {
  if (!DATE_STAMP.test(value || "")) return null;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return date;
}

function addDays(stamp, days) {
  return new Date(Date.parse(`${stamp}T00:00:00Z`) + days * 86400000).toISOString().slice(0, 10);
}

function nightCount(arrive, depart) {
  return Math.round((Date.parse(`${depart}T00:00:00Z`) - Date.parse(`${arrive}T00:00:00Z`)) / 86400000);
}

function isOpenDay(day) {
  if (!day) return false;
  const available = day.isAvailable === 1 || day.isAvailable === true;
  if (!available) return false;
  return !day.status || day.status === "available";
}

function isClosed(value) {
  return value === 1 || value === true;
}

function evaluateStay(days, arrive, depart) {
  const nights = nightCount(arrive, depart);
  if (!Number.isFinite(nights) || nights < 1) {
    return { bookable: false, reason: "invalid-dates", minimumStay: null };
  }

  const byDate = new Map((Array.isArray(days) ? days : []).map((day) => [day.date, day]));
  const arrival = byDate.get(arrive);
  if (!arrival) return { bookable: false, reason: "no-calendar", minimumStay: null };

  const minimumStay = Number(arrival.minimumStay) || null;
  if (!isOpenDay(arrival)) return { bookable: false, reason: "booked", minimumStay };
  if (isClosed(arrival.closedOnArrival)) return { bookable: false, reason: "closed-arrival", minimumStay };

  for (let offset = 0; offset < nights; offset += 1) {
    if (!isOpenDay(byDate.get(addDays(arrive, offset)))) {
      return { bookable: false, reason: "booked", minimumStay };
    }
  }

  if (minimumStay && minimumStay > nights) {
    return { bookable: false, reason: "minimum-stay", minimumStay };
  }

  const departure = byDate.get(depart);
  if (departure && isClosed(departure.closedOnDeparture)) {
    return { bookable: false, reason: "closed-departure", minimumStay };
  }

  return { bookable: true, reason: null, minimumStay };
}

function validateRange(arrive, depart) {
  if (!parseStamp(arrive) || !parseStamp(depart) || depart <= arrive) {
    return { ok: false, error: "invalid-dates" };
  }

  const nights = nightCount(arrive, depart);
  if (nights > MAX_NIGHTS) return { ok: false, error: "range-too-long" };
  return { ok: true, nights };
}

function summarizeStay(calendarsBySlug, arrive, depart) {
  return LISTINGS.map((listing) => {
    const result = evaluateStay(calendarsBySlug[listing.slug] || [], arrive, depart);
    return {
      slug: listing.slug,
      bookable: result.bookable,
      reason: result.reason,
      minimumStay: result.minimumStay
    };
  });
}

module.exports = {
  LISTINGS,
  MAX_NIGHTS,
  addDays,
  evaluateStay,
  nightCount,
  summarizeStay,
  validateRange
};
