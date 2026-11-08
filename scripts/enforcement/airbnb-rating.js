"use strict";

// The Airbnb rating line on home cards. Sawyer approved it on 2026-11-07:
// the real Airbnb rating to one decimal with standard rounding (no floor),
// labelled as Airbnb, and "New" until a home has the minimum review count.
// Only the rounded value reaches the page; the raw two-decimal value stays in
// src/_data/airbnbRatings.json.

const snapshot = require("../../src/_data/airbnbRatings.json");

function airbnbRatingLabel(listingId, data = snapshot) {
  const home = data && data.homes ? data.homes[String(listingId)] : null;
  if (!home) return null;
  const reviews = Number(home.reviews);
  const rating = Number(home.rating);
  if (!Number.isInteger(reviews) || reviews < 0) return null;
  if (reviews < data.minimumReviews) {
    return { isNew: true, text: "New", spoken: "New home, not yet rated on Airbnb" };
  }
  if (!Number.isFinite(rating) || rating <= 0 || rating > 5) return null;
  const rounded = (Math.round(rating * 10) / 10).toFixed(1);
  const noun = reviews === 1 ? "review" : "reviews";
  return {
    isNew: false,
    rating: rounded,
    reviews,
    text: `${rounded} · ${reviews} Airbnb ${noun}`,
    spoken: `Rated ${rounded} out of 5 from ${reviews} Airbnb ${noun}`
  };
}

module.exports = { airbnbRatingLabel };
