import assert from "node:assert/strict";
import { test } from "node:test";
import { fromDateInput, toDateInput } from "../client/date";

test("a stored date is narrowed to what the date field can show", () => {
  assert.equal(toDateInput("2025-09-10"), "2025-09-10");
  assert.equal(toDateInput("1970-01-01 00:00:00"), "1970-01-01");
  assert.equal(toDateInput(undefined), "");
  assert.equal(toDateInput(""), "");
  assert.equal(toDateInput("いつか"), "");
});

test("a date the author did not touch keeps its time", () => {
  // The bug this guards: the field can only hold the day, so saving a post
  // dated "1970-01-01 00:00:00" would otherwise quietly drop the time.
  assert.equal(
    fromDateInput("1970-01-01", "1970-01-01 00:00:00"),
    "1970-01-01 00:00:00",
  );
  assert.equal(fromDateInput("2025-09-10", "2025-09-10"), "2025-09-10");
});

test("changing the day replaces the whole value", () => {
  assert.equal(
    fromDateInput("1970-01-02", "1970-01-01 00:00:00"),
    "1970-01-02",
  );
  assert.equal(fromDateInput("2026-09-21", undefined), "2026-09-21");
});

test("clearing the field removes the key", () => {
  assert.equal(fromDateInput("", "2025-09-10"), undefined);
  assert.equal(fromDateInput("", undefined), undefined);
});
