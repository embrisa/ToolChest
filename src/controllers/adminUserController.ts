import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../config/types';
import { AdminUserService } from '../services/adminUserService';
import { CreateAdminUserDTO, UpdateAdminUserDTO, AdminRole } from '../dto/adminUserDTO';
import { AdminAuthRequest } from '../middleware/adminAuthMiddleware';

@injectable()
export class AdminUserController {
    constructor(
        @inject(TYPES.AdminUserService) private adminUserService: AdminUserService
    ) { }

    // GET /admin/users - Show users list
    showUsersList = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const search = req.query.search as string;
            const role = req.query.role as AdminRole;
            const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;

            const [result, stats] = await Promise.all([
                this.adminUserService.getUsersWithPagination(page, limit, search, role, isActive),
                this.adminUserService.getUsersStats()
            ]);

            res.render('admin/pages/users/list', {
                title: 'User Management - Admin Dashboard',
                layout: 'layouts/admin-layout',
                adminUser: req.adminUser,
                currentPath: req.path,
                users: result.users,
                pagination: {
                    current: page,
                    total: result.totalPages,
                    totalItems: result.total,
                    limit
                },
                filters: {
                    search,
                    role,
                    isActive
                },
                stats,
                roles: Object.values(AdminRole)
            });
        } catch (error) {
            next(error);
        }
    };

    // GET /admin/users/new - Show create user form
    showCreateForm = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            res.render('admin/pages/users/form', {
                title: 'Create New User - Admin Dashboard',
                layout: 'layouts/admin-layout',
                adminUser: req.adminUser,
                currentPath: req.path,
                isEdit: false,
                user: null,
                roles: Object.values(AdminRole),
                action: '/admin/users'
            });
        } catch (error) {
            next(error);
        }
    };

    // POST /admin/users - Create new user
    createUser = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const createData: CreateAdminUserDTO = {
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                role: req.body.role as AdminRole || AdminRole.ADMIN,
                isActive: req.body.isActive !== undefined ? req.body.isActive === 'true' : true
            };

            // Validate required fields
            if (!createData.username || !createData.email || !createData.password) {
                throw new Error('Username, email, and password are required');
            }

            // Validate password strength
            if (createData.password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            await this.adminUserService.createUser(
                createData,
                req.adminUser!.id,
                req.ip || 'Unknown',
                req.get('User-Agent') || 'Unknown'
            );

            if (req.get('HX-Request')) {
                res.set('HX-Redirect', '/admin/users');
                res.status(200).send();
            } else {
                res.redirect('/admin/users');
            }
        } catch (error) {
            if (req.get('HX-Request')) {
                res.set('HX-Retarget', '#error-container');
                res.set('HX-Reswap', 'innerHTML');
                res.status(400).render('admin/components/error-message', {
                    error: error instanceof Error ? error.message : 'An error occurred while creating the user'
                });
            } else {
                next(error);
            }
        }
    };

    // GET /admin/users/:id - Show user details
    showUserDetails = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = await this.adminUserService.getUserById(req.params.id);

            if (!user) {
                const error = new Error('User not found');
                (error as any).statusCode = 404;
                throw error;
            }

            res.render('admin/pages/users/detail', {
                title: `${user.username} - User Details`,
                layout: 'layouts/admin-layout',
                adminUser: req.adminUser,
                currentPath: req.path,
                user,
                canEdit: req.adminUser!.role === AdminRole.SUPER_ADMIN
            });
        } catch (error) {
            next(error);
        }
    };

    // GET /admin/users/:id/edit - Show edit user form
    showEditForm = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = await this.adminUserService.getUserById(req.params.id);

            if (!user) {
                const error = new Error('User not found');
                (error as any).statusCode = 404;
                throw error;
            }

            res.render('admin/pages/users/form', {
                title: `Edit ${user.username} - Admin Dashboard`,
                layout: 'layouts/admin-layout',
                adminUser: req.adminUser,
                currentPath: req.path,
                isEdit: true,
                user,
                roles: Object.values(AdminRole),
                action: `/admin/users/${user.id}`,
                canEdit: req.adminUser!.role === AdminRole.SUPER_ADMIN
            });
        } catch (error) {
            next(error);
        }
    };

    // PUT /admin/users/:id - Update user
    updateUser = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const updateData: UpdateAdminUserDTO = {};

            if (req.body.username !== undefined) updateData.username = req.body.username;
            if (req.body.email !== undefined) updateData.email = req.body.email;
            if (req.body.role !== undefined) updateData.role = req.body.role as AdminRole;
            if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive === 'true';
            if (req.body.password && req.body.password.trim()) {
                if (req.body.password.length < 6) {
                    throw new Error('Password must be at least 6 characters long');
                }
                updateData.password = req.body.password;
            }

            await this.adminUserService.updateUser(
                req.params.id,
                updateData,
                req.adminUser!.id,
                req.ip || 'Unknown',
                req.get('User-Agent') || 'Unknown'
            );

            if (req.get('HX-Request')) {
                res.set('HX-Redirect', '/admin/users');
                res.status(200).send();
            } else {
                res.redirect('/admin/users');
            }
        } catch (error) {
            if (req.get('HX-Request')) {
                res.set('HX-Retarget', '#error-container');
                res.set('HX-Reswap', 'innerHTML');
                res.status(400).render('admin/components/error-message', {
                    error: error instanceof Error ? error.message : 'An error occurred while updating the user'
                });
            } else {
                next(error);
            }
        }
    };

    // DELETE /admin/users/:id - Delete user
    deleteUser = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            await this.adminUserService.deleteUser(
                req.params.id,
                req.adminUser!.id,
                req.ip || 'Unknown',
                req.get('User-Agent') || 'Unknown'
            );

            if (req.get('HX-Request')) {
                res.set('HX-Redirect', '/admin/users');
                res.status(200).send();
            } else {
                res.redirect('/admin/users');
            }
        } catch (error) {
            if (req.get('HX-Request')) {
                res.set('HX-Retarget', '#error-container');
                res.set('HX-Reswap', 'innerHTML');
                res.status(400).render('admin/components/error-message', {
                    error: error instanceof Error ? error.message : 'An error occurred while deleting the user'
                });
            } else {
                next(error);
            }
        }
    };

    // POST /admin/users/:id/toggle - Toggle user active status
    toggleUserStatus = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            await this.adminUserService.toggleUserStatus(
                req.params.id,
                req.adminUser!.id,
                req.ip || 'Unknown',
                req.get('User-Agent') || 'Unknown'
            );

            if (req.get('HX-Request')) {
                res.set('HX-Redirect', '/admin/users');
                res.status(200).send();
            } else {
                res.redirect('/admin/users');
            }
        } catch (error) {
            if (req.get('HX-Request')) {
                res.set('HX-Retarget', '#error-container');
                res.set('HX-Reswap', 'innerHTML');
                res.status(400).render('admin/components/error-message', {
                    error: error instanceof Error ? error.message : 'An error occurred while toggling user status'
                });
            } else {
                next(error);
            }
        }
    };

    // POST /admin/users/:id/change-password - Change user password
    changePassword = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { newPassword } = req.body;

            if (!newPassword || newPassword.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            await this.adminUserService.changePassword(
                req.params.id,
                newPassword,
                req.adminUser!.id,
                req.ip || 'Unknown',
                req.get('User-Agent') || 'Unknown'
            );

            if (req.get('HX-Request')) {
                res.set('HX-Retarget', '#success-container');
                res.set('HX-Reswap', 'innerHTML');
                res.status(200).render('admin/components/success-message', {
                    message: 'Password changed successfully'
                });
            } else {
                res.redirect(`/admin/users/${req.params.id}`);
            }
        } catch (error) {
            if (req.get('HX-Request')) {
                res.set('HX-Retarget', '#error-container');
                res.set('HX-Reswap', 'innerHTML');
                res.status(400).render('admin/components/error-message', {
                    error: error instanceof Error ? error.message : 'An error occurred while changing password'
                });
            } else {
                next(error);
            }
        }
    };
} 