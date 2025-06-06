import { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.admin.dashboard");

  return {
    title: `${t("title")} - Admin - tool-chest`,
    description: t("description"),
    robots: "noindex, nofollow",
  };
}

// TODO: Replace with actual data fetching in future phases
const mockStats = {
  totalTools: 4,
  totalTags: 8,
  totalUsage: 1250,
  recentUsage: [
    { tool: "Base64 Encoder/Decoder", usage: 450, change: "+12%" },
    { tool: "Hash Generator", usage: 320, change: "+8%" },
    { tool: "Favicon Generator", usage: 280, change: "+15%" },
    { tool: "Markdown to PDF", usage: 200, change: "+5%" },
  ],
};

const StatCard = ({
  icon,
  title,
  value,
  bgColor,
}: {
  icon: string;
  title: string;
  value: string | number;
  bgColor: string;
}) => (
  <div className="card p-8 group hover:scale-[1.02] hover:shadow-medium transition-all duration-200">
    <div className="flex items-center space-x-6">
      <div
        className={`w-16 h-16 ${bgColor} rounded-xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform duration-200 shadow-soft`}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <dt className="text-sm font-medium text-secondary truncate mb-2">
          {title}
        </dt>
        <dd className="text-3xl font-bold text-primary">
          {typeof value === "number" ? value.toLocaleString() : value}
        </dd>
      </div>
    </div>
  </div>
);

const QuickActionCard = ({
  href,
  icon,
  title,
  description,
  target,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  target?: string;
}) => (
  <Link
    href={href}
    target={target}
    rel={target ? "noopener noreferrer" : undefined}
    className="card-interactive p-8 group min-h-[120px] flex items-center"
    aria-label={`${title}: ${description}${target ? " (opens in new tab)" : ""}`}
  >
    <div className="flex items-center space-x-6 w-full">
      <div className="flex-shrink-0">
        <div className="w-14 h-14 bg-neutral-150 rounded-xl flex items-center justify-center text-neutral-600 group-hover:bg-brand-100 group-hover:text-brand-600 transition-all duration-200 shadow-soft group-hover:shadow-medium">
          <span className="text-2xl" aria-hidden="true">
            {icon}
          </span>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-primary group-hover:text-brand-600 transition-colors duration-200 mb-2">
          {title}
        </p>
        <p className="text-sm text-secondary line-clamp-2">{description}</p>
      </div>
    </div>
  </Link>
);

export default async function AdminDashboardPage() {
  const t = await getTranslations("pages.admin.dashboard");

  return (
    <div className="space-y-12 animate-fade-in-up">
      {/* Page Header */}
      <div className="border-b border-neutral-200 pb-8">
        <h1 className="text-4xl font-bold text-primary mb-4">{t("title")}</h1>
        <p className="text-lg text-secondary max-w-3xl">{t("description")}</p>
      </div>

      {/* Stats Grid */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          {t("stats.applicationStats")}
        </h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon="🛠️"
            title={t("stats.totalTools")}
            value={mockStats.totalTools}
            bgColor="bg-gradient-to-br from-brand-500 to-brand-600"
          />
          <StatCard
            icon="🏷️"
            title={t("stats.totalTags")}
            value={mockStats.totalTags}
            bgColor="bg-gradient-to-br from-success-500 to-success-600"
          />
          <StatCard
            icon="📊"
            title={t("stats.totalUsage")}
            value={mockStats.totalUsage}
            bgColor="bg-gradient-to-br from-warning-500 to-warning-600"
          />
          <StatCard
            icon="📈"
            title={t("stats.thisMonth")}
            value="+23%"
            bgColor="bg-gradient-to-br from-accent-500 to-accent-600"
          />
        </div>
      </section>

      {/* Recent Activity */}
      <section aria-labelledby="usage-heading">
        <div className="card overflow-hidden shadow-medium">
          <div className="p-8">
            <h3
              id="usage-heading"
              className="text-2xl font-semibold text-primary mb-8"
            >
              {t("usage.title")}
            </h3>
            <div className="overflow-x-auto">
              <table
                className="min-w-full"
                role="table"
                aria-label="Tool usage statistics"
              >
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th
                      scope="col"
                      className="px-0 py-6 text-left text-xs font-semibold text-secondary uppercase tracking-wider"
                    >
                      {t("usage.table.tool")}
                    </th>
                    <th
                      scope="col"
                      className="px-8 py-6 text-left text-xs font-semibold text-secondary uppercase tracking-wider"
                    >
                      {t("usage.table.usageCount")}
                    </th>
                    <th
                      scope="col"
                      className="px-8 py-6 text-left text-xs font-semibold text-secondary uppercase tracking-wider"
                    >
                      {t("usage.table.change")}
                    </th>
                    <th
                      scope="col"
                      className="px-8 py-6 text-left text-xs font-semibold text-secondary uppercase tracking-wider"
                    >
                      {t("usage.table.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {mockStats.recentUsage.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-neutral-50 transition-colors duration-150"
                    >
                      <td className="px-0 py-6 whitespace-nowrap text-base font-medium text-primary">
                        {item.tool}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-base text-secondary">
                        {item.usage.toLocaleString()}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-base font-medium text-success-600">
                        {item.change}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-base">
                        <Link
                          href="/admin/analytics"
                          className="text-brand-600 hover:text-brand-700 font-medium transition-colors duration-150 underline underline-offset-4 hover:underline-offset-2"
                          aria-label={`View detailed analytics for ${item.tool}`}
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section aria-labelledby="actions-heading">
        <div className="card p-8 shadow-medium">
          <h3
            id="actions-heading"
            className="text-2xl font-semibold text-primary mb-8"
          >
            {t("quickActions.title")}
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <QuickActionCard
              href="/admin/tools/create"
              icon="➕"
              title={t("quickActions.addTool")}
              description={t("quickActions.createToolDescription")}
            />
            <QuickActionCard
              href="/admin/tags/create"
              icon="🏷️"
              title={t("quickActions.addTag")}
              description={t("quickActions.createTagDescription")}
            />
            <QuickActionCard
              href="/admin/relationships"
              icon="🔗"
              title={t("quickActions.manageRelationships")}
              description={t("quickActions.manageRelationshipsDescription")}
            />
            <QuickActionCard
              href="/"
              icon="🔗"
              title={t("quickActions.viewSite")}
              description={t("quickActions.viewSiteDescription")}
              target="_blank"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
