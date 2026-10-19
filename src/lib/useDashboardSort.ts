import { useCallback, useState } from "react";
import type { DashboardSort } from "./dashboardSort";
import {
  readDashboardSortPreference,
  writeDashboardSortPreference,
} from "./dashboardSortPreference";

/** Sort order shared by the team and project pages, restored from localStorage
 * so navigating Back (or remounting) keeps the order the user last picked. */
export function useDashboardSort() {
  const [sort, setSortState] = useState<DashboardSort>(() => readDashboardSortPreference());

  const setSort = useCallback((next: DashboardSort) => {
    setSortState(next);
    writeDashboardSortPreference(next);
  }, []);

  return [sort, setSort] as const;
}
