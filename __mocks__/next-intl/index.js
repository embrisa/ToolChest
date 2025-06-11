// Mock translations data structure
const mockTranslations = {
    'pages.home.title': 'Essential Computer Tools',
    'pages.home.description': 'Privacy-focused tools for everyday computing tasks',
    'pages.home.search.placeholder': 'Search tools...',
    'pages.home.search.results': 'Search Results',
    'pages.home.search.resultsCount': '{count} tools found',
    'pages.home.search.noResults': 'No tools found',
    'pages.home.search.noResultsDescription': 'Try adjusting your search or filters',
    'pages.home.filters.clearAll': 'Clear All Filters',
    'pages.home.filters.noToolsForTags': 'No tools found for selected tags',
    'pages.home.stats.title': 'Platform Statistics',
    'pages.home.stats.totalTools': 'Total Tools',
    'pages.home.stats.totalUsage': 'Total Usage',
    'pages.home.stats.activeUsers': 'Active Users',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.retry': 'Retry',
    'common.actions.retry': 'Try Again',
    'components.layout.header.navigation.tools': 'All Tools',
    'components.layout.header.navigation.about': 'About',
    'components.layout.header.title': 'ToolChest',
    'components.layout.header.menu.toggle': 'Toggle menu',
    'components.tools.toolCard.usageCount': '{count} uses',
    'components.tools.searchInput.placeholder': 'Search tools...',
    'components.tools.tagFilter.clearAll': 'Clear All',
    'components.ui.button.loading': 'Loading...',
    'tools.base64.name': 'Base64 Encoder/Decoder',
    'tools.base64.description': 'Encode and decode Base64 strings',
    'tools.hashGenerator.name': 'Hash Generator',
    'tools.hashGenerator.description': 'Generate MD5, SHA-1, SHA-256 hashes',
    'tools.faviconGenerator.name': 'Favicon Generator',
    'tools.faviconGenerator.description': 'Create favicons from images',
    'tools.markdownToPdf.name': 'Markdown to PDF',
    'tools.markdownToPdf.description': 'Convert Markdown to PDF documents',
    'database.tags.encoding': 'Encoding',
    'database.tags.security': 'Security',
    'database.tags.images': 'Images',
    'database.tags.documents': 'Documents',
};

// Mock useTranslations hook
const useTranslations = (namespace = '') => {
    return (key, values = {}) => {
        const fullKey = namespace ? `${namespace}.${key}` : key;
        let translation = mockTranslations[fullKey] || fullKey;

        // Handle interpolation for values like {count}
        if (values && typeof translation === 'string') {
            Object.keys(values).forEach(valueKey => {
                const placeholder = `{${valueKey}}`;
                translation = translation.replace(placeholder, String(values[valueKey]));
            });
        }

        return translation;
    };
};

// Mock useLocale hook
const useLocale = () => 'en';

// Mock useMessages hook
const useMessages = () => mockTranslations;

// Mock NextIntlClientProvider component
const NextIntlClientProvider = ({ children, locale = 'en', messages = mockTranslations }) => {
    return children;
};

// Mock getTranslations for server components
const getTranslations = (namespace = '') => {
    return (key, values = {}) => {
        const fullKey = namespace ? `${namespace}.${key}` : key;
        let translation = mockTranslations[fullKey] || fullKey;

        if (values && typeof translation === 'string') {
            Object.keys(values).forEach(valueKey => {
                const placeholder = `{${valueKey}}`;
                translation = translation.replace(placeholder, String(values[valueKey]));
            });
        }

        return translation;
    };
};

// Mock getLocale for server components
const getLocale = () => 'en';

module.exports = {
    __esModule: true,
    useTranslations,
    useLocale,
    useMessages,
    NextIntlClientProvider,
    getTranslations,
    getLocale,
    // Export the mock translations for test utilities
    mockTranslations,
}; 