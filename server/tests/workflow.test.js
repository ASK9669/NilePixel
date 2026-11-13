
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  canTransition,
  validRejectionReason,
} = require("../utils/workflow");

test("Submitted can become Assigned", () => {
  assert.equal(canTransition("Submitted", "Assigned"), true);
});

test("Submitted can become Rejected", () => {
  assert.equal(canTransition("Submitted", "Rejected"), true);
});

test("Assigned can become In Progress", () => {
  assert.equal(canTransition("Assigned", "In Progress"), true);
});

test("In Progress can become Resolved", () => {
  assert.equal(canTransition("In Progress", "Resolved"), true);
});

test("Draft cannot be assigned directly", () => {
  assert.equal(canTransition("Draft", "Assigned"), false);
});

test("Resolved cannot return to Submitted", () => {
  assert.equal(canTransition("Resolved", "Submitted"), false);
});

test("Rejected cannot become Assigned", () => {
  assert.equal(canTransition("Rejected", "Assigned"), false);
});

test("Unknown status transitions are rejected", () => {
  assert.equal(canTransition("Unknown", "Assigned"), false);
});

test("Valid rejection reason is accepted", () => {
  assert.equal(validRejectionReason("Water point damaged"), true);
});

test("Short rejection reason is rejected", () => {
  assert.equal(validRejectionReason("Bad"), false);
});
