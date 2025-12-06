/// <reference lib="webworker" />

import { FormatConverterService } from "@/services/tools/formatConverterService";
import type { DataFormat } from "@/types/tools/formatConverter";

type WorkerRequest = {
  id: number;
  input: string;
  fromFormat: DataFormat;
  toFormat: DataFormat;
};

type WorkerResponse = {
  id: number;
  success: boolean;
  output?: string;
  error?: string;
  processingTime?: number;
};

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { id, input, fromFormat, toFormat } = event.data;

  try {
    const result = FormatConverterService.convert(input, fromFormat, toFormat);

    const response: WorkerResponse = {
      id,
      success: result.success,
      output: result.output,
      error: result.error,
      processingTime: result.processingTime,
    };

    self.postMessage(response);
  } catch (error) {
    self.postMessage({
      id,
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown worker conversion error",
    });
  }
};

export {};

