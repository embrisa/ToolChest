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
            const { username, password, rememberMe: rememberMeRaw } = req.body as {
                username: string;
                password: string;
                rememberMe?: string | boolean;
            };

            // Convert checkbox value to boolean (HTML forms send "true" string or undefined)
            const rememberMe = rememberMeRaw === true || rememberMeRaw === 'true';

            if (!username || !password) {
                if (req.headers['hx-request']) {
                    res.status(400).set('HX-Retarget', '#login-error').set('HX-Reswap', 'innerHTML').render('admin/components/error-message', {
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
                    res.status(401).set('HX-Retarget', '#login-error').set('HX-Reswap', 'innerHTML').render('admin/components/error-message', {
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

            // Configure session timeout based on remember me option
            if (rememberMe) {
                // Extend session for 30 days if remember me is checked (configurable via env)
                const rememberMeTimeout = parseInt(process.env.ADMIN_REMEMBER_ME_TIMEOUT || '2592000000', 10); // 30 days default
                req.session.cookie.maxAge = rememberMeTimeout;
            } else {
                // Use default session timeout (1 hour)
                const defaultTimeout = parseInt(process.env.ADMIN_SESSION_TIMEOUT || '3600000', 10); // 1 hour default
                req.session.cookie.maxAge = defaultTimeout;
            }

            // Ensure session is saved before redirecting
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    if (req.headers['hx-request']) {
                        res.status(500).set('HX-Retarget', '#login-error').set('HX-Reswap', 'innerHTML').render('admin/components/error-message', {
                            message: 'Login failed. Please try again.'
                        });
                    } else {
                        res.render('admin/pages/login', {
                            title: 'Admin Login - ToolChest',
                            layout: 'admin/layouts/admin-auth-layout',
                            error: 'Login failed. Please try again.'
                        });
                    }
                    return;
                }

                if (req.headers['hx-request']) {
                    // For HTMX requests, use HX-Redirect header for reliable redirection
                    res.set('HX-Redirect', '/admin/dashboard').send();
                } else {
                    res.redirect('/admin/dashboard');
                }
            });
        } catch (error) {
            // Handle authentication service errors
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

            if (req.headers['hx-request']) {
                res.status(500).set('HX-Retarget', '#login-error').set('HX-Reswap', 'innerHTML').render('admin/components/error-message', {
                    message: 'Login failed. Please try again.'
                });
            } else {
                res.render('admin/pages/login', {
                    title: 'Admin Login - ToolChest',
                    layout: 'admin/layouts/admin-auth-layout',
                    error: 'Login failed. Please try again.'
                });
            }
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