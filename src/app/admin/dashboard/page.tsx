import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Dashboard - Admin - tool-chest",
  description: "tool-chest Admin Dashboard",
  robots: "noindex, nofollow",
};

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
  <div className="card p-6 group hover:scale-[1.02] transition-all duration-200">
    <div className="flex items-center space-x-4">
      <div
        className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform duration-200`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400 truncate">
          {title}
        </dt>
        <dd className="text-2xl font-bold text-foreground mt-1">
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
    className="card-interactive p-6 group"
  >
    <div className="flex items-center space-x-4">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-neutral-600 dark:text-neutral-400 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/30 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-all duration-200">
          <span className="text-lg">{icon}</span>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-200">
          {title}
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {description}
        </p>
      </div>
    </div>
  </Link>
);

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <h1 className="text-title text-3xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="mt-2 text-body text-neutral-600 dark:text-neutral-400">
          Overview of your tool-chest application performance and analytics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon="🛠️"
          title="Total Tools"
          value={mockStats.totalTools}
          bgColor="bg-gradient-to-br from-brand-500 to-brand-600"
        />
        <StatCard
          icon="🏷️"
          title="Total Tags"
          value={mockStats.totalTags}
          bgColor="bg-gradient-to-br from-success-500 to-success-600"
        />
        <StatCard
          icon="📊"
          title="Total Usage"
          value={mockStats.totalUsage}
          bgColor="bg-gradient-to-br from-warning-500 to-warning-600"
        />
        <StatCard
          icon="📈"
          title="This Month"
          value="+23%"
          bgColor="bg-gradient-to-br from-accent-500 to-accent-600"
        />
      </div>

      {/* Recent Activity */}
      <div className="card overflow-hidden">
        <div className="p-6">
          <h3 className="text-title text-xl font-semibold text-foreground mb-6">
            Tool Usage Overview
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="px-0 py-4 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Tool
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Usage Count
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Change
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {mockStats.recentUsage.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors duration-150"
                  >
                    <td className="px-0 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {item.tool}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">
                      {item.usage.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-success-600 dark:text-success-400">
                      {item.change}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href="/admin/analytics"
                        className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium transition-colors duration-150"
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

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-title text-xl font-semibold text-foreground mb-6">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            href="/admin/tools/create"
            icon="➕"
            title="Add Tool"
            description="Create new tool"
          />
          <QuickActionCard
            href="/admin/tags/create"
            icon="🏷️"
            title="Add Tag"
            description="Create new tag"
          />
          <QuickActionCard
            href="/admin/relationships"
            icon="🔗"
            title="Relationships"
            description="Manage tool-tag links"
          />
          <QuickActionCard
            href="/"
            icon="🔗"
            title="View Site"
            description="Open public site"
            target="_blank"
          />
        </div>
      </div>
    </div>
  );
}
