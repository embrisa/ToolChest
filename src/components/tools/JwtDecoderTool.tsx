"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Alert,
  Card,
  CardContent,
  CardHeader,
  CopyExportBar,
  ImportPanel,
  ResultBadge,
  ResultsPanel,
  Button,
  AriaLiveRegion,
  useAccessibilityAnnouncements,
} from "@/components/ui";
import { JwtDecoderService } from "@/services/tools/jwtDecoderService";
import { DecodedJwt } from "@/types/tools/jwtDecoder";
import { A11yAnnouncement } from "@/types/tools/base64";

export function JwtDecoderTool() {
  const t = useTranslations("tools.jwt-decoder");
  const tCommon = useTranslations("tools.common");
  const tUnits = useTranslations("common");

  const [token, setToken] = useState("");
  const [result, setResult] = useState<DecodedJwt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState<A11yAnnouncement | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    { code: string; message: string }[]
  >([]);

  const { announceSuccess, announceError, announceWarning } = useAccessibilityAnnouncements();

  const headerJson = useMemo(
    () => (result ? JSON.stringify(result.header, null, 2) : ""),
    [result],
  );
  const payloadJson = useMemo(
    () => (result ? JSON.stringify(result.payload, null, 2) : ""),
    [result],
  );

  const hasValidationErrors = validationErrors.length > 0;

  const handleDecode = () => {
    if (hasValidationErrors) {
      setAnnouncement(announceWarning(t("validation.invalidFormat")));
      return;
    }

    const decodeResult = JwtDecoderService.decode(token);
    setProcessingTime(decodeResult.processingTime);

    if (decodeResult.success) {
      setResult(decodeResult.data);
      setError(null);
      setAnnouncement(announceSuccess(t("tool.status.decoded")));
    } else {
      setResult(null);
      setError(decodeResult.error);
      const messageKey =
        decodeResult.code === "invalid-format"
          ? "validation.invalidFormat"
          : decodeResult.code === "invalid-base64"
            ? "validation.invalidBase64"
            : decodeResult.code === "empty"
              ? "validation.missingToken"
              : "validation.invalidJSON";
      setAnnouncement(announceError(t(messageKey)));
    }
  };

  const handleClear = () => {
    setToken("");
    setResult(null);
    setError(null);
    setProcessingTime(null);
    setValidationErrors([]);
    setAnnouncement(announceSuccess(tCommon("ui.actions.reset")));
  };

  const formatClaim = (value?: number | string | string[]) => {
    if (value === undefined) return null;
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "number") {
      const asDate = new Date(value * 1000);
      if (!Number.isNaN(asDate.getTime())) {
        return `${asDate.toISOString()} (${value})`;
      }
    }
    return `${value}`;
  };

  const claimsMetadata = useMemo(() => {
    if (!result) return [];
    const items: { label: string; value: string }[] = [];
    const { claims } = result;
    if (claims.iss) items.push({ label: "iss", value: `${claims.iss}` });
    if (claims.sub) items.push({ label: "sub", value: `${claims.sub}` });
    if (claims.aud) items.push({ label: "aud", value: formatClaim(claims.aud)! });
    if (claims.exp) items.push({ label: "exp", value: formatClaim(claims.exp)! });
    if (claims.nbf) items.push({ label: "nbf", value: formatClaim(claims.nbf)! });
    if (claims.iat) items.push({ label: "iat", value: formatClaim(claims.iat)! });
    if (claims.jti) items.push({ label: "jti", value: `${claims.jti}` });
    return items;
  }, [result]);

  return (
    <div className="space-y-6">
      <Card variant="default">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-title text-xl font-semibold text-foreground">
                {t("page.title")}
              </h2>
              <p className="text-body text-foreground-secondary">
                {t("page.description")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" onClick={handleDecode} disabled={hasValidationErrors}>
                {t("tool.actions.decode")}
              </Button>
              <Button variant="secondary" onClick={handleClear} disabled={!token.length}>
                {t("tool.actions.clear")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImportPanel
            mode="text"
            modes={["text"]}
            onModeChange={() => {}}
            textValue={token}
            onTextChange={setToken}
            onFileSelect={() => {}}
            maxSizeMB={10}
            largeHintThresholdMB={5}
            placeholder={t("tool.placeholders.token")}
            title={t("tool.labels.tokenInput")}
            description={tCommon("privacy.clientSideNote")}
            labels={{
              textMode: tCommon("ui.inputTypes.text"),
              pasteFromClipboard: tCommon("ui.actions.pasteFromClipboard"),
              clearText: tCommon("ui.actions.clear"),
              characters: tUnits("units.characters"),
              validationErrors: tCommon("validation.invalidInput"),
              filePasteTip: tCommon("ui.placeholders.fileUpload"),
            }}
            onAnnounce={(msg, kind) =>
              setAnnouncement(
                kind === "assertive" ? announceError(msg) : announceSuccess(msg),
              )
            }
            onValidationChange={setValidationErrors}
            textareaRows={6}
          />
          {error && <Alert variant="error">{error}</Alert>}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <ResultsPanel
          title={t("tool.labels.header")}
          result={headerJson}
          placeholder={t("tool.placeholders.headerPlaceholder")}
          metadata={
            processingTime
              ? [
                  {
                    label: t("tool.labels.processingTime"),
                    value: `${processingTime} ms`,
                  },
                ]
              : []
          }
        >
          <CopyExportBar
            value={headerJson}
            jsonValue={result?.header}
            rawValue={result?.raw.header}
            filename="jwt-header.json"
            mimeType="application/json;charset=utf-8"
            labels={{
              copy: tCommon("ui.actions.copy"),
              copyJSON: tCommon("ui.actions.copyJSON"),
              copyRaw: tCommon("ui.actions.copyRaw"),
              download: tCommon("ui.actions.download"),
              copied: tCommon("ui.status.copied"),
            }}
            onAnnounce={(msg, kind) =>
              setAnnouncement(kind === "assertive" ? announceError(msg) : announceSuccess(msg))
            }
          />
        </ResultsPanel>

        <ResultsPanel
          title={t("tool.labels.payload")}
          result={payloadJson}
          metadata={[
            ...claimsMetadata.map((item) => ({
              label: `${t("tool.labels.claims")}: ${item.label}`,
              value: item.value,
            })),
          ]}
        >
          <CopyExportBar
            value={payloadJson}
            jsonValue={result?.payload}
            rawValue={result?.raw.payload}
            filename="jwt-payload.json"
            mimeType="application/json;charset=utf-8"
            labels={{
              copy: tCommon("ui.actions.copy"),
              copyJSON: tCommon("ui.actions.copyJSON"),
              copyRaw: tCommon("ui.actions.copyRaw"),
              download: tCommon("ui.actions.download"),
              copied: tCommon("ui.status.copied"),
            }}
            onAnnounce={(msg, kind) =>
              setAnnouncement(kind === "assertive" ? announceError(msg) : announceSuccess(msg))
            }
          />
        </ResultsPanel>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {t("tool.labels.signature")}
              </h3>
              <p className="text-sm text-foreground-secondary">
                {t("tool.placeholders.signatureNote")}
              </p>
            </div>
            {processingTime !== null && (
              <ResultBadge variant="info">
                {t("tool.labels.processingTime")}: {processingTime}ms
              </ResultBadge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800 bg-background-tertiary p-3 text-sm text-foreground break-all">
            {result?.signature || t("tool.placeholders.signaturePlaceholder")}
          </div>
          <CopyExportBar
            value={result?.signature ?? ""}
            rawValue={result?.raw.signature ?? ""}
            filename="jwt-signature.txt"
            mimeType="text/plain;charset=utf-8"
            labels={{
              copy: tCommon("ui.actions.copy"),
              copyRaw: tCommon("ui.actions.copyRaw"),
              download: tCommon("ui.actions.download"),
              copied: tCommon("ui.status.copied"),
            }}
            onAnnounce={(msg, kind) =>
              setAnnouncement(kind === "assertive" ? announceError(msg) : announceSuccess(msg))
            }
          />
        </CardContent>
      </Card>

      <AriaLiveRegion announcement={announcement} />
    </div>
  );
}

