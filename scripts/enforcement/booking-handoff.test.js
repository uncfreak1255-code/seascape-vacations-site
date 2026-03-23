const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");

test("conversion tracking supports post-guide booking handoff events", () => {
  const trackingScript = fs.readFileSync(
    path.join(projectRoot, "src", "assets", "js", "conversion-tracking.js"),
    "utf8"
  );

  for (const eventName of [
    "catalog_book_direct_click",
    "catalog_view_details_click",
    "stay_view_property_click",
    "property_check_availability_click",
    "property_booking_page_click"
  ]) {
    assert.equal(
      trackingScript.includes(eventName),
      true,
      `tracking script missing ${eventName}`
    );
  }
});

test("properties catalog behaves like a buyer handoff surface, not a generic directory", () => {
  const propertiesTemplate = fs.readFileSync(
    path.join(projectRoot, "src", "properties", "index.njk"),
    "utf8"
  );

  assert.equal(propertiesTemplate.includes('data-track-event="catalog_book_direct_click"'), true);
  assert.equal(propertiesTemplate.includes('data-track-event="catalog_view_details_click"'), true);
  assert.equal(propertiesTemplate.includes("Explore Owner Services"), false);
});

test("stay pages push into tracked property actions instead of generic browse escapes", () => {
  const staysTemplate = fs.readFileSync(path.join(projectRoot, "src", "stays", "stays.njk"), "utf8");

  assert.equal(staysTemplate.includes('data-track-event="stay_view_property_click"'), true);
  assert.equal(staysTemplate.includes("View All Properties"), false);
  assert.equal(staysTemplate.includes("Browse All Properties"), false);
  assert.equal(staysTemplate.includes("Ready to Book Your Getaway?"), false);
});

test("top property pages instrument both availability and booking-page handoff CTAs", () => {
  const propertyPages = [
    path.join(projectRoot, "src", "properties", "dockside-dreams", "index.njk"),
    path.join(projectRoot, "src", "properties", "the-oasis", "index.njk"),
    path.join(projectRoot, "src", "properties", "sarasota-luxe", "index.njk"),
    path.join(projectRoot, "src", "properties", "river-house", "index.njk"),
    path.join(projectRoot, "src", "properties", "bradenton-pool-home", "index.njk")
  ];

  for (const file of propertyPages) {
    const source = fs.readFileSync(file, "utf8");
    assert.equal(
      source.includes('data-track-event="property_check_availability_click"'),
      true,
      `${path.basename(path.dirname(file))} missing tracked availability CTA`
    );
    assert.equal(
      source.includes('data-track-event="property_booking_page_click"'),
      true,
      `${path.basename(path.dirname(file))} missing tracked booking-page CTA`
    );
  }
});
