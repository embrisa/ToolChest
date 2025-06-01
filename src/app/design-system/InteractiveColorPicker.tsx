"use client";

import { ColorPicker } from "@/components/ui/ColorPicker";

export function InteractiveColorPicker() {
  return (
    <ColorPicker
      value="#0ea5e9"
      onChange={(color) => console.log("Color changed:", color)}
      label="Brand Color Picker"
      allowCustom
    />
  );
}
