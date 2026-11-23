// Photo lightbox (docs/design/photo-lightbox.md): the script for src/_includes/partials/photo-lightbox.njk.
// It opens the dialog as a modal, switches rooms, and on a wide screen steps the large photo,
// taking focus and the rail's scroll along with the picked small photo.
// Escape, the Close button and the return of focus are the browser's own. It holds no words:
// every label it shows is printed by the partial. A page with no lightbox is left alone.
(function () {
  "use strict";

  // State is { room, photo }: the room on show and the photo picked, counted across every room.
  // `counts` is the number of photos in each room, in order.
  function firstOf(counts, room) {
    var before = 0;
    for (var i = 0; i < room; i += 1) before += counts[i];
    return before;
  }

  function roomOf(counts, photo) {
    var room = 0;
    var end = counts[0];
    while (photo >= end && room < counts.length - 1) {
      room += 1;
      end += counts[room];
    }
    return room;
  }

  function pickRoom(counts, room) {
    return { room: room, photo: firstOf(counts, room) };
  }

  function pickPhoto(counts, photo) {
    return { room: roomOf(counts, photo), photo: photo };
  }

  // Wraps from the last photo of the last room to the first photo of the first.
  function stepPhoto(counts, photo, delta) {
    var total = firstOf(counts, counts.length);
    return pickPhoto(counts, (photo + delta + total) % total);
  }

  function nextRoom(counts, room) {
    return pickRoom(counts, (room + 1) % counts.length);
  }

  function list(root, selector) {
    return Array.prototype.slice.call(root.querySelectorAll(selector));
  }

  function bind(dialog) {
    var rooms = list(dialog, "[data-plb-room]");
    var panels = list(dialog, "[data-plb-panel]");
    var photos = list(dialog, "[data-plb-photo]");
    var counts = panels.map(function (panel) { return panel.querySelectorAll("[data-plb-photo]").length; });
    var feed = dialog.querySelector("[data-plb-feed]");
    var nextButton = dialog.querySelector("[data-plb-next-room]");
    var stage = dialog.querySelector("[data-plb-stage]");
    var stageLink = stage && stage.querySelector("a");
    var stageImage = stage && stage.querySelector("img");
    var stageLabel = dialog.querySelector("[data-plb-stage-label]");
    var stagePosition = dialog.querySelector("[data-plb-stage-position]");
    var view = dialog.ownerDocument && dialog.ownerDocument.defaultView;
    var state = { room: 0, photo: 0 };
    var wide = false;
    if (!photos.length) return null;

    // The stage is laid out only on a wide screen; narrower, the photos are a feed of links.
    function staged() {
      return Boolean(stage && stage.getClientRects().length);
    }

    // Keeps the picked small photo inside the feed's own box. Only the feed scrolls, never the page.
    function reveal(link) {
      var box = feed.getBoundingClientRect();
      var at = link.getBoundingClientRect();
      if (at.top < box.top) feed.scrollTop -= box.top - at.top + 8;
      else if (at.bottom > box.bottom) feed.scrollTop += at.bottom - box.bottom + 8;
    }

    function render(next) {
      var roomChanged = next.room !== state.room;
      var link = photos[next.photo];
      var image = link.querySelector("img");
      var active = dialog.ownerDocument && dialog.ownerDocument.activeElement;
      // Focus on a small photo goes with the pick. Left behind, it would sit in a room that is
      // now hidden: the browser drops it to the page, and the arrow keys stop reaching the dialog.
      var follow = next.photo !== state.photo && photos.indexOf(active) !== -1;
      state = next;
      wide = staged();
      rooms.forEach(function (button, i) { button.setAttribute("aria-pressed", i === state.room ? "true" : "false"); });
      panels.forEach(function (panel, i) { panel.hidden = i !== state.room; });
      photos.forEach(function (photo, i) {
        if (wide && i === state.photo) photo.setAttribute("aria-current", "true");
        else photo.removeAttribute("aria-current");
      });
      if (nextButton && rooms[state.room]) nextButton.textContent = rooms[state.room].getAttribute("data-plb-next");
      if (roomChanged && feed) feed.scrollTop = 0;
      if (follow) link.focus();
      if (wide && feed) reveal(link);
      if (!wide || !stageLink || !stageImage) return;
      stageLink.setAttribute("href", link.getAttribute("href"));
      ["srcset", "src", "alt", "width", "height"].forEach(function (name) {
        var value = image && image.getAttribute(name);
        if (value === null || value === undefined) stageImage.removeAttribute(name);
        else stageImage.setAttribute(name, value);
      });
      if (stageLabel) stageLabel.textContent = link.getAttribute("data-plb-label") || "";
      if (stagePosition) stagePosition.textContent = link.getAttribute("data-plb-position") || "";
    }

    dialog.addEventListener("click", function (event) {
      var target = event.target;
      var hit = function (selector) { return target && target.closest ? target.closest(selector) : null; };
      var room = hit("[data-plb-room]");
      var step = hit("[data-plb-step]");
      var photo = hit("[data-plb-photo]");
      if (room) render(pickRoom(counts, rooms.indexOf(room)));
      else if (hit("[data-plb-next-room]")) render(nextRoom(counts, state.room));
      else if (step) render(stepPhoto(counts, state.photo, Number(step.getAttribute("data-plb-step"))));
      else if (photo && staged() && !event.button && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
        // On a wide screen a small photo picks the large one. Any other click follows the link to the file.
        event.preventDefault();
        render(pickPhoto(counts, photos.indexOf(photo)));
      }
    });

    dialog.addEventListener("keydown", function (event) {
      var delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (!delta || !staged() || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      render(stepPhoto(counts, state.photo, delta));
    });

    // A turned tablet moves between the two layouts with the dialog open: draw the one it lands in.
    if (view && view.addEventListener) {
      view.addEventListener("resize", function () {
        if (dialog.open && staged() !== wide) render(state);
      });
    }

    return {
      open: function () {
        if (!dialog.open) dialog.showModal();
        render(state);
      }
    };
  }

  // An opener stays hidden unless its dialog can open, so the page's own photo links stay the way in.
  function start(doc) {
    var dialogs = [];
    var bound = [];
    list(doc, "[data-plb-open]").forEach(function (opener) {
      var dialog = doc.getElementById(opener.getAttribute("data-plb-open"));
      if (!dialog || typeof dialog.showModal !== "function") return;
      var at = dialogs.indexOf(dialog);
      if (at === -1) {
        at = dialogs.push(dialog) - 1;
        bound.push(bind(dialog));
      }
      if (!bound[at]) return;
      opener.addEventListener("click", bound[at].open);
      opener.hidden = false;
    });
  }

  if (typeof module === "object" && module.exports) {
    module.exports = { firstOf: firstOf, roomOf: roomOf, pickRoom: pickRoom, pickPhoto: pickPhoto, stepPhoto: stepPhoto, nextRoom: nextRoom, start: start };
  } else if (typeof document === "object" && document) {
    start(document);
  }
})();
