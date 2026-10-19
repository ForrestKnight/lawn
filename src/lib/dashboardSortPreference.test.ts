import assert from "node:assert/strict";
import test from "node:test";
import {
  parseDashboardSort,
  readDashboardSortPreference,
  writeDashboardSortPreference,
} from "./dashboardSortPreference";

function fakeStorage(initial: Record<string, string> = {}) {
  const entries = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => {
      entries.set(key, value);
    },
  };
}

test("parses only known sort values", () => {
  assert.equal(parseDashboardSort("alphabetical"), "alphabetical");
  assert.equal(parseDashboardSort("last-uploaded"), "last-uploaded");
  assert.equal(parseDashboardSort("newest"), undefined);
  assert.equal(parseDashboardSort(null), undefined);
  assert.equal(parseDashboardSort(undefined), undefined);
});

test("reads the stored sort and falls back to last-uploaded", () => {
  assert.equal(
    readDashboardSortPreference(fakeStorage({ "lawn:dashboard-sort": "alphabetical" })),
    "alphabetical",
  );
  assert.equal(readDashboardSortPreference(fakeStorage()), "last-uploaded");
  assert.equal(
    readDashboardSortPreference(fakeStorage({ "lawn:dashboard-sort": "bogus" })),
    "last-uploaded",
  );
});

test("writes the chosen sort so Back restores it", () => {
  const storage = fakeStorage();
  writeDashboardSortPreference("alphabetical", storage);
  assert.equal(readDashboardSortPreference(storage), "alphabetical");
  writeDashboardSortPreference("last-uploaded", storage);
  assert.equal(readDashboardSortPreference(storage), "last-uploaded");
});
