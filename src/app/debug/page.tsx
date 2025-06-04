"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { swrFetcher } from "@/lib/api";
import { ToolDTO } from "@/types/tools/tool";
import { ApiResponse } from "@/types/api/common";

export default function DebugPage() {
  const [mounted, setMounted] = useState(false);
  const [simpleClientTest, setSimpleClientTest] = useState("not set");
  const [directApiData, setDirectApiData] = useState<ApiResponse<
    ToolDTO[]
  > | null>(null);
  const [directApiError, setDirectApiError] = useState<string | null>(null);

  // Simple client-side test to verify React hydration
  useEffect(() => {
    console.log("DebugPage useEffect running");
    setMounted(true);
    setSimpleClientTest("client-side effect ran");
  }, []);

  // Test SWR directly
  const {
    data: swrData,
    error: swrError,
    isLoading: swrLoading,
  } = useSWR<ApiResponse<ToolDTO[]>>("/api/tools", swrFetcher);

  // Direct API test effect
  useEffect(() => {
    if (mounted) {
      fetch("/api/tools")
        .then((res) => res.json())
        .then((data) => setDirectApiData(data))
        .catch((err) => setDirectApiError(err.message));
    }
  }, [mounted]);

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Debug Page</h1>

      <h2>Simple Client Test</h2>
      <p>Client Effect Result: {simpleClientTest}</p>

      <h2>Mounted State</h2>
      <p>Mounted: {mounted.toString()}</p>

      <h2>Direct API Call</h2>
      <pre>{JSON.stringify(directApiData, null, 2)}</pre>
      {directApiError && (
        <p style={{ color: "red" }}>Error: {directApiError}</p>
      )}

      <h2>SWR Test</h2>
      <div>
        <p>SWR Loading: {swrLoading.toString()}</p>
        <p>SWR Error: {swrError?.toString() || "null"}</p>
        <p>SWR Data Length: {swrData?.data?.length || 0}</p>
      </div>

      <h2>SWR Data</h2>
      <pre>{JSON.stringify(swrData?.data || [], null, 2)}</pre>
    </div>
  );
}
