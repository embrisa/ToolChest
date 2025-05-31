import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin Authentication - ToolChest',
    description: 'Admin authentication for ToolChest',
    robots: 'noindex, nofollow',
};

export default async function AdminAuthPage({
    searchParams,
}: {
    searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
    const params = await searchParams;
    const redirectUrl = params.redirect || '/admin/dashboard';
    const error = params.error;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="mb-6">
                        <h1 className="text-center text-2xl font-bold text-gray-900">
                            Admin Access
                        </h1>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Enter the admin token to access the admin area
                        </p>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        Authentication failed
                                    </h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <form action="/api/admin/auth" method="POST" className="space-y-6">
                        <input type="hidden" name="redirect" value={redirectUrl} />

                        <div>
                            <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                                Admin Token
                            </label>
                            <div className="mt-1">
                                <input
                                    id="token"
                                    name="token"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter admin token"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Access Admin
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">or</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <p className="text-xs text-gray-500 text-center">
                                You can also set the cookie manually in dev tools:
                                <br />
                                <code className="text-xs bg-gray-100 px-1 rounded">
                                    {`document.cookie = "admin-auth=YOUR_TOKEN; path=/admin"`}
                                </code>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 