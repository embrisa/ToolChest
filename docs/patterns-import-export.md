# Unified Import/Export UI

This project now includes reusable components for consistent import (text/file) and export (copy/download) interactions across tools.

Use these to standardize UI/UX, accessibility, and behavior.

## ImportPanel

- Path: `@/components/ui/ImportPanel`
- Modes: `text` and `file` with a toggle.
- Features: drag-and-drop upload, click-to-select, paste-from-clipboard, 10MB size cap (configurable), inline validation errors, large-input/file hints, accessible labels.

Props:
- `mode`: "text" | "file" (controlled)
- `onModeChange(mode)`
- `textValue`, `onTextChange(value)`
- `onFileSelect(file)`
- `accept?`, `maxSizeMB?`, `placeholder?`, `title?`, `description?`, `textareaRows?`, `disabled?`
- `modes?`: limit visible modes (default `['text','file']`)
- `showPasteButton?`: show/hide the "Paste from clipboard" button (default `true`)
- `className?`: wrapper className
- `largeHintThresholdMB?`: show a hint when size ≥ this threshold (default `5`)
- `onValidationChange?(errors)`: receives a structured error list when validation changes
- `onAnnounce?(message, kind)` for a11y live announcements

Example:

```tsx
const [mode, setMode] = useState<"text" | "file">("text");
<ImportPanel
  mode={mode}
  onModeChange={setMode}
  textValue={input}
  onTextChange={setInput}
  onFileSelect={async (file) => setInput(await file.text())}
  accept=".json,.xml,.csv,.yaml,.yml,.txt"
  maxSizeMB={10}
  largeHintThresholdMB={5}
  title="Input"
  description="Paste text or upload a file"
  onValidationChange={(errors) => setErrors(errors)}
/>;
```

## CopyExportBar

- Path: `@/components/ui/CopyExportBar`
- Actions: Copy, Copy raw, Copy JSON, Download (shown based on provided values).
- Works inside or outside `ResultsPanel`.

Props:
- `value?`: string (pretty display to copy)
- `rawValue?`: string (unformatted)
- `jsonValue?`: unknown (stringified with 2 spaces)
- `filename?`, `mimeType?`, `onDownloadData?()` (returns Blob/string/ArrayBuffer/Uint8Array)
- `disabled?`, `compact?`, `labels?`, `onAnnounce?(message, kind)`

Example:

```tsx
<ResultsPanel title="Output" result={output}>
  <CopyExportBar
    value={output}
    rawValue={output}
    jsonValue={tryParseJSON(output)}
    filename="converted.json"
    mimeType="application/json;charset=utf-8"
  />
</ResultsPanel>
```

## Clipboard Hook

- Path: `@/hooks/useClipboard`
- `copyText(text)`, `copyJSON(value, pretty)`, `copyRaw(text)` → `{ success, message }`

## i18n TODOs

- ImportPanel messages to localize:
  - Buttons: "Paste from clipboard", "Clear"
  - Counters and tips: "{n} characters", "Tip: You can also paste a file here.", "Supported: {types} • Max {size}MB"
  - Hints: "Large input (~{mb} MB). Processing may take a moment.", "Large file detected (~{mb} MB). Reading may take a moment..."
  - Errors: "Validation Errors", "File too large: {mb} MB (max {max} MB)", "Text input too large: {mb} MB (max {max} MB)"
- CopyExportBar messages to localize (for reference):
  - Actions/feedback: "Copy", "Copy raw", "Copy JSON", "Download", "Copied!"

## Notes

- Keep all processing client-side; large files still respect 10MB max.
- Announcements: pass `onAnnounce` to integrate with your tool’s `AriaLiveRegion`.
- Prefer these components for all tools to reduce duplication and ensure accessibility parity.
