import { useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Icon-only single-choice toggle, built as a radiogroup with a roving tabindex
 * and Arrow/Home/End keys. Each option's label is its accessible name and tooltip. */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string; Icon: LucideIcon }[];
  value: T;
  onChange: (value: NoInfer<T>) => void;
}) {
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const currentIndex = options.findIndex((option) => option.value === value);
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % options.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + options.length) % options.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = options.length - 1;
    }
    if (nextIndex === undefined) return;
    event.preventDefault();
    onChange(options[nextIndex].value);
    optionRefs.current[nextIndex]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className="flex flex-shrink-0 items-center border-2 border-(--border-subtle) p-0.5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--accent)]"
    >
      {options.map((option, index) => {
        const selected = value === option.value;
        const { Icon } = option;
        return (
          <button
            key={option.value}
            ref={(element) => {
              optionRefs.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.label}
            title={option.label}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex h-8 w-8 items-center justify-center transition-colors focus-visible:outline-none",
              selected
                ? "bg-[#1a1a1a] text-[#f0f0e8]"
                : "text-[#888] hover:bg-[#e8e8e0] hover:text-[#1a1a1a]",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
