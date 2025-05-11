import request from 'supertest';
import { createApp } from '../../src/app';
import { Application } from 'express';
import { appContainer as container } from '../../src/config/inversify.config';
import { TYPES } from '../../src/config/types';
import { ToolService } from '../../src/services/toolService';
import { ToolDTO } from '../../src/dto/tool.dto';
import { HomeController } from '../../src/controllers/homeController';

// Define mockPopularTools at a higher scope if it's reused or complex
const mockPopularToolsData: ToolDTO[] = [
    { id: '1', name: 'Mock Tool 1', slug: 'mock-tool-1', description: 'Desc 1', iconClass: 'fas fa-cog', displayOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date(), tags: [], usageCount: 10 },
    { id: '2', name: 'Mock Tool 2', slug: 'mock-tool-2', description: 'Desc 2', iconClass: 'fas fa-wrench', displayOrder: 2, isActive: true, createdAt: new Date(), updatedAt: new Date(), tags: [], usageCount: 5 },
];

// Create a mock ToolService - its methods will be redefined in beforeEach/each test
const mockToolService: jest.Mocked<ToolService> = {
    getAllTools: jest.fn(),
    getToolBySlug: jest.fn(),
    getToolsByTag: jest.fn(),
    getAllTags: jest.fn(),
    getTagBySlug: jest.fn(),
    recordToolUsage: jest.fn(),
    getPopularTools: jest.fn(),
    searchTools: jest.fn(),
    getToolsPaginated: jest.fn(),
    getToolsByTagPaginated: jest.fn(),
};

describe('Home Routes', () => {
    let app: Application;

    beforeEach(() => {
        // It's crucial to reset specific mock implementations if they are set per-test
        // or ensure they are freshly set before app creation.
        // jest.clearAllMocks() called in afterEach will clear call counts etc.
        // Here, we ensure the mockToolService INSTANCE is re-bound, and its methods are fresh jest.fn()

        // Rebind ToolService to our mock implementation
        if (container.isBound(TYPES.ToolService)) {
            container.unbind(TYPES.ToolService);
        }
        // Ensure fresh mocks for each method for every test run before binding
        mockToolService.getPopularTools = jest.fn();
        // ... reset other mockToolService methods if they are used by HomeController or related routes

        container.bind<ToolService>(TYPES.ToolService).toConstantValue(mockToolService);

        // Force re-creation of HomeController with new mocks
        if (container.isBound(TYPES.HomeController)) {
            container.unbind(TYPES.HomeController);
        }
        container.bind<HomeController>(TYPES.HomeController).to(HomeController).inSingletonScope();

        // App is created after the container is configured with the mock for THIS test run
        // app = createApp(); // Moved to be inside each test or after specific mock setup for the test
    });

    afterEach(() => {
        // Reset all mocks (clears call counts, mock implementations to original jest.fn())
        jest.clearAllMocks();
    });

    describe('GET /', () => {
        it('should render home page with popular tools and return 200', async () => {
            mockToolService.getPopularTools.mockResolvedValue([...mockPopularToolsData]);
            app = createApp(); // Create app with this specific mock in place

            const response = await request(app).get('/');

            expect(response.status).toBe(200);
            expect(response.text).toContain('ToolChest');
            expect(response.text).toContain('Mock Tool 1');
            expect(response.text).toContain('mock-tool-1');
            expect(response.text).toContain('Mock Tool 2');
            expect(response.text).toContain('mock-tool-2');
            expect(mockToolService.getPopularTools).toHaveBeenCalledTimes(1);
            expect(mockToolService.getPopularTools).toHaveBeenCalledWith(5);
        });

        it('should return 500 if ToolService fails', async () => {
            mockToolService.getPopularTools.mockRejectedValue(new Error('Service Error'));
            app = createApp(); // Create app with this specific mock in place

            const response = await request(app).get('/');

            expect(response.status).toBe(500);
            expect(response.text).toContain('Server Error');
            // The default error message from errorHandlerMiddleware for non-exposed 500 errors:
            expect(response.text).toContain('An unexpected error occurred. Please try again later.');
            expect(mockToolService.getPopularTools).toHaveBeenCalledTimes(1);
        });
    });
}); 