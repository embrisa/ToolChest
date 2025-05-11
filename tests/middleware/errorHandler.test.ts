// Tests for Error Handling Middleware
import { createApp } from '../../src/app'; // Assuming your Express app is exported from src/app.ts
import request from 'supertest';

const app = createApp();

describe('Error Handling Middleware', () => {
    // TODO: Test 404 handler for unknown routes
    test('should return 404 for non-existent routes (HTML)', async () => {
        const response = await request(app).get('/this-route-surely-does-not-exist');
        expect(response.status).toBe(404);
        expect(response.headers['content-type']).toMatch(/html/);
        // You might want to add more specific assertions here,
        // e.g., checking for specific text in the 404 page
        // expect(response.text).toContain('Page Not Found');
    });

    test('should return 404 for non-existent routes (HTMX)', async () => {
        const response = await request(app)
            .get('/this-route-surely-does-not-exist-htmx')
            .set('HX-Request', 'true');
        expect(response.status).toBe(404);
        // Assuming the HTMX error response might be HTML but specific to an error component
        expect(response.headers['content-type']).toMatch(/html/);
        // TODO: Check for a specific error message component structure or class if applicable
        // e.g., expect(response.text).toMatch(/<div class="error-message">.*Not Found.*<\/div>/s);
        // For now, let's assume a simple text check might be part of it, or a specific htmx response header
    });

    // TODO: Test main error handler with a simulated error
    describe('Simulated Server Errors', () => {
        // Temporarily add a route that throws an error
        beforeAll(() => {
            app.get('/test-error', (req, res, next) => {
                next(new Error('Test server error'));
            });
        });

        test('should return 500 for general server errors (HTML)', async () => {
            const response = await request(app).get('/test-error');
            expect(response.status).toBe(500);
            expect(response.headers['content-type']).toMatch(/html/);
            // TODO: Check for specific content in the 500 error page
            // expect(response.text).toContain('Internal Server Error');
        });

        test('should return 500 for general server errors (HTMX with error-message component)', async () => {
            const response = await request(app)
                .get('/test-error') // Use the same error-throwing route
                .set('HX-Request', 'true');
            expect(response.status).toBe(500);
            expect(response.headers['content-type']).toMatch(/html/);
            // TODO: Check for the HTMX error message component
            // expect(response.text).toMatch(/<div class="error-message">.*Server Error.*<\/div>/s);
        });
    });

    // TODO: Test specific error types (e.g., bad request)
    describe('Simulated Bad Request Errors', () => {
        beforeAll(() => {
            // Middleware to simulate an error that should result in a 400
            app.get('/test-bad-request', (req, res, next) => {
                const err = new Error('Test bad request');
                // @ts-ignore // Add a property to identify this as a client error for the handler
                err.status = 400;
                next(err);
            });
        });

        test('should return 400 for bad requests (HTML)', async () => {
            const response = await request(app).get('/test-bad-request');
            expect(response.status).toBe(400);
            expect(response.headers['content-type']).toMatch(/html/);
            // TODO: Check for specific content in the 400 error page
            // expect(response.text).toContain('Bad Request');
        });

        test('should return 400 for bad requests (HTMX with error-message component)', async () => {
            const response = await request(app)
                .get('/test-bad-request') // Use the same bad-request-simulating route
                .set('HX-Request', 'true');
            expect(response.status).toBe(400);
            expect(response.headers['content-type']).toMatch(/html/);
            // TODO: Check for the HTMX error message component for bad requests
            // expect(response.text).toMatch(/<div class="error-message">.*Bad Request.*<\/div>/s);
        });
    });
}); 