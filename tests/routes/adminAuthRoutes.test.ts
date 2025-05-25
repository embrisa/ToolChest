import 'reflect-metadata';
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import { Container } from 'inversify';
import { TYPES } from '../../src/config/types';
import { AdminAuthController } from '../../src/controllers/adminAuthController';
import { AdminAuthService } from '../../src/services/adminAuthService';
import { AdminUserDTO, AdminRole } from '../../src/dto/adminUserDTO';
import adminAuthRoutes from '../../src/routes/adminAuthRoutes';

describe('Admin Auth Routes', () => {
    let app: express.Application;
    let mockAdminAuthService: jest.Mocked<AdminAuthService>;
    let mockContainer: Container;

    const mockAdminUser: AdminUserDTO = {
        id: 'test-admin-id',
        username: 'testadmin',
        email: 'test@example.com',
        role: AdminRole.ADMIN,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    beforeEach(() => {
        // Create mock service
        mockAdminAuthService = {
            authenticateUser: jest.fn(),
            createAdminUser: jest.fn(),
            hashPassword: jest.fn(),
            verifyPassword: jest.fn(),
            updateLastLoginAt: jest.fn(),
            getAdminUserById: jest.fn(),
            getAdminUserByUsername: jest.fn(),
            isValidSession: jest.fn()
        };

        // Create mock container
        mockContainer = new Container();
        mockContainer.bind<AdminAuthService>(TYPES.AdminAuthService).toConstantValue(mockAdminAuthService);
        mockContainer.bind<AdminAuthController>(TYPES.AdminAuthController).to(AdminAuthController);

        // Setup Express app with session
        app = express();
        app.use(express.urlencoded({ extended: true }));
        app.use(express.json());

        // Configure session for testing
        app.use(session({
            secret: 'test-secret',
            resave: false,
            saveUninitialized: false,
            cookie: {
                maxAge: 3600000 // 1 hour default
            }
        }));

        // Mock Nunjucks rendering
        app.engine('njk', (filePath, options, callback) => {
            // Simple mock that returns the template data as JSON
            // In real tests, you might want to use actual template rendering
            callback(null, JSON.stringify(options));
        });
        app.set('view engine', 'njk');
        app.set('views', 'src/templates');

        // Override container in routes
        const originalGet = mockContainer.get.bind(mockContainer);
        jest.spyOn(mockContainer, 'get').mockImplementation(originalGet);

        // Replace the import with our mock
        const router = express.Router();
        const adminAuthController = mockContainer.get<AdminAuthController>(TYPES.AdminAuthController);

        router.get('/login', adminAuthController.showLogin);
        router.post('/login', adminAuthController.processLogin);
        router.post('/logout', adminAuthController.processLogout);
        router.get('/status', adminAuthController.checkStatus);

        app.use('/admin/auth', router);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /admin/auth/login', () => {
        it('should login successfully without remember me', async () => {
            mockAdminAuthService.authenticateUser.mockResolvedValue(mockAdminUser);
            mockAdminAuthService.updateLastLoginAt.mockResolvedValue();

            const response = await request(app)
                .post('/admin/auth/login')
                .send({
                    username: 'testadmin',
                    password: 'password123'
                })
                .expect(302);

            expect(response.headers.location).toBe('/admin/dashboard');
            expect(mockAdminAuthService.authenticateUser).toHaveBeenCalledWith({
                username: 'testadmin',
                password: 'password123'
            });
            expect(mockAdminAuthService.updateLastLoginAt).toHaveBeenCalledWith(mockAdminUser.id);
        });

        it('should login successfully with remember me checked', async () => {
            mockAdminAuthService.authenticateUser.mockResolvedValue(mockAdminUser);
            mockAdminAuthService.updateLastLoginAt.mockResolvedValue();

            const agent = request.agent(app);
            const response = await agent
                .post('/admin/auth/login')
                .send({
                    username: 'testadmin',
                    password: 'password123',
                    rememberMe: 'true'
                })
                .expect(302);

            expect(response.headers.location).toBe('/admin/dashboard');
            expect(mockAdminAuthService.authenticateUser).toHaveBeenCalledWith({
                username: 'testadmin',
                password: 'password123'
            });

            // Check that session cookie has extended expiration (30 days)
            const cookies = response.headers['set-cookie'];
            expect(cookies).toBeDefined();

            // The session should be saved with extended expiration
            expect(mockAdminAuthService.updateLastLoginAt).toHaveBeenCalledWith(mockAdminUser.id);
        });

        it('should handle remember me with string value', async () => {
            mockAdminAuthService.authenticateUser.mockResolvedValue(mockAdminUser);
            mockAdminAuthService.updateLastLoginAt.mockResolvedValue();

            await request(app)
                .post('/admin/auth/login')
                .send({
                    username: 'testadmin',
                    password: 'password123',
                    rememberMe: 'true' // HTML form sends string values
                })
                .expect(302);

            expect(mockAdminAuthService.authenticateUser).toHaveBeenCalledWith({
                username: 'testadmin',
                password: 'password123'
            });
        });

        it('should handle login without remember me field', async () => {
            mockAdminAuthService.authenticateUser.mockResolvedValue(mockAdminUser);
            mockAdminAuthService.updateLastLoginAt.mockResolvedValue();

            await request(app)
                .post('/admin/auth/login')
                .send({
                    username: 'testadmin',
                    password: 'password123'
                    // rememberMe not included
                })
                .expect(302);

            expect(mockAdminAuthService.authenticateUser).toHaveBeenCalledWith({
                username: 'testadmin',
                password: 'password123'
                // rememberMe should be undefined
            });
        });

        it('should reject invalid credentials with remember me checked', async () => {
            mockAdminAuthService.authenticateUser.mockResolvedValue(null);

            const response = await request(app)
                .post('/admin/auth/login')
                .send({
                    username: 'testadmin',
                    password: 'wrongpassword',
                    rememberMe: 'true'
                })
                .expect(200);

            expect(mockAdminAuthService.authenticateUser).toHaveBeenCalledWith({
                username: 'testadmin',
                password: 'wrongpassword'
            });
            expect(mockAdminAuthService.updateLastLoginAt).not.toHaveBeenCalled();

            // Should render login page with error
            const responseData = JSON.parse(response.text);
            expect(responseData.error).toBe('Invalid username or password');
        });

        it('should handle HTMX login with remember me', async () => {
            mockAdminAuthService.authenticateUser.mockResolvedValue(mockAdminUser);
            mockAdminAuthService.updateLastLoginAt.mockResolvedValue();

            const response = await request(app)
                .post('/admin/auth/login')
                .set('HX-Request', 'true')
                .send({
                    username: 'testadmin',
                    password: 'password123',
                    rememberMe: 'true'
                })
                .expect(200);

            expect(response.headers['hx-redirect']).toBe('/admin/dashboard');
            expect(mockAdminAuthService.authenticateUser).toHaveBeenCalledWith({
                username: 'testadmin',
                password: 'password123'
            });
        });

        it('should require username and password', async () => {
            const response = await request(app)
                .post('/admin/auth/login')
                .send({
                    rememberMe: 'true'
                    // username and password missing
                })
                .expect(200);

            const responseData = JSON.parse(response.text);
            expect(responseData.error).toBe('Username and password are required');
            expect(mockAdminAuthService.authenticateUser).not.toHaveBeenCalled();
        });

        it('should handle authentication service errors', async () => {
            mockAdminAuthService.authenticateUser.mockRejectedValue(new Error('Database connection failed'));

            const response = await request(app)
                .post('/admin/auth/login')
                .send({
                    username: 'testadmin',
                    password: 'password123',
                    rememberMe: 'true'
                })
                .expect(200);

            const responseData = JSON.parse(response.text);
            expect(responseData.error).toBe('Login failed. Please try again.');
        });
    });

    describe('GET /admin/auth/login', () => {
        it('should show login form when not authenticated', async () => {
            const response = await request(app)
                .get('/admin/auth/login')
                .expect(200);

            const responseData = JSON.parse(response.text);
            expect(responseData.title).toBe('Admin Login - ToolChest');
            expect(responseData.layout).toBe('admin/layouts/admin-auth-layout');
            expect(responseData.error).toBeNull();
        });

        it('should redirect to dashboard when already logged in', async () => {
            // First login
            mockAdminAuthService.authenticateUser.mockResolvedValue(mockAdminUser);
            mockAdminAuthService.updateLastLoginAt.mockResolvedValue();

            const agent = request.agent(app);
            await agent
                .post('/admin/auth/login')
                .send({
                    username: 'testadmin',
                    password: 'password123'
                });

            // Then try to access login page
            const response = await agent
                .get('/admin/auth/login')
                .expect(302);

            expect(response.headers.location).toBe('/admin/dashboard');
        });
    });

    describe('POST /admin/auth/logout', () => {
        it('should logout successfully', async () => {
            // First login
            mockAdminAuthService.authenticateUser.mockResolvedValue(mockAdminUser);
            mockAdminAuthService.updateLastLoginAt.mockResolvedValue();

            const agent = request.agent(app);
            await agent
                .post('/admin/auth/login')
                .send({
                    username: 'testadmin',
                    password: 'password123',
                    rememberMe: 'true'
                });

            // Then logout
            const response = await agent
                .post('/admin/auth/logout')
                .expect(302);

            expect(response.headers.location).toBe('/admin/auth/login');
        });

        it('should handle HTMX logout', async () => {
            // First login
            mockAdminAuthService.authenticateUser.mockResolvedValue(mockAdminUser);
            mockAdminAuthService.updateLastLoginAt.mockResolvedValue();

            const agent = request.agent(app);
            await agent
                .post('/admin/auth/login')
                .send({
                    username: 'testadmin',
                    password: 'password123'
                });

            // Then logout with HTMX
            const response = await agent
                .post('/admin/auth/logout')
                .set('HX-Request', 'true')
                .expect(200);

            expect(response.headers['hx-redirect']).toBe('/admin/auth/login');
        });
    });

    describe('GET /admin/auth/status', () => {
        it('should return authentication status when logged in', async () => {
            // First login
            mockAdminAuthService.authenticateUser.mockResolvedValue(mockAdminUser);
            mockAdminAuthService.updateLastLoginAt.mockResolvedValue();

            const agent = request.agent(app);
            await agent
                .post('/admin/auth/login')
                .send({
                    username: 'testadmin',
                    password: 'password123',
                    rememberMe: 'true'
                });

            // Check status
            const response = await agent
                .get('/admin/auth/status')
                .expect(200);

            expect(response.body).toEqual({
                authenticated: true,
                user: {
                    id: mockAdminUser.id,
                    username: mockAdminUser.username,
                    role: mockAdminUser.role
                }
            });
        });

        it('should return unauthenticated status when not logged in', async () => {
            const response = await request(app)
                .get('/admin/auth/status')
                .expect(200);

            expect(response.body).toEqual({
                authenticated: false,
                user: null
            });
        });
    });
}); 