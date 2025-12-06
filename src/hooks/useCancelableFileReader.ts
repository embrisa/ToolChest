"use client";

import { useCallback, useRef } from "react";

export type FileReadProgress = {
  loaded: number;
  total: number;
};

/**
 * Shared FileReader helper that supports progress updates and cancellation.
 * Returns the file contents as text or throws an AbortError when cancelled.
 */
export function useCancelableFileReader() {
  const readerRef = useRef<FileReader | null>(null);

  const cancel = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.abort();
    }
  }, []);

  const readAsText = useCallback(
    (
      file: File,
      options?: {
        onProgress?: (progress: FileReadProgress) => void;
        signal?: AbortSignal;
      },
    ): Promise<string> => {
      // Cancel any in-flight read before starting a new one.
      readerRef.current?.abort();

      const reader = new FileReader();
      readerRef.current = reader;

      return new Promise<string>((resolve, reject) => {
        let removeAbortListener: (() => void) | null = null;

        const cleanup = () => {
          if (removeAbortListener) {
            removeAbortListener();
          }
          if (readerRef.current === reader) {
            readerRef.current = null;
          }
        };

        const handleAbort = () => {
          cleanup();
          reject(new DOMException("Read aborted", "AbortError"));
        };

        reader.onprogress = (event) => {
          if (options?.onProgress) {
            const total =
              event.lengthComputable && event.total > 0
                ? event.total
                : file.size;
            options.onProgress({ loaded: event.loaded, total });
          }
        };

        reader.onload = () => {
          cleanup();
          resolve((reader.result as string) ?? "");
        };

        reader.onerror = () => {
          const error =
            reader.error || new Error("Failed to read file (unknown error)");
          cleanup();
          reject(error);
        };

        reader.onabort = handleAbort;

        if (options?.signal) {
          if (options.signal.aborted) {
            handleAbort();
            return;
          }
          const abortListener = () => reader.abort();
          options.signal.addEventListener("abort", abortListener, {
            once: true,
          });
          removeAbortListener = () =>
            options.signal?.removeEventListener("abort", abortListener);
        }

        reader.readAsText(file);
      });
    },
    [],
  );

  return { readAsText, cancel };
}


