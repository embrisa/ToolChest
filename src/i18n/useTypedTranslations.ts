import { useTranslations as useNextIntlTranslations } from "next-intl";
import type { MessageKeys } from "@/types/i18n/helpers";

/**
 * useTypedTranslations provides compile-time key safety by leveraging the
 * schema type (passed as generic argument) to derive all valid dot-notation
 * keys. Usage:
 *   const t = useTypedTranslations<PagesAdminToolsMessages>("pages.admin.tools");
 *   t("bulkOperations.title"); // ✅  autocompleted & type-checked
 */
export function useTypedTranslations<Schema>(namespace: string) {
  // Cast the runtime translator to our dot-key constrained type.
  return useNextIntlTranslations(namespace) as unknown as (
    key: MessageKeys<Schema>,
    params?: Record<string, unknown>,
  ) => string;
}
