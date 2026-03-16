function toHostawayCdn(url, width = 1200, quality = 82) {
  const value = String(url || "").trim();
  if (!value) return value;

  const cleanValue = value.split("?")[0];

  if (cleanValue.includes("bookingenginecdn.hostaway.com/")) {
    return `${cleanValue}?width=${width}&quality=${quality}&format=webp&v=2`;
  }

  const hostawayPrefix = "https://hostaway-platform.s3.us-west-2.amazonaws.com/";
  if (!cleanValue.startsWith(hostawayPrefix)) {
    return value;
  }

  return `https://bookingenginecdn.hostaway.com/${cleanValue.slice(hostawayPrefix.length)}?width=${width}&quality=${quality}&format=webp&v=2`;
}

function withDerivedFields(property) {
  const listingId = String(property.listingId || property.id);
  const pageUrl = property.pageUrl || `/properties/${property.slug}/`;
  const bookingUrl = property.bookingUrl || `https://book.seascape-vacations.com/listings/${listingId}`;
  const images = (property.images || []).map((image) => toHostawayCdn(image, 1200));
  const image = toHostawayCdn(property.image || images[0], 1200);

  return {
    ...property,
    id: listingId,
    listingId,
    title: property.title || property.name,
    name: property.name || property.title,
    location: property.location || property.city,
    pageUrl,
    bookingUrl,
    image,
    images,
    ogImage: toHostawayCdn(property.ogImage || property.image || images[0], 1200),
    imageThumb: toHostawayCdn(property.image || images[0], 800),
    imagesThumb: images.map((imageUrl) => toHostawayCdn(imageUrl, 400))
  };
}

module.exports = [
  {
    listingId: "206016",
    slug: "dockside-dreams",
    name: "Dockside Dreams",
    city: "Bradenton",
    destination: "bradenton",
    bedrooms: 4,
    bathrooms: 3,
    guests: 12,
    rating: 5.0,
    price: 450,
    image: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-206016-xNIrPl9kvF0vllYFzSL7Lm0Gl4eOGxLIN--wmPlCT3NY-6536bca493945",
    images: [
      "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-206016-xNIrPl9kvF0vllYFzSL7Lm0Gl4eOGxLIN--wmPlCT3NY-6536bca493945",
      "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-206016-wFSIPPqxCQNq7DRmjvRa4hWMguiwZ--ZPrH-85kz44tg-6537ef38c9dcc",
      "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-206016-qerFQ9kyQVA-csAbicSJDGiAGS09YAHR5aenKjaRkM8-6536bca92eb25",
      "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-206016-KrpAyWZVO2m-Kb1t90pR9pj0J0l64Yrg6lsnKpPVGfg-65393ce49d1f9",
      "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-206016-DhDyCeVJqt166EzPmE1KuXbXM76CLXn8NGaq6SsZ2Tk-6537ef3d14870"
    ],
    amenities: ["pool", "waterfront", "dock", "hot-tub"],
    highlights: ["Private Heated Pool & Spa", "Waterfront with Private Dock", "See Dolphins & Manatees Daily"],
    description: "Wake up to stunning water views and watch dolphins play right from your private dock. This magnificent waterfront home features a heated pool and spa, gourmet kitchen, and direct water access.",
    specs: "4 BR · 3 BA · Sleeps 12",
    tags: ["All Stays", "Waterfront", "Private Pool", "Hot Tub"]
  },
  {
    listingId: "189511",
    slug: "the-oasis",
    name: "The Oasis",
    city: "Bradenton",
    destination: "bradenton",
    bedrooms: 5,
    bathrooms: 3,
    guests: 16,
    rating: 5.0,
    price: 550,
    image: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-189511-g2tWgjqFm-DXPRc0ll2k1u87aWIKNZm6tOyz9KhGrnc-64dfdf914c559",
    images: [
      "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-189511-g2tWgjqFm-DXPRc0ll2k1u87aWIKNZm6tOyz9KhGrnc-64dfdf914c559",
      "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-189511-nitpZTl7tc027s3c6fWxtHLNuBZKytwSSjlz4TbXaEQ-64dffd0b4ef94",
      "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-189511-aHV3Wyi83yrNT6dPnJVox7aZjJMatTbxV5jS1pbu3ms-64dffd17771bc",
      "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-189511-1DisjsStArEcF0nSzJh-XT9lpqfg7-Z7WNFMgbYg0Cg-64dfdf9460e52",
      "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-189511-qSgdap0W5mSjCx2pUQ6KxgnnAmE-sIhrzaDZo8XbOz8-64dfde50d9940"
    ],
    amenities: ["pool", "hot-tub", "outdoor-grill", "pet-friendly"],
    highlights: ["Large Pool + 2 Hot Tubs", "Private Mini Golf Course", "Game Room & Fire Pit"],
    description: "The ultimate gathering spot features a massive pool, TWO hot tubs, private mini golf course, pool table, and endless entertainment options.",
    specs: "5 BR · 3 BA · Sleeps 16",
    tags: ["All Stays", "Private Pool", "Hot Tub", "Pet Friendly"]
  },
  {
    listingId: "135881",
    slug: "sarasota-luxe",
    name: "Sarasota Luxe",
    city: "Sarasota",
    destination: "sarasota",
    bedrooms: 4,
    bathrooms: 3,
    guests: 12,
    rating: 5.0,
    price: 425,
    image: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-135881-kgzZJ5KWwcw1HTE3EKwE6qxVSHBXCzEjbQjloKZayik-63ac665e899b2",
    images: [
      "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-135881-kgzZJ5KWwcw1HTE3EKwE6qxVSHBXCzEjbQjloKZayik-63ac665e899b2",
      "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-135881-t5DbFz4bDADk9ZBuWdZqFJuxNIww59-FoJeJIQe89i4-63ac6660bdebb",
      "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-135881-LNvuZCacc--wxX-VR5n-GM446kK5D7ofBixQCFPDJKrM-63c1efb764c08",
      "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-135881-EJs6b2SzYTee6pctl4UmJHYDFajOl3gLB1hpDAjcqsc-63ac66658280e",
      "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-135881-Id38QMMV2--QyP00ncgK10ix3iO4RVKD-ys8opGAP3nM-63c1efc4173cf"
    ],
    amenities: ["pool", "downtown"],
    highlights: ["Downtown Location", "Near St. Armands Circle", "Walk to Shops & Dining"],
    description: "Sophisticated Florida living in downtown Sarasota. Walk to St. Armands Circle, visit the Ringling Museum, then retreat to your private pool oasis.",
    specs: "4 BR · 3 BA · Sleeps 12",
    tags: ["All Stays", "Private Pool", "Downtown"]
  },
  {
    listingId: "135880",
    slug: "river-house",
    name: "River House",
    city: "Bradenton",
    destination: "bradenton",
    bedrooms: 4,
    bathrooms: 3,
    guests: 12,
    rating: 5.0,
    price: 400,
    image: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-135880-O6JS9DHvtg7g5gc5ZAe7--55PGx3-0ELuuNJ4T1dsz7s-67620f804f296",
    images: [
      "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-135880-O6JS9DHvtg7g5gc5ZAe7--55PGx3-0ELuuNJ4T1dsz7s-67620f804f296",
      "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-135880-YlY7PsUCnYVP2gf--uqrLCQV7E-TUJFVcKerFgGH--lR4-686081d8d9c87",
      "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-135880-yp2QUlojDVav8c2aVc9zTs58JeLoxzt-gI3cq4l3EDM-67620f9e8b018",
      "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-135880-8-QJvdTAGfAr9E7NO7wBcH8vG78TeLMO2PabnNWgiSc-67620f8c04395",
      "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-135880-g8wwLrsaItg4FXqddvMHvmC-RqGfMcD5WrwyAWwVv70-67620fe015f64"
    ],
    amenities: ["pool", "spa", "waterfront"],
    highlights: ["Riverfront Setting", "Private Pool & Spa", "Stunning Sunset Views"],
    description: "Escape to this tranquil riverfront retreat featuring a private pool, spa, and game room. Watch stunning sunsets over the water from your private backyard paradise.",
    specs: "4 BR · 3 BA · Sleeps 12",
    tags: ["All Stays", "Waterfront", "Private Pool", "Hot Tub"]
  },
  {
    listingId: "487798",
    slug: "bradenton-pool-home",
    name: "Bradenton Pool Home",
    city: "Bradenton",
    destination: "bradenton",
    bedrooms: 3,
    bathrooms: 4,
    guests: 10,
    rating: 5.0,
    price: 375,
    image: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-487798-V0NBY--NCCpIEyYp6re-PPCPp-D1YJjHS25PWR9-gUzg-6992505e1bcdd",
    images: [
      "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-487798-V0NBY--NCCpIEyYp6re-PPCPp-D1YJjHS25PWR9-gUzg-6992505e1bcdd",
      "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-487798--CoTAPwV0hvXuW3mcx9iojNg3hJ5ebKxlNnXqUgoFyg-6992506fa3f64",
      "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-487798-Ka0RaMAnYa4LN-RPjkghBFtHqdFvSIP4tvCGLrb46q8-69925067b62e6",
      "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-487798-r0210bB-vtw4bazIOU2MEjMnS9rIFzIrnznYwkoRVwQ-699257be03803",
      "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/51916-487798-fveav4RDND6H0n92eYn7UMKyN01TxeUZ6Dr--p9eV-rQ-69925062d8ae5"
    ],
    amenities: ["pool", "spa", "img-academy", "outdoor-grill"],
    highlights: ["Closest Home to IMG Academy", "Heated Pool & Spa", "Outdoor Grill Area"],
    description: "Vacation rental in Bradenton with heated pool, inground spa, outdoor grill area, dual laundry, and kitchenette. Sleeps 10 and sits just 2.6 miles from IMG Academy.",
    specs: "3 BR · 3.5 BA · Sleeps 10",
    tags: ["All Stays", "Private Pool", "Hot Tub"]
  }
].map(withDerivedFields);
