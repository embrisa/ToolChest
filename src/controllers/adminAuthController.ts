import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../config/types';
import { AdminAuthService } from '../services/adminAuthService';
import { AdminLoginDTO } from '../dto/adminUserDTO';
import { AdminAuthRequest } from '../middleware/adminAuthMiddleware';

@injectable()
export class AdminAuthController {
    constructor(
        @inject(TYPES.AdminAuthService) private adminAuthService: AdminAuthService
    ) { }

    // GET /admin/auth/login - Show login form
    showLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // If already logged in, redirect to dashboard
            if (req.session?.adminUser) {
                res.redirect('/admin/dashboard');
                return;
            }

            res.render('admin/pages/login', {
                title: 'Admin Login - ToolChest',
                layout: 'admin/layouts/admin-auth-layout',
                error: null
            });
        } catch (error) {
            next(error);
        }
    };

    // POST /admin/auth/login - Process login
    processLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { username, password } = req.body as AdminLoginDTO;

            if (!username || !password) {
                if (req.headers['hx-request']) {
                    res.status(400).set('HX-Retarget', '#login-error').render('admin/components/error-message', {
                        message: 'Username and password are required'
                    });
                } else {
                    res.render('admin/pages/login', {
                        title: 'Admin Login - ToolChest',
                        layout: 'admin/layouts/admin-auth-layout',
                        error: 'Username and password are required'
                    });
                }
                return;
            }

            const adminUser = await this.adminAuthService.authenticateUser({ username, password });

            if (!adminUser) {
                if (req.headers['hx-request']) {
                    res.status(401).set('HX-Retarget', '#login-error').render('admin/components/error-message', {
                        message: 'Invalid username or password'
                    });
                } else {
                    res.render('admin/pages/login', {
                        title: 'Admin Login - ToolChest',
                        layout: 'admin/layouts/admin-auth-layout',
                        error: 'Invalid username or password'
                    });
                }
                return;
            }

            // Update last login time
            await this.adminAuthService.updateLastLoginAt(adminUser.id);

            // Store admin user in session
            req.session.adminUser = adminUser;

            if (req.headers['hx-request']) {
                res.set('HX-Redirect', '/admin/dashboard').send();
            } else {
                res.redirect('/admin/dashboard');
            }
        } catch (error) {
            next(error);
        }
    };

    // POST /admin/auth/logout - Process logout
    processLogout = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Session destroy error:', err);
                }

                if (req.headers['hx-request']) {
                    res.set('HX-Redirect', '/admin/auth/login').send();
                } else {
                    res.redirect('/admin/auth/login');
                }
            });
        } catch (error) {
            next(error);
        }
    };

    // GET /admin/auth/status - Check authentication status (for HTMX)
    checkStatus = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const isAuthenticated = !!req.session?.adminUser;
            const adminUser = req.session?.adminUser;

            res.json({
                authenticated: isAuthenticated,
                user: adminUser ? {
                    id: adminUser.id,
                    username: adminUser.username,
                    role: adminUser.role
                } : null
            });
        } catch (error) {
            next(error);
        }
    };
} 