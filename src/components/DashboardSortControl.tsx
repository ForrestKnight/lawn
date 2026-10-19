import { ArrowDownAZ, Clock3 } from "lucide-react";
import { SegmentedControl } from "@/components/SegmentedControl";
import type { DashboardSort } from "@/lib/dashboardSort";

const options = [
  { value: "last-uploaded", label: "Sort by last uploaded", Icon: Clock3 },
  { value: "alphabetical", label: "Sort alphabetically", Icon: ArrowDownAZ },
] as const;

/** Binary toggle for the two dashboard sort orders. Only two options exist, so
 * this avoids opening a popup just to pick the other one. */
export function DashboardSortControl({
  value,
  onChange,
}: {
  value: DashboardSort;
  onChange: (value: DashboardSort) => void;
}) {
  return (
    <SegmentedControl
      label="Sort projects and videos"
      options={options}
      value={value}
      onChange={onChange}
    />
  );
}
