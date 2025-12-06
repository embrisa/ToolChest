/// <reference lib="webworker" />

import { markdownToPdfService } from "@/services/tools/markdownToPdfService";
import type {
  MarkdownOptions,
  MarkdownParseResult,
} from "@/types/tools/markdownToPdf";

type WorkerRequest = {
  id: number;
  content: string;
  options?: MarkdownOptions;
};

type WorkerResponse = {
  id: number;
  success: boolean;
  result?: MarkdownParseResult;
  error?: string;
};

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { id, content, options } = event.data;

  try {
    const result = markdownToPdfService.parseMarkdown(content, options);
    const response: WorkerResponse = { id, success: true, result };
    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      id,
      success: false,
      error:
        error instanceof Error ? error.message : "Markdown parse failed in worker",
    };
    self.postMessage(response);
  }
};

export {};

