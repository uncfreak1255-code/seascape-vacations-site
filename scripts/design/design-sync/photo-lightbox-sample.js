"use strict";
// The photo lightbox's sample data, for its preview cards and its tests: the fixture's rooms,
// filled from property truth in the shape src/_includes/partials/photo-lightbox.njk takes.
// `read` returns a repo file's text.
module.exports = function photoLightboxSample(read) {
  const fixture = JSON.parse(read("scripts/design/design-sync/photo-lightbox.fixture.json"));
  const home = JSON.parse(read("src/_data/properties-fallback.json")).find((entry) => entry.slug === fixture.home);
  if (!home) throw new Error(`photo-lightbox.fixture.json: no home "${fixture.home}" in property truth`);
  const photo = (number) => {
    const found = home.photography.photos.find((entry) => entry.src.endsWith(`/${number}.webp`));
    if (!found) throw new Error(`photo-lightbox.fixture.json: ${home.name} has no photo ${number}`);
    const size = (suffix) => found.src.replace(/\.webp$/, `${suffix}.webp`);
    return {
      src: found.src,
      srcset: `${size("-160")} 160w, ${size("-800")} 800w, ${found.src} ${found.width}w`,
      alt: found.alt,
      label: found.alt.split(" — ")[1],
      width: found.width,
      height: found.height,
    };
  };
  return {
    id: "plb-sample",
    title: home.name,
    eyebrow: fixture.eyebrow,
    rooms: fixture.rooms.map((room) => ({ name: room.name, photos: room.photos.map(photo) })),
  };
};
