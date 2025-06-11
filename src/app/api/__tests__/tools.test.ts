/**
 * @jest-environment node
 */

// Mock the dependencies, but we will control them manually
jest.mock('@/services/tools/toolService');
jest.mock('@/utils/locale');
jest.mock('@/services/core/serviceFactory');

import { NextRequest } from 'next/server';
import { GET } from '../tools/route';
import { ToolService } from '@/services/tools/toolService';
import { extractLocaleFromRequest } from '@/utils/locale';
import { ServiceFactory } from '@/services/core/serviceFactory';

describe('/api/tools', () => {
    // Define a reusable mock for the service's return value
    const mockTools = [{ id: '1', name: 'Mock Tool' }];

    beforeEach(() => {
        // Reset mocks before each test to ensure isolation
        jest.clearAllMocks();

        // Mock the ServiceFactory to return a mock Prisma client
        (ServiceFactory.getInstance as jest.Mock).mockReturnValue({
            getPrisma: () => ({
                // Mock Prisma client - not needed since we're mocking ToolService
            }),
        });

        // Mock the ToolService constructor to return a mock service
        (ToolService as jest.MockedClass<typeof ToolService>).mockImplementation(() => ({
            getAllTools: jest.fn().mockResolvedValue(mockTools),
            getAllToolsPaginated: jest.fn().mockResolvedValue({ tools: mockTools, total: mockTools.length }),
            getPopularTools: jest.fn().mockResolvedValue(mockTools),
            getToolsByTag: jest.fn().mockResolvedValue(mockTools),
        } as any));

        // Mock the locale extractor
        (extractLocaleFromRequest as jest.Mock).mockReturnValue('en');
    });

    it('should return a 200 OK status and the correct data', async () => {
        // Arrange
        const request = new NextRequest('http://localhost:3000/api/tools');

        // Act
        const response = await GET(request);
        const body = await response.json();

        // Assert
        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toEqual(mockTools);
    });

    it('should extract the locale from the request', async () => {
        // Arrange
        const request = new NextRequest('http://localhost:3000/api/tools?locale=es');

        // Act
        await GET(request);

        // Assert
        expect(extractLocaleFromRequest).toHaveBeenCalledWith(request);
    });

    it('should return a 500 error if the service fails', async () => {
        // Arrange: configure the mock to throw an error
        const errorMessage = 'Database connection failed';

        // Mock the ToolService constructor to throw an error
        (ToolService as jest.MockedClass<typeof ToolService>).mockImplementation(() => ({
            getAllTools: jest.fn().mockRejectedValue(new Error(errorMessage)),
            getAllToolsPaginated: jest.fn().mockRejectedValue(new Error(errorMessage)),
            getPopularTools: jest.fn().mockRejectedValue(new Error(errorMessage)),
            getToolsByTag: jest.fn().mockRejectedValue(new Error(errorMessage)),
        } as any));

        const request = new NextRequest('http://localhost:3000/api/tools');

        // Act
        const response = await GET(request);
        const body = await response.json();

        // Assert
        expect(response.status).toBe(500);
        expect(body.success).toBe(false);
        expect(body.error).toBe('Failed to fetch tools');
    });
}); 