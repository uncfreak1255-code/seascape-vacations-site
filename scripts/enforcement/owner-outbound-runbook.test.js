const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

test("owner outbound archive holds OTA-only research and prevents new platform outreach", () => {
  const archive = read("docs/status/owner-outbound.md");

  assert.match(archive, /^# Owner Outbound$/m);
  assert.match(archive, /research-only archive — HOLD \/ DO NOT SEND/);
  assert.match(archive, /Airbnb- and Vrbo-only host-message paths are \*\*not approved outreach paths\*\*/);
  assert.match(archive, /seven unsent platform-only entries below are \*\*hold \/ do not send\*\*/);
  assert.match(archive, /Public host labels are listing observations, not verified owner identity/);
  assert.match(archive, /never\s+constitutes owner demand/i);
  assert.match(archive, /No existing or future platform-listing observation may be converted into an/);
});

test("owner outbound archive preserves historical sends without making them follow-up authority", () => {
  const archive = read("docs/status/owner-outbound.md");

  assert.match(archive, /three founder-sent benchmark emails were recorded for Kiri,[\s\S]+Megan, and Naomi/);
  assert.match(archive, /2026-06-26 mailbox check documented no newer matching/);
  assert.match(archive, /does not establish permission for later outreach/);
  assert.match(archive, /does not justify a[\s\S]+follow-up on Airbnb, Vrbo, email, or another surface/);
});

test("owner-direct policy accepts only permissioned sources and stores no candidates", () => {
  const policy = read("docs/status/owner-direct-intake-policy.md");

  assert.match(policy, /public policy only - no candidate records - founder review required/);
  assert.match(policy, /named local referral or warm introduction/);
  assert.match(policy, /owner who submitted the Seascape revenue-review or property-management[\s\S]+form/);
  assert.match(policy, /public business or contact page that explicitly invites a relevant inquiry/);
  assert.match(policy, /networking-group or event connection where follow-up permission was[\s\S]+given/);
  assert.match(policy, /direct inbound email, call, text, or referral/);
  assert.match(policy, /A public name alone is not enough/);
  assert.match(policy, /Airbnb, Vrbo, Booking\.com, or other OTA host-message surfaces/);
  assert.match(policy, /scraped, guessed, purchased, or enriched contact data/);
  assert.match(policy, /This repository is public/);
  assert.match(policy, /must never contain a named candidate record/);
  assert.doesNotMatch(policy, /\| Date received \| Owner/);
});

test("owner-direct intake remains manual and does not create demand evidence", () => {
  const archive = read("docs/status/owner-outbound.md");
  const policy = read("docs/status/owner-direct-intake-policy.md");

  assert.match(archive, /Previous platform-message drafts are intentionally retired/);
  assert.match(archive, /founder review before any individual outbound message is even drafted/);
  assert.match(policy, /No outbound message may be drafted, sent, scheduled, automated/);
  assert.match(policy, /do not create a mailbox draft or schedule a message through this repository/);
  assert.match(policy, /do not count a touch, delivery, response absence, or form test as demand/);
  assert.match(archive, /owner-demand-trust-outcome-register\.md/);
  assert.match(archive, /Do not edit the generated[\s\S]+owner-receipt-projection[\s\S]+by hand/);
});

test("next-batch routes the owner sub-gate to permissioned intake instead of OTA outreach", () => {
  const nextBatch = read("docs/status/next-batch.md");

  assert.match(nextBatch, /Owner-Direct Intake Escalation/);
  assert.match(nextBatch, /docs\/status\/owner-direct-intake-policy\.md/);
  assert.match(nextBatch, /do not persist named candidate/);
  assert.match(nextBatch, /do not run an Airbnb, Vrbo, or other OTA outreach batch/i);
  assert.match(nextBatch, /require Sawyer's separate approval/i);
  assert.doesNotMatch(nextBatch, /run this week's owner outbound batch/i);
});

test("current state no longer treats platform listings as outbound permission", () => {
  const currentState = read("docs/status/current-state.md");

  assert.match(currentState, /platform listing or public host label is not contact permission/i);
  assert.match(currentState, /owner-direct, permissioned signal/i);
  assert.match(currentState, /do not build an OTA host-message[\s\S]+or store named candidate state/i);
  assert.match(currentState, /Intake does not authorize a draft or send/i);
  assert.doesNotMatch(currentState, /direct outreach to underperforming Airbnb\/VRBO owners/i);
});
