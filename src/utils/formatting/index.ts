/**
 * Format a number of bytes into a human readable string.
 */
export function formatBytes(bytes: number, decimals = 0): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format a date using Intl.DateTimeFormat.
 */
export function formatDate(
  date: Date | string,
  locale = "en-US",
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, { ...options }).format(d);
}
