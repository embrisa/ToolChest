/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from 'next/server';

describe('Middleware', () => {
    let middleware: (request: NextRequest) => NextResponse;
    let mockIntlMiddleware: jest.Mock;
    let mockCreateIntlMiddleware: jest.Mock;

    beforeEach(async () => {
        // Reset module registry to ensure fresh imports
        jest.resetModules();

        // Create fresh mocks for each test
        mockIntlMiddleware = jest.fn(() => NextResponse.next());
        mockCreateIntlMiddleware = jest.fn(() => mockIntlMiddleware);

        // Mock the next-intl/middleware module
        jest.doMock('next-intl/middleware', () => mockCreateIntlMiddleware);

        // Mock the i18n config
        jest.doMock('../../src/i18n/config', () => ({
            locales: ['en', 'es', 'fr'],
            defaultLocale: 'en',
        }));

        // Dynamically import the middleware after setting up mocks
        middleware = (await import('../../middleware.js')).default;
    });

    afterEach(() => {
        jest.dontMock('next-intl/middleware');
        jest.dontMock('../../src/i18n/config');
    });

    it('should call the intl middleware with the request', () => {
        const request = new NextRequest('http://localhost:3000/en/tools');

        middleware(request);

        expect(mockCreateIntlMiddleware).toHaveBeenCalledWith({
            locales: ['en', 'es', 'fr'],
            defaultLocale: 'en',
            localePrefix: 'always',
            localeDetection: true,
        });
        expect(mockIntlMiddleware).toHaveBeenCalledWith(request);
    });

    it('should return the response from the intl middleware', () => {
        const request = new NextRequest('http://localhost:3000/es/tools');

        const response = middleware(request);

        expect(response).toBeInstanceOf(NextResponse);
    });
}); 