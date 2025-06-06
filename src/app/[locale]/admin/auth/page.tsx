import { Metadata } from "next";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Admin Authentication - tool-chest",
  description: "Admin authentication for tool-chest",
  robots: "noindex, nofollow",
};

export default async function AdminAuthPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const params = await searchParams;
  const redirectUrl = params.redirect || "/admin/dashboard";
  const error = params.error;

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card p-8 animate-fade-in-up">
          <div className="mb-8">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-brand-500 to-accent-500 rounded-2xl mb-4">
                <span className="text-2xl">🔐</span>
              </div>
            </div>
            <h1 className="text-center text-title text-2xl font-bold text-foreground">
              Admin Access
            </h1>
            <p className="mt-3 text-center text-body text-neutral-600 dark:text-neutral-400">
              Enter the admin token to access the admin area
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-error-50 dark:bg-error-950/30 border border-error-200 dark:border-error-800 p-4 mb-6 animate-fade-in-down">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-error-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-error-800 dark:text-error-200">
                    Authentication failed
                  </h3>
                  <div className="mt-2 text-sm text-error-700 dark:text-error-300">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form action="/api/admin/auth" method="POST" className="space-y-6">
            <input type="hidden" name="redirect" value={redirectUrl} />

            <div className="form-group">
              <label htmlFor="token" className="form-label">
                Admin Token
              </label>
              <div className="mt-2">
                <input
                  id="token"
                  name="token"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="input-field"
                  placeholder="Enter admin token"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                className="font-semibold"
              >
                Access Admin
              </Button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200 dark:border-neutral-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white dark:bg-neutral-900 text-neutral-500">
                  or
                </span>
              </div>
            </div>

            <div className="mt-6">
              <div className="surface-glass rounded-xl p-4">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mb-3">
                  You can also set the cookie manually in dev tools:
                </p>
                <code className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 px-3 py-2 rounded-lg font-mono block text-center break-all">
                  {`document.cookie = "admin-auth=YOUR_TOKEN; path=/admin"`}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
