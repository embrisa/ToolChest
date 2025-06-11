const { NextResponse } = require('next/server');

module.exports = {
    __esModule: true,
    // Mock useTranslations to return realistic translations
    useTranslations: (namespace) => (key) => {
        // Define translation mappings for common keys
        const translations = {
            'components.layout.header.navigation.tools': 'All Tools',
            'components.layout.header.navigation.about': 'About',
            // Add other common translations as needed
        };

        const fullKey = `${namespace}.${key}`;
        return translations[fullKey] || fullKey;
    },
    // Mock NextIntlClientProvider to simply render children
    NextIntlClientProvider: ({ children }) => children,
    // Mock createIntlMiddleware to return a dummy function
    createIntlMiddleware: () => (request) => {
        // Return a proper NextResponse
        return NextResponse.next();
    },
    // Default export for the middleware
    default: () => (request) => {
        return NextResponse.next();
    },
}; 