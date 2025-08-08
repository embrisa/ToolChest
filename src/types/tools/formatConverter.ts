export type DataFormat = "json" | "xml" | "csv" | "yaml";

export interface FormatConverterResult {
  success: boolean;
  output?: string;
  error?: string;
  processingTime: number;
}
