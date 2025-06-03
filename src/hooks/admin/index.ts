import { useCallback, useEffect, useState } from "react";

/**
 * Simple hook to track whether the current user has admin mode enabled.
 * The state is persisted in localStorage so it survives page reloads.
 */
export function useAdminMode() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem("admin") === "true");
  }, []);

  const enable = useCallback(() => {
    localStorage.setItem("admin", "true");
    setIsAdmin(true);
  }, []);

  const disable = useCallback(() => {
    localStorage.removeItem("admin");
    setIsAdmin(false);
  }, []);

  return { isAdmin, enable, disable } as const;
}

