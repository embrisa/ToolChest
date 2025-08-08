"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button, Card, CardHeader, CardContent, Alert } from "@/components/ui";
import { FormatConverterService } from "@/services/tools/formatConverterService";
import { DataFormat } from "@/types/tools/formatConverter";
import { cn } from "@/utils";

export function FormatConverterTool() {
  const tCommon = useTranslations("tools.common");
  const t = useTranslations("tools.format-converter");

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [fromFormat, setFromFormat] = useState<DataFormat>("json");
  const [toFormat, setToFormat] = useState<DataFormat>("xml");
  const [error, setError] = useState<string | null>(null);

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
        <CardContent className="space-y-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("tool.placeholders.input")}
            className={cn(
              "input-field h-40 resize-vertical text-code",
              error && "border-error-500",
            )}
            aria-label="Input data"
          />
          <Button onClick={handleConvert} className="w-full">
            {t("tool.actions.convert")}
          </Button>
          {error && <Alert variant="error">{error}</Alert>}
          <textarea
            value={output}
            readOnly
            className="input-field h-40 resize-vertical text-code"
            aria-label="Output data"
          />
        </CardContent>
      </Card>
    </div>
  );
}
