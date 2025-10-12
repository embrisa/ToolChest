"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  Alert,
  ResultsPanel,
  ImportPanel,
  CopyExportBar,
} from "@/components/ui";
import { FormatConverterService } from "@/services/tools/formatConverterService";
import { DataFormat } from "@/types/tools/formatConverter";
import { cn } from "@/utils";

export function FormatConverterTool() {
  const tCommon = useTranslations("tools.common");
  const tUnits = useTranslations("common");
  const t = useTranslations("tools.format-converter");

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [fromFormat, setFromFormat] = useState<DataFormat>("json");
  const [toFormat, setToFormat] = useState<DataFormat>("xml");
  const [error, setError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<"text" | "file">("text");

  const handleConvert = () => {
    const result = FormatConverterService.convert(input, fromFormat, toFormat);
    if (result.success) {
      setOutput(result.output || "");
      setError(null);
    } else {
      setError(result.error || tCommon("errors.processingFailed"));
      setOutput("");
    }
  };

  const onFileSelect = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      setInput(text);
      // Optionally infer source format from extension
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "json") setFromFormat("json");
      else if (ext === "xml") setFromFormat("xml");
      else if (ext === "csv") setFromFormat("csv");
      else if (ext === "yaml" || ext === "yml") setFromFormat("yaml");
    } catch (e) {
      const msg = e instanceof Error ? e.message : tCommon("errors.processingFailed");
      setError(msg);
    }
  }, [tCommon]);

  return (
    <div className="space-y-6">
      <Card variant="default">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-col flex-1 gap-2">
              <label htmlFor="from-select" className="text-sm font-medium">
                {t("tool.fromLabel")}
              </label>
              <select
                id="from-select"
                value={fromFormat}
                onChange={(e) => setFromFormat(e.target.value as DataFormat)}
                className={cn("input-field", "text-sm")}
              >
                <option value="json">JSON</option>
                <option value="xml">XML</option>
                <option value="csv">CSV</option>
                <option value="yaml">YAML</option>
              </select>
            </div>
            <div className="flex flex-col flex-1 gap-2">
              <label htmlFor="to-select" className="text-sm font-medium">
                {t("tool.toLabel")}
              </label>
              <select
                id="to-select"
                value={toFormat}
                onChange={(e) => setToFormat(e.target.value as DataFormat)}
                className={cn("input-field", "text-sm")}
              >
                <option value="json">JSON</option>
                <option value="xml">XML</option>
                <option value="csv">CSV</option>
                <option value="yaml">YAML</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <ImportPanel
            mode={importMode}
            onModeChange={setImportMode}
            textValue={input}
            onTextChange={setInput}
            onFileSelect={onFileSelect}
            accept=".json,.xml,.csv,.yaml,.yml,.txt"
            maxSizeMB={10}
            title={t("tool.placeholders.input")}
            description={tCommon("ui.placeholders.fileUpload")}
            placeholder={tCommon("ui.placeholders.textInput")}
            labels={{
              textMode: tCommon("ui.inputTypes.text"),
              fileMode: tCommon("ui.inputTypes.file"),
              pasteFromClipboard: tCommon("ui.actions.pasteFromClipboard"),
              clearText: tCommon("ui.actions.clear"),
              characters: tUnits("units.characters"),
              validationErrors: tCommon("validation.invalidInput"),
              filePasteTip: tCommon("ui.placeholders.fileUpload"),
            }}
            fileSubtitle={tCommon("ui.placeholders.fileUpload")}
          />
          <Button onClick={handleConvert} className="w-full">
            {t("tool.actions.convert")}
          </Button>
          {error && <Alert variant="error">{error}</Alert>}
          <ResultsPanel
            title="Output"
            result={output}
            placeholder="Converted output will appear here..."
          >
            <CopyExportBar
              value={output}
              rawValue={output}
              jsonValue={(() => {
                if (toFormat !== "json") return undefined;
                try {
                  return JSON.parse(output);
                } catch {
                  return undefined;
                }
              })()}
              filename={`converted.${toFormat === "yaml" ? "yml" : toFormat}`}
              mimeType={
                toFormat === "json"
                  ? "application/json;charset=utf-8"
                  : toFormat === "xml"
                    ? "application/xml;charset=utf-8"
                    : toFormat === "csv"
                      ? "text/csv;charset=utf-8"
                      : "text/plain;charset=utf-8"
              }
              labels={{
                copy: tCommon("ui.actions.copy"),
                copyRaw: tCommon("ui.actions.copyRaw"),
                copyJSON: tCommon("ui.actions.copyJSON"),
                download: tCommon("ui.actions.download"),
                copied: tCommon("ui.status.copied"),
              }}
          />
          </ResultsPanel>
        </CardContent>
      </Card>
    </div>
  );
}
