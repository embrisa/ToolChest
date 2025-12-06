"use client";

import { useEffect } from "react";

const OFFLINE_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_OFFLINE_CACHE !== "false" &&
  process.env.NODE_ENV === "production";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!OFFLINE_ENABLED) return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/service-worker.js");
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[offline] service worker registration failed", error);
        }
      }
    };

    void register();
  }, []);

  return null;
}


