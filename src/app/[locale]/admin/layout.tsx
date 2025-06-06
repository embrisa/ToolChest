"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useTranslations("pages.admin.navigation");

  const navigationItems = [
    { name: t("dashboard"), href: "/admin/dashboard", icon: "📊" },
    { name: t("tools"), href: "/admin/tools", icon: "🛠️" },
    { name: t("tags"), href: "/admin/tags", icon: "🏷️" },
    { name: t("relationships"), href: "/admin/relationships", icon: "🔗" },
    { name: t("analytics"), href: "/admin/analytics", icon: "📈" },
    { name: t("monitoring"), href: "/admin/monitoring", icon: "👁️" },
  ];

  const isActiveLink = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    document.cookie =
      "admin-auth=; path=/admin; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/admin/auth";
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-neutral-50 border-b border-neutral-200 shadow-soft">
        <div className="container-wide">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-12">
              <Link
                href="/admin/dashboard"
                className="text-2xl font-bold text-primary hover:text-brand-600 transition-colors duration-200"
                aria-label="tool-chest Admin Dashboard Home"
              >
                tool-chest Admin
              </Link>

              <nav
                className="hidden lg:flex space-x-2"
                role="navigation"
                aria-label="Admin navigation"
              >
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px]",
                      isActiveLink(item.href)
                        ? "bg-brand-50 text-brand-600 shadow-soft border border-brand-200"
                        : "text-neutral-600 hover:text-primary hover:bg-neutral-100 border border-transparent hover:border-neutral-200",
                    )}
                    aria-current={isActiveLink(item.href) ? "page" : undefined}
                  >
                    <span className="text-base" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-secondary hover:text-primary text-sm font-medium px-6 py-3 rounded-lg hover:bg-neutral-100 transition-all duration-200 border border-neutral-200 hover:border-neutral-300 min-h-[44px] flex items-center space-x-2"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View public site (opens in new tab)"
              >
                <span className="hidden sm:inline">{t("viewSite")}</span>
                <span className="text-base" aria-hidden="true">
                  🔗
                </span>
              </Link>

              <Button
                variant="danger"
                size="md"
                onClick={handleLogout}
                className="text-sm min-h-[44px]"
                aria-label="Logout from admin panel"
              >
                <span className="hidden sm:inline">{t("logout")}</span>
                <span className="sm:hidden text-base" aria-hidden="true">
                  🚪
                </span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav
        className="lg:hidden bg-neutral-50 border-b border-neutral-200"
        role="navigation"
        aria-label="Mobile admin navigation"
      >
        <div className="container-wide py-4">
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 min-h-[44px] border",
                  isActiveLink(item.href)
                    ? "bg-brand-50 text-brand-600 border-brand-200 shadow-soft"
                    : "text-neutral-600 hover:text-primary hover:bg-neutral-100 border-neutral-200 hover:border-neutral-300",
                )}
                aria-current={isActiveLink(item.href) ? "page" : undefined}
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Admin Content */}
      <main className="container-wide section-spacing-md" role="main">
        {children}
      </main>
    </div>
  );
}
