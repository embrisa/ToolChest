import { Tool, Tag } from '@prisma/client';

// Mock tool data using the new schema structure
export const mockToolsWithTranslationKeys = [
    {
        id: '1',
        toolKey: 'base64',
        slug: 'base64',
        nameKey: 'tools.base64.name',
        descriptionKey: 'tools.base64.description',
        isActive: true,
        isFeatured: true,
        iconClass: 'base64-icon',
        displayOrder: 1,
        usageCount: 100,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: '2',
        toolKey: 'hash-generator',
        slug: 'hash-generator',
        nameKey: 'tools.hash-generator.name',
        descriptionKey: 'tools.hash-generator.description',
        isActive: true,
        isFeatured: false,
        iconClass: 'hash-icon',
        displayOrder: 2,
        usageCount: 75,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: '3',
        toolKey: 'favicon-generator',
        slug: 'favicon-generator',
        nameKey: 'tools.favicon-generator.name',
        descriptionKey: 'tools.favicon-generator.description',
        isActive: true,
        isFeatured: false,
        iconClass: 'favicon-icon',
        displayOrder: 3,
        usageCount: 50,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: '4',
        toolKey: 'markdown-to-pdf',
        slug: 'markdown-to-pdf',
        nameKey: 'tools.markdown-to-pdf.name',
        descriptionKey: 'tools.markdown-to-pdf.description',
        isActive: true,
        isFeatured: false,
        iconClass: 'pdf-icon',
        displayOrder: 4,
        usageCount: 25,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
];

// Mock tag data using the new schema structure
export const mockTagsWithTranslationKeys = [
    {
        id: '1',
        tagKey: 'encoding',
        slug: 'encoding',
        nameKey: 'tags.encoding.name',
        descriptionKey: 'tags.encoding.description',
        iconClass: 'encoding-icon',
        displayOrder: 1,
        isActive: true,
        createdAt: new Date('2024-01-01'),
    },
    {
        id: '2',
        tagKey: 'security',
        slug: 'security',
        nameKey: 'tags.security.name',
        descriptionKey: 'tags.security.description',
        iconClass: 'security-icon',
        displayOrder: 2,
        isActive: true,
        createdAt: new Date('2024-01-01'),
    },
    {
        id: '3',
        tagKey: 'design',
        slug: 'design',
        nameKey: 'tags.design.name',
        descriptionKey: 'tags.design.description',
        iconClass: 'design-icon',
        displayOrder: 3,
        isActive: true,
        createdAt: new Date('2024-01-01'),
    },
    {
        id: '4',
        tagKey: 'document',
        slug: 'document',
        nameKey: 'tags.document.name',
        descriptionKey: 'tags.document.description',
        iconClass: 'document-icon',
        displayOrder: 4,
        isActive: true,
        createdAt: new Date('2024-01-01'),
    }
];

// Mock translated tools (with name/description added by translation service)
export const mockTranslatedTools = {
    en: [
        {
            ...mockToolsWithTranslationKeys[0],
            name: 'Base64 Encoder/Decoder',
            description: 'Encode and decode Base64 strings easily',
            tags: [{
                ...mockTagsWithTranslationKeys[0],
                name: 'Encoding',
                description: 'Text and data encoding tools',
                color: '#3B82F6',
                updatedAt: new Date('2024-01-01')
            }]
        },
        {
            ...mockToolsWithTranslationKeys[1],
            name: 'Hash Generator',
            description: 'Generate MD5, SHA1, SHA256 and other hashes',
            tags: [{
                ...mockTagsWithTranslationKeys[1],
                name: 'Security',
                description: 'Security and cryptography tools',
                color: '#EF4444',
                updatedAt: new Date('2024-01-01')
            }]
        },
        {
            ...mockToolsWithTranslationKeys[2],
            name: 'Favicon Generator',
            description: 'Generate favicons for your website',
            tags: [{
                ...mockTagsWithTranslationKeys[2],
                name: 'Design',
                description: 'Design and graphics tools',
                color: '#8B5CF6',
                updatedAt: new Date('2024-01-01')
            }]
        },
        {
            ...mockToolsWithTranslationKeys[3],
            name: 'Markdown to PDF',
            description: 'Convert Markdown documents to PDF',
            tags: [{
                ...mockTagsWithTranslationKeys[3],
                name: 'Document',
                description: 'Document processing tools',
                color: '#10B981',
                updatedAt: new Date('2024-01-01')
            }]
        }
    ],
    es: [
        {
            ...mockToolsWithTranslationKeys[0],
            name: 'Herramienta Base64',
            description: 'Codifica y decodifica cadenas Base64 fácilmente',
            tags: [{
                ...mockTagsWithTranslationKeys[0],
                name: 'Codificación',
                description: 'Herramientas de codificación de texto y datos',
                color: '#3B82F6',
                updatedAt: new Date('2024-01-01')
            }]
        },
        {
            ...mockToolsWithTranslationKeys[1],
            name: 'Generador de Hash',
            description: 'Genera hashes MD5, SHA1, SHA256 y otros',
            tags: [{
                ...mockTagsWithTranslationKeys[1],
                name: 'Seguridad',
                description: 'Herramientas de seguridad y criptografía',
                color: '#EF4444',
                updatedAt: new Date('2024-01-01')
            }]
        }
    ],
    fr: [
        {
            ...mockToolsWithTranslationKeys[0],
            name: 'Outil Base64',
            description: 'Encodez et décodez facilement les chaînes Base64',
            tags: [{
                ...mockTagsWithTranslationKeys[0],
                name: 'Encodage',
                description: 'Outils d\'encodage de texte et de données',
                color: '#3B82F6',
                updatedAt: new Date('2024-01-01')
            }]
        },
        {
            ...mockToolsWithTranslationKeys[1],
            name: 'Générateur de Hash',
            description: 'Générez des hachages MD5, SHA1, SHA256 et autres',
            tags: [{
                ...mockTagsWithTranslationKeys[1],
                name: 'Sécurité',
                description: 'Outils de sécurité et de cryptographie',
                color: '#EF4444',
                updatedAt: new Date('2024-01-01')
            }]
        }
    ]
};

// Mock translated tags
export const mockTranslatedTags = {
    en: [
        {
            ...mockTagsWithTranslationKeys[0],
            name: 'Encoding',
            description: 'Text and data encoding tools',
            toolCount: 2,
            color: '#3B82F6',
            updatedAt: new Date('2024-01-01')
        },
        {
            ...mockTagsWithTranslationKeys[1],
            name: 'Security',
            description: 'Security and cryptography tools',
            toolCount: 1,
            color: '#EF4444',
            updatedAt: new Date('2024-01-01')
        },
        {
            ...mockTagsWithTranslationKeys[2],
            name: 'Design',
            description: 'Design and graphics tools',
            toolCount: 1,
            color: '#8B5CF6',
            updatedAt: new Date('2024-01-01')
        },
        {
            ...mockTagsWithTranslationKeys[3],
            name: 'Document',
            description: 'Document processing tools',
            toolCount: 1,
            color: '#10B981',
            updatedAt: new Date('2024-01-01')
        }
    ],
    es: [
        {
            ...mockTagsWithTranslationKeys[0],
            name: 'Codificación',
            description: 'Herramientas de codificación de texto y datos',
            toolCount: 2,
            color: '#3B82F6',
            updatedAt: new Date('2024-01-01')
        },
        {
            ...mockTagsWithTranslationKeys[1],
            name: 'Seguridad',
            description: 'Herramientas de seguridad y criptografía',
            toolCount: 1,
            color: '#EF4444',
            updatedAt: new Date('2024-01-01')
        }
    ],
    fr: [
        {
            ...mockTagsWithTranslationKeys[0],
            name: 'Encodage',
            description: 'Outils d\'encodage de texte et de données',
            toolCount: 2,
            color: '#3B82F6',
            updatedAt: new Date('2024-01-01')
        },
        {
            ...mockTagsWithTranslationKeys[1],
            name: 'Sécurité',
            description: 'Outils de sécurité et de cryptographie',
            toolCount: 1,
            color: '#EF4444',
            updatedAt: new Date('2024-01-01')
        }
    ]
};

// Mock service responses
export const createMockServiceResponse = (locale: string = 'en') => ({
    tools: mockTranslatedTools[locale as keyof typeof mockTranslatedTools] || mockTranslatedTools.en,
    tags: mockTranslatedTags[locale as keyof typeof mockTranslatedTags] || mockTranslatedTags.en,
});

// V2 with proper key lookup
const allTranslations: any = {
    en: {
        'tools.base64.name': 'Base64 Encoder/Decoder',
        'tools.base64.description': 'Encode and decode Base64 strings easily',
        'tools.hash-generator.name': 'Hash Generator',
        'tools.hash-generator.description': 'Generate MD5, SHA1, SHA256 and other hashes',
        'tools.favicon-generator.name': 'Favicon Generator',
        'tools.favicon-generator.description': 'Generate favicons for your website',
        'tools.markdown-to-pdf.name': 'Markdown to PDF',
        'tools.markdown-to-pdf.description': 'Convert Markdown documents to PDF',
        'tools.test-tool.name': 'Test Tool',
        'tools.test-tool.description': 'Test description',
        'tags.encoding.name': 'Encoding',
        'tags.encoding.description': 'Text and data encoding tools',
        'tags.security.name': 'Security',
        'tags.security.description': 'Security and cryptography tools',
        'tags.design.name': 'Design',
        'tags.design.description': 'Design and graphics tools',
        'tags.document.name': 'Document',
        'tags.document.description': 'Document processing tools',
        'tags.test-tag.name': 'Test Tag',
        'tags.test-tag.description': 'Test tag description',
    },
    es: {
        'tools.base64.name': 'Herramienta Base64',
        'tools.base64.description': 'Codifica y decodifica cadenas Base64 fácilmente',
        'tools.hash-generator.name': 'Generador de Hash',
        'tools.hash-generator.description': 'Genera hashes MD5, SHA1, SHA256 y otros',
        'tools.test-tool.name': 'Herramienta de Prueba',
        'tools.test-tool.description': 'Descripción de prueba',
        'tags.encoding.name': 'Codificación',
        'tags.encoding.description': 'Herramientas de codificación de texto y datos',
        'tags.security.name': 'Seguridad',
        'tags.security.description': 'Herramientas de seguridad y criptografía',
        'tags.test-tag.name': 'Etiqueta de Prueba',
        'tags.test-tag.description': 'Descripción de etiqueta de prueba',
    },
    fr: {
        'tools.base64.name': 'Outil Base64',
        'tools.base64.description': 'Encodez et décodez facilement les chaînes Base64',
        'tools.hash-generator.name': 'Générateur de Hash',
        'tools.hash-generator.description': 'Générez des hachages MD5, SHA1, SHA256 et autres',
        'tools.test-tool.name': 'Outil de Test',
        'tools.test-tool.description': 'Description de test',
        'tags.encoding.name': 'Encodage',
        'tags.encoding.description': 'Outils d\'encodage de texte et de données',
        'tags.security.name': 'Sécurité',
        'tags.security.description': 'Outils de sécurité et de cryptographie',
        'tags.test-tag.name': 'Tag de Test',
        'tags.test-tag.description': 'Description de tag de test',
    }
};

const createTranslatedToolV2 = (tool: any, locale: string = 'en') => {
    if (!tool) return null;
    const localeTranslations = allTranslations[locale] || allTranslations.en;
    return {
        ...tool,
        name: localeTranslations[tool.nameKey] || tool.nameKey,
        description: localeTranslations[tool.descriptionKey] || tool.descriptionKey,
    };
};

const createTranslatedTagV2 = (tag: any, locale: string = 'en') => {
    if (!tag) return null;
    const localeTranslations = allTranslations[locale] || allTranslations.en;
    return {
        ...tag,
        name: localeTranslations[tag.nameKey] || tag.nameKey,
        description: localeTranslations[tag.descriptionKey] || tag.descriptionKey,
    };
};

// Mock DatabaseTranslationService for tests
export const mockDatabaseTranslationService = {
    translateTool: jest.fn().mockImplementation((tool: any, locale: string = 'en') => {
        const result = createTranslatedToolV2(tool, locale);
        return Promise.resolve(result);
    }),
    translateTools: jest.fn().mockImplementation((tools: any[], locale: string = 'en') =>
        Promise.resolve(tools.map(tool => createTranslatedToolV2(tool, locale)))
    ),
    translateTag: jest.fn().mockImplementation((tag: any, locale: string = 'en') => {
        const result = createTranslatedTagV2(tag, locale);
        return Promise.resolve(result);
    }),
    translateTags: jest.fn().mockImplementation((tags: any[], locale: string = 'en') =>
        Promise.resolve(tags.map(tag => createTranslatedTagV2(tag, locale)))
    ),
};

// Mock locale extraction utility
export const mockLocaleUtils = {
    extractLocaleFromRequest: jest.fn().mockReturnValue('en'),
    getDefaultRouteLocale: jest.fn().mockReturnValue('en'),
    isValidLocale: jest.fn().mockImplementation((locale: string) => ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'].includes(locale)),
    parseAcceptLanguage: jest.fn().mockReturnValue('en'),
}; 