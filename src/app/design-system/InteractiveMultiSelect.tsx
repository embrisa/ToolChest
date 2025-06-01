"use client";

import { MultiSelect } from "@/components/ui/MultiSelect";

interface InteractiveMultiSelectProps {
  options: Array<{
    id: string;
    label: string;
    description: string;
  }>;
}

export function InteractiveMultiSelect({
  options,
}: InteractiveMultiSelectProps) {
  return (
    <MultiSelect
      options={options}
      selectedIds={["1", "5"]}
      onSelectionChange={(ids) => console.log("Selected:", ids)}
      placeholder="Choose frameworks..."
      searchable
      label="Development Frameworks"
      description="Select one or more frameworks you're familiar with"
    />
  );
}
