const HOSTAWAY_PREFIX = "https://hostaway-platform.s3.us-west-2.amazonaws.com/";
const CDN_PREFIX = "https://bookingenginecdn.hostaway.com/";
const PLACEHOLDER_IMAGE = "/images/seascape-og-default.jpg";
const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_FORMATTER = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
const CARD_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", timeZone: "UTC" });

function normalizeImage(url, width = 1600) {
  if (!url || typeof url !== "string") return null;
  const cleanUrl = url.split("?")[0];
  if (cleanUrl.startsWith(CDN_PREFIX)) {
    return `${cleanUrl}?width=${width}&quality=80&format=webp&v=2`;
  }
  if (cleanUrl.startsWith(HOSTAWAY_PREFIX)) {
    return `${CDN_PREFIX}${cleanUrl.slice(HOSTAWAY_PREFIX.length)}?width=${width}&quality=80&format=webp&v=2`;
  }
  return cleanUrl;
}

function parseDateStamp(value) {
  if (!value || typeof value !== "string") return null;
  const stamp = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(stamp)) return null;
  const parsed = new Date(`${stamp}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : stamp;
}

function dateFromStamp(stamp) {
  return new Date(`${stamp}T00:00:00Z`);
}

function toDateStamp(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(stamp, days) {
  return toDateStamp(new Date(dateFromStamp(stamp).getTime() + days * DAY_MS));
}

function truthyAvailability(value) {
  if (value === true || value === 1 || value === "1") return true;
  if (typeof value === "string" && value.toLowerCase() === "true") return true;
  return false;
}

function normalizeNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function normalizeBathroomCount(listing) {
  const fullBathrooms = normalizeNumber(listing.bathrooms ?? listing.bathroomsNumber);
  const guestBathrooms = normalizeNumber(listing.guestBathrooms);

  if (fullBathrooms !== null || guestBathrooms !== null) {
    return (fullBathrooms || 0) + (guestBathrooms || 0);
  }

  return 0;
}

function normalizeCalendarDay(day) {
  if (!day || typeof day !== "object") return null;
  const date = parseDateStamp(day.date || day.startDate || day.calendarDate);
  if (!date) return null;

  let isAvailable = null;
  if (day.isAvailable !== undefined && day.isAvailable !== null) {
    isAvailable = truthyAvailability(day.isAvailable);
  } else if (day.status && typeof day.status === "string") {
    isAvailable = !["blocked", "reserved", "unavailable"].includes(day.status.toLowerCase());
  }

  const desiredUnitsToSell = normalizeNumber(day.desiredUnitsToSell);
  if (desiredUnitsToSell !== null) {
    isAvailable = isAvailable !== false && desiredUnitsToSell > 0;
  }
  if (isAvailable === null) isAvailable = false;

  const minimumStay = normalizeNumber(day.minimumStay ?? day.minStay ?? day.minimumNights);
  const price = normalizeNumber(day.price ?? day.dailyPrice ?? day.basePrice);

  return {
    date,
    isAvailable,
    minimumStay: minimumStay && minimumStay > 0 ? Math.ceil(minimumStay) : 1,
    price: price && price > 0 ? Math.round(price) : null,
    closedOnArrival: truthyAvailability(day.closedOnArrival),
    closedOnDeparture: truthyAvailability(day.closedOnDeparture)
  };
}

function firstTwoMonthKeys(windowStart) {
  const start = dateFromStamp(windowStart);
  return [0, 1].map((offset) => {
    const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + offset, 1));
    return {
      key: date.toISOString().slice(0, 7),
      label: `NIGHTS IN ${MONTH_FORMATTER.format(date).toUpperCase()}`
    };
  });
}

function formatDateLabel(stamp) {
  return CARD_DATE_FORMATTER.format(dateFromStamp(stamp));
}

function averageNightlyRate(days, fallbackPrice) {
  const prices = days.map((day) => day.price).filter((price) => Number.isFinite(price) && price > 0);
  if (prices.length) {
    return Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length);
  }
  return fallbackPrice && fallbackPrice > 0 ? Math.round(fallbackPrice) : null;
}

function findNextAvailable(days, fallbackPrice, preferredNights) {
  for (let index = 0; index < days.length; index += 1) {
    const startDay = days[index];
    if (!startDay.isAvailable || startDay.closedOnArrival) continue;

    let runLength = 0;
    while (days[index + runLength] && days[index + runLength].isAvailable) {
      if (runLength > 0) {
        const expectedDate = addDays(days[index + runLength - 1].date, 1);
        if (days[index + runLength].date !== expectedDate) break;
      }
      runLength += 1;
    }

    const minimumStay = Math.max(1, startDay.minimumStay || 1);
    if (runLength < minimumStay) continue;

    const nights = Math.max(minimumStay, Math.min(preferredNights, runLength));
    const rangeDays = days.slice(index, index + nights);
    const endDate = addDays(startDay.date, nights);
    const rate = averageNightlyRate(rangeDays, fallbackPrice);
    const nightLabel = nights === 1 ? "night" : "nights";

    return {
      startDate: startDay.date,
      endDate,
      label: `${formatDateLabel(startDay.date)} - ${formatDateLabel(endDate)}`,
      nights,
      nightlyRate: rate,
      subcopy: rate
        ? `${nights} ${nightLabel} from $${rate}/night - Direct booking`
        : `${nights} ${nightLabel} - Direct booking`
    };
  }

  return null;
}

function countWeekends(daysByDate, days, monthKeys) {
  return days.reduce((count, day) => {
    const date = dateFromStamp(day.date);
    if (date.getUTCDay() !== 5 || !day.isAvailable || !monthKeys.has(day.date.slice(0, 7))) return count;
    const saturday = daysByDate.get(addDays(day.date, 1));
    return saturday && saturday.isAvailable ? count + 1 : count;
  }, 0);
}

function normalizeAvailability(calendarDays, options = {}) {
  const rawDays = Array.isArray(calendarDays)
    ? calendarDays
    : Array.isArray(calendarDays?.result)
      ? calendarDays.result
      : [];
  const days = rawDays
    .map(normalizeCalendarDay)
    .filter(Boolean)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (!days.length) return null;

  const windowStart = parseDateStamp(options.windowStart) || days[0].date;
  const windowEnd = parseDateStamp(options.windowEnd) || addDays(days[days.length - 1].date, 1);
  const fallbackPrice = normalizeNumber(options.basePrice);
  const preferredNights = Math.max(1, Math.round(normalizeNumber(options.preferredNights) || 7));
  const daysByDate = new Map(days.map((day) => [day.date, day]));
  const calendarMonths = firstTwoMonthKeys(windowStart);
  const monthKeySet = new Set(calendarMonths.map((month) => month.key));
  const monthNights = calendarMonths.map((month) => ({
    label: month.label,
    value: days.filter((day) => day.date.startsWith(month.key) && day.isAvailable).length
  }));
  const nextAvailable = findNextAvailable(days, fallbackPrice, preferredNights);

  return {
    source: "hostaway",
    syncedAt: options.syncedAt || new Date().toISOString(),
    windowStart,
    windowEnd,
    nextAvailable,
    monthNights,
    weekendsLeft: countWeekends(daysByDate, days, monthKeySet)
  };
}

function normalizeListing(listing, slugMap = {}) {
  const images = (listing.listingImages || [])
    .map((img) => normalizeImage(img.url))
    .filter(Boolean);
  const hero = images[0] || PLACEHOLDER_IMAGE;
  const gallery = images.length ? images.slice(0, 10) : [hero];
  const name = listing.name || "Seascape Vacation Rental";
  const slug =
    slugMap[name] ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  return {
    id: String(listing.id),
    slug,
    name,
    city: listing.city || "Bradenton",
    destination: (listing.city || "bradenton").toLowerCase().replace(/\s+/g, "-"),
    bedrooms: listing.bedroomsNumber ?? listing.bedrooms ?? 0,
    bathrooms: normalizeBathroomCount(listing),
    guests: listing.personCapacity ?? listing.guests ?? 0,
    rating: listing.reviewAverageRating ?? null,
    price: { amount: listing.listingPrice || 0, currency: "USD", unit: "night" },
    description: listing.description || "",
    highlights: [],
    amenities: [],
    specs: "",
    bookingUrl: listing.listingUrl || "",
    heroImage: hero,
    gallery,
    status: listing.status || "active",
    updatedAt: listing.updatedAt || new Date().toISOString()
  };
}

module.exports = { normalizeListing, normalizeImage, normalizeAvailability, normalizeBathroomCount };
