import type { DashboardSort } from "./dashboardSort";

export const DASHBOARD_SORT_STORAGE_KEY = "lawn:dashboard-sort";

type SortStorage = Pick<Storage, "getItem" | "setItem">;

export function parseDashboardSort(value: unknown): DashboardSort | undefined {
  return value === "alphabetical" || value === "last-uploaded" ? value : undefined;
}

function defaultStorage(): SortStorage | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function readDashboardSortPreference(storage?: SortStorage): DashboardSort {
  const store = storage ?? defaultStorage();
  if (!store) return "last-uploaded";
  try {
    return parseDashboardSort(store.getItem(DASHBOARD_SORT_STORAGE_KEY)) ?? "last-uploaded";
  } catch {
    return "last-uploaded";
  }
}

export function writeDashboardSortPreference(sort: DashboardSort, storage?: SortStorage) {
  const store = storage ?? defaultStorage();
  if (!store) return;
  try {
    store.setItem(DASHBOARD_SORT_STORAGE_KEY, sort);
  } catch {
    // Storage can be unavailable (private mode, quota); sorting still works in-memory.
  }
}
