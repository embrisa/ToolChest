'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Admin Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <Link href="/admin/dashboard" className="text-xl font-semibold text-gray-900">
                                ToolChest Admin
                            </Link>
                            <nav className="flex space-x-4">
                                <Link
                                    href="/admin/dashboard"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/admin/dashboard'
                                        ? 'bg-blue-100 text-blue-900'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/admin/tools"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.startsWith('/admin/tools')
                                        ? 'bg-blue-100 text-blue-900'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Tools
                                </Link>
                                <Link
                                    href="/admin/tags"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.startsWith('/admin/tags')
                                        ? 'bg-blue-100 text-blue-900'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Tags
                                </Link>
                                <Link
                                    href="/admin/relationships"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.startsWith('/admin/relationships')
                                        ? 'bg-blue-100 text-blue-900'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Relationships
                                </Link>
                                <Link
                                    href="/admin/analytics"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.startsWith('/admin/analytics')
                                        ? 'bg-blue-100 text-blue-900'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Analytics
                                </Link>
                                <Link
                                    href="/admin/monitoring"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.startsWith('/admin/monitoring')
                                        ? 'bg-blue-100 text-blue-900'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Monitoring
                                </Link>
                            </nav>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Link
                                href="/"
                                className="text-gray-600 hover:text-gray-900 text-sm"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View Site
                            </Link>
                            <button
                                onClick={() => {
                                    document.cookie = 'admin-auth=; path=/admin; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                                    window.location.href = '/admin/auth';
                                }}
                                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Admin Content */}
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
} 