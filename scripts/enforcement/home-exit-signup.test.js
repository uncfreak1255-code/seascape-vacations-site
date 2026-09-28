const fs = require("fs");
const path = require("path");
const vm = require("vm");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const guestScriptPath = path.join(projectRoot, "src", "assets", "js", "guest.js");
const NOW = Date.parse("2026-09-28T12:00:00.000Z");
const DAY = 24 * 60 * 60 * 1000;

function guestSource() {
  return fs.readFileSync(guestScriptPath, "utf8");
}

function extractExitBlock(source) {
  const start = source.indexOf("var exitSignup = document.querySelector('[data-home-exit-signup]');");
  const end = source.indexOf("var parseTrip = tracking && tracking.readTripParams;");
  assert.notEqual(start, -1, "guest.js must keep the homepage leave-the-page signup block");
  assert.notEqual(end, -1, "guest.js must keep parseTrip immediately after the exit-signup block");
  assert.ok(start < end, "exit-signup block must appear before parseTrip");
  const block = source.slice(start, end);
  assert.match(block, /exitRecentlyShown/, "exit-signup block must keep the cooldown helper");
  assert.doesNotMatch(block, /setTimeout/, "exit-signup block must not become a timed popup");
  return block;
}

function installExitSignup({
  storage = {},
  throwOnGet = false,
  throwOnSet = false,
  matchMediaMatches = true,
  hasShowModal = true,
  hasTracking = true,
  nowMs = NOW
} = {}) {
  const modalShown = [];
  const closed = [];
  const mouseoutHandlers = [];
  const closeButton = {
    addEventListener(type, handler) {
      this.handler = type === "click" ? handler : this.handler;
    }
  };
  const exitSignup = {
    showModal: hasShowModal
      ? function showModal() {
          modalShown.push(true);
        }
      : undefined,
    close() {
      closed.push(true);
    },
    querySelector(selector) {
      return selector === "[data-home-exit-close]" ? closeButton : null;
    },
    addEventListener(type, handler) {
      this.backdrop = type === "click" ? handler : this.backdrop;
    }
  };

  const sandbox = {
    tracking: hasTracking ? {} : null,
    document: {
      querySelector(selector) {
        return selector === "[data-home-exit-signup]" ? exitSignup : null;
      },
      addEventListener(type, handler) {
        if (type === "mouseout") mouseoutHandlers.push(handler);
      },
      removeEventListener(type, handler) {
        if (type === "mouseout") {
          const index = mouseoutHandlers.indexOf(handler);
          if (index !== -1) mouseoutHandlers.splice(index, 1);
        }
      }
    },
    window: {
      matchMedia(query) {
        assert.equal(query, "(hover: hover) and (pointer: fine)");
        return { matches: matchMediaMatches };
      }
    },
    localStorage: {
      getItem(key) {
        if (throwOnGet) throw new Error("storage blocked");
        return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null;
      },
      setItem(key, value) {
        if (throwOnSet) throw new Error("storage blocked");
        storage[key] = String(value);
      }
    },
    Date: { now: () => nowMs }
  };

  vm.runInNewContext(extractExitBlock(guestSource()), sandbox);

  return {
    storage,
    modalShown,
    closed,
    mouseoutHandlers,
    leave(event) {
      for (const handler of [...mouseoutHandlers]) handler(event);
    },
    clickClose() {
      closeButton.handler({ target: closeButton });
    },
    clickBackdrop() {
      exitSignup.backdrop({ target: exitSignup });
    },
    clickDialogChild() {
      exitSignup.backdrop({ target: closeButton });
    }
  };
}

function leaveTowardChrome(session) {
  session.leave({ relatedTarget: null, clientY: -1 });
}

test("empty storage is not treated as a prior signup", () => {
  const session = installExitSignup({ storage: {} });
  assert.equal(session.mouseoutHandlers.length, 1, "desktop visitors with tracking get the leave listener");
  leaveTowardChrome(session);
  assert.equal(session.modalShown.length, 1, "first leave shows the dialog");
  assert.equal(typeof session.storage.seascape_email_popup_shown, "string");
  assert.notEqual(session.storage.seascape_email_popup_shown, "subscribed");
});

test("subscribers never see the leave-the-page signup again", () => {
  const session = installExitSignup({ storage: { seascape_email_popup_shown: "subscribed" } });
  leaveTowardChrome(session);
  assert.deepEqual(session.modalShown, []);
  assert.equal(session.storage.seascape_email_popup_shown, "subscribed");
});

test("the same visitor is not shown again inside seven days", () => {
  const shownAt = String(NOW - 6 * DAY);
  const session = installExitSignup({
    storage: { seascape_email_popup_shown: shownAt },
    nowMs: NOW
  });
  leaveTowardChrome(session);
  assert.deepEqual(session.modalShown, []);
  assert.equal(session.storage.seascape_email_popup_shown, shownAt);
});

test("the dialog can return after seven days if the visitor never subscribed", () => {
  const session = installExitSignup({
    storage: { seascape_email_popup_shown: String(NOW - 8 * DAY) },
    nowMs: NOW
  });
  leaveTowardChrome(session);
  assert.equal(session.modalShown.length, 1);
  assert.equal(session.storage.seascape_email_popup_shown, String(NOW));
});

test("broken localStorage fails closed and never opens the dialog", () => {
  const readSession = installExitSignup({ throwOnGet: true });
  leaveTowardChrome(readSession);
  assert.deepEqual(readSession.modalShown, []);

  const writeSession = installExitSignup({ throwOnSet: true });
  leaveTowardChrome(writeSession);
  assert.deepEqual(writeSession.modalShown, []);
  assert.equal(writeSession.storage.seascape_email_popup_shown, undefined);
});

test("moving between page elements or leaving downward does not open the dialog", () => {
  const related = installExitSignup();
  related.leave({ relatedTarget: {}, clientY: -1 });
  assert.deepEqual(related.modalShown, []);
  assert.equal(related.mouseoutHandlers.length, 1, "a non-leave mouseout keeps the listener");

  const downward = installExitSignup();
  downward.leave({ relatedTarget: null, clientY: 12 });
  assert.deepEqual(downward.modalShown, []);
  assert.equal(downward.mouseoutHandlers.length, 1);
});

test("touch and tracking-less browsers never attach the leave listener", () => {
  const touch = installExitSignup({ matchMediaMatches: false });
  assert.deepEqual(touch.mouseoutHandlers, []);

  const noTracking = installExitSignup({ hasTracking: false });
  assert.deepEqual(noTracking.mouseoutHandlers, []);

  const noDialogApi = installExitSignup({ hasShowModal: false });
  assert.deepEqual(noDialogApi.mouseoutHandlers, []);
});

test("close and backdrop clicks dismiss the dialog without a second leave", () => {
  const session = installExitSignup();
  leaveTowardChrome(session);
  assert.equal(session.modalShown.length, 1);
  assert.equal(session.mouseoutHandlers.length, 0, "leave listener is one-shot");

  session.clickClose();
  session.clickBackdrop();
  session.clickDialogChild();
  assert.deepEqual(session.closed, [true, true]);

  leaveTowardChrome(session);
  assert.equal(session.modalShown.length, 1, "a second leave in the same page load does not reopen it");
});
