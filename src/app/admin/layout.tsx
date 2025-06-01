"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navigationItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: "📊" },
    { name: "Tools", href: "/admin/tools", icon: "🛠️" },
    { name: "Tags", href: "/admin/tags", icon: "🏷️" },
    { name: "Relationships", href: "/admin/relationships", icon: "🔗" },
    { name: "Analytics", href: "/admin/analytics", icon: "📈" },
    { name: "Monitoring", href: "/admin/monitoring", icon: "👁️" },
  ];

  const isActiveLink = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="navbar sticky top-0 z-50">
        <div className="container-wide">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <Link
                href="/admin/dashboard"
                className="navbar-brand text-xl font-bold"
              >
                tool-chest Admin
              </Link>

              <nav className="hidden md:flex space-x-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "navbar-link flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      isActiveLink(item.href)
                        ? "navbar-link-active bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400"
                        : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50",
                    )}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 text-sm font-medium px-3 py-2 rounded-lg hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-all duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="hidden sm:inline">View Site</span>
                <span className="sm:hidden">🔗</span>
              </Link>

              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  document.cookie =
                    "admin-auth=; path=/admin; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                  window.location.href = "/admin/auth";
                }}
                className="text-sm"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">🚪</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden surface border-b border-neutral-200/50 dark:border-neutral-800/50">
        <div className="container-wide py-2">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200",
                  isActiveLink(item.href)
                    ? "bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400"
                    : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50",
                )}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Admin Content */}
      <main className="container-wide py-8">{children}</main>
    </div>
  );
}
