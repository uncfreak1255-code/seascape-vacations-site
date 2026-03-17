const HOSTAWAY_PREFIX = "https://hostaway-platform.s3.us-west-2.amazonaws.com/";
const CDN_PREFIX = "https://bookingenginecdn.hostaway.com/";
const PLACEHOLDER_IMAGE = "/images/seascape-og-default.jpg";

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
    bathrooms: listing.bathroomsNumber ?? listing.bathrooms ?? 0,
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

module.exports = { normalizeListing, normalizeImage };
