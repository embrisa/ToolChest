import { Request, Response, NextFunction } from 'express';
import { AdminUserDTO, AdminRole } from '../dto/adminUserDTO';

// Extend Express Session interface to include admin user
declare module 'express-session' {
    interface SessionData {
        adminUser?: AdminUserDTO;
    }
}

export interface AdminAuthRequest extends Request {
    adminUser?: AdminUserDTO;
}

export const adminAuthMiddleware = (req: AdminAuthRequest, res: Response, next: NextFunction): void => {
    const adminUser = req.session?.adminUser;

    if (!adminUser) {
        if (req.headers['hx-request']) {
            res.status(401).set('HX-Redirect', '/admin/auth/login').send();
        } else {
            res.redirect('/admin/auth/login');
        }
        return;
    }

    // Add admin user to request object for use in controllers
    req.adminUser = adminUser;
    next();
};

export const adminRoleMiddleware = (requiredRole: AdminRole | AdminRole[]) => {
    return (req: AdminAuthRequest, res: Response, next: NextFunction): void => {
        const adminUser = req.adminUser;

        if (!adminUser) {
            if (req.headers['hx-request']) {
                res.status(401).set('HX-Redirect', '/admin/auth/login').send();
            } else {
                res.redirect('/admin/auth/login');
            }
            return;
        }

        const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

        // Check if user has required role
        if (!allowedRoles.includes(adminUser.role)) {
            if (req.headers['hx-request']) {
                res.status(403).set('HX-Retarget', 'body').render('admin/components/error-message', {
                    message: 'Insufficient permissions to access this resource'
                });
            } else {
                res.status(403).render('admin/pages/error', {
                    statusCode: 403,
                    message: 'Insufficient permissions to access this resource',
                    layout: 'admin/layouts/admin-layout'
                });
            }
            return;
        }

        next();
    };
};

export const adminSuperAdminOnly = adminRoleMiddleware(AdminRole.SUPER_ADMIN);
export const adminReadWrite = adminRoleMiddleware([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]);
export const adminAnyRole = adminRoleMiddleware([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.READ_ONLY]); 