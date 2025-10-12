"use client";

import { useCallback } from "react";
import { copyText as copyTextUtil, copyJSON as copyJSONUtil } from "@/utils/clipboard";

export type ClipboardCopyResult = {
  success: boolean;
  message: string;
};

export function useClipboard() {
  const copyText = useCallback(async (text: string) => {
    const res = await copyTextUtil(text);
    return { success: res.success, message: res.message };
  }, []);

  const copyJSON = useCallback(async (value: unknown, pretty = true) => {
    const res = await copyJSONUtil(value, pretty);
    return { success: res.success, message: res.message };
  }, []);

  const copyRaw = useCallback(async (text: string) => {
    const res = await copyTextUtil(text);
    return { success: res.success, message: res.message };
  }, []);

  return { copyText, copyJSON, copyRaw };
}
