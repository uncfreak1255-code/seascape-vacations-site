// Keep included-heat assertions beside the smoke entry point without growing its file-size budget.
function validateIncludedPoolHeat(path, body, requireIncludes, requireExcludes) {
  if (path === "/properties/relaxing-oasis/") {
    const pageCopy = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    requireIncludes(path, pageCopy, [
      "Pool heat is included with every stay at Relaxing Oasis, at no extra charge.",
      "Water temperature depends on the weather and is not guaranteed."
    ]);
    requireExcludes(path, pageCopy, [
      "$40", "$280", "For new bookings", "Already-confirmed heat-included",
      "Optional extras, such as pool heat"
    ]);
  }
  if (path === "/stays/vacation-rentals-with-pool-and-hot-tub/") {
    const pageCopy = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    requireIncludes(path, pageCopy, ["At Relaxing Oasis, pool heat comes with every stay at no extra charge."]);
  }
}

module.exports = validateIncludedPoolHeat;
