import { Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../config/types';
import { AdminTagService, CreateTagDTO, UpdateTagDTO } from '../services/adminTagService';
import { AdminAuthRequest } from '../middleware/adminAuthMiddleware';

@injectable()
export class AdminTagController {
    constructor(
        @inject(TYPES.AdminTagService) private adminTagService: AdminTagService
    ) { }

    // GET /admin/tags - Show tags list
    showTagsList = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const search = req.query.search as string;

            const result = await this.adminTagService.getTagsWithPagination(page, limit, search);

            res.render('admin/pages/tags/list', {
                title: 'Tags Management - Admin Dashboard',
                layout: 'layouts/admin-layout',
                adminUser: req.adminUser,
                currentPath: req.path,
                tags: result.tags,
                pagination: {
                    current: page,
                    total: result.totalPages,
                    totalItems: result.total,
                    limit
                },
                filters: {
                    search
                }
            });
        } catch (error) {
            next(error);
        }
    };

    // GET /admin/tags/new - Show create tag form
    showCreateForm = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            res.render('admin/pages/tags/form', {
                title: 'Create New Tag - Admin Dashboard',
                layout: 'layouts/admin-layout',
                adminUser: req.adminUser,
                currentPath: req.path,
                isEdit: false,
                tag: null,
                action: '/admin/tags'
            });
        } catch (error) {
            next(error);
        }
    };

    // POST /admin/tags - Create new tag
    createTag = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const createData: CreateTagDTO = {
                name: req.body.name,
                description: req.body.description || undefined,
                color: req.body.color || undefined
            };

            await this.adminTagService.createTag(
                createData,
                req.adminUser!.id,
                req.ip || 'Unknown',
                req.get('User-Agent') || 'Unknown'
            );

            if (req.get('HX-Request')) {
                res.set('HX-Redirect', '/admin/tags');
                res.status(200).send();
            } else {
                res.redirect('/admin/tags');
            }
        } catch (error) {
            if (req.get('HX-Request')) {
                res.set('HX-Retarget', '#error-container');
                res.set('HX-Reswap', 'innerHTML');
                res.status(400).render('admin/components/error-message', {
                    error: error instanceof Error ? error.message : 'An error occurred while creating the tag'
                });
            } else {
                next(error);
            }
        }
    };

    // GET /admin/tags/:id - Show tag details
    showTagDetails = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const [tag, usageStats] = await Promise.all([
                this.adminTagService.getTagByIdForAdmin(req.params.id),
                this.adminTagService.getTagUsageStats(req.params.id)
            ]);

            if (!tag) {
                const error = new Error('Tag not found');
                (error as any).statusCode = 404;
                throw error;
            }

            res.render('admin/pages/tags/detail', {
                title: `${tag.name} - Tag Details`,
                layout: 'layouts/admin-layout',
                adminUser: req.adminUser,
                currentPath: req.path,
                tag,
                usageStats
            });
        } catch (error) {
            next(error);
        }
    };

    // GET /admin/tags/:id/edit - Show edit tag form
    showEditForm = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tag = await this.adminTagService.getTagByIdForAdmin(req.params.id);

            if (!tag) {
                const error = new Error('Tag not found');
                (error as any).statusCode = 404;
                throw error;
            }

            res.render('admin/pages/tags/form', {
                title: `Edit ${tag.name} - Admin Dashboard`,
                layout: 'layouts/admin-layout',
                adminUser: req.adminUser,
                currentPath: req.path,
                isEdit: true,
                tag,
                action: `/admin/tags/${tag.id}`
            });
        } catch (error) {
            next(error);
        }
    };

    // PUT /admin/tags/:id - Update tag
    updateTag = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const updateData: UpdateTagDTO = {};

            if (req.body.name !== undefined) updateData.name = req.body.name;
            if (req.body.slug !== undefined) updateData.slug = req.body.slug;
            if (req.body.description !== undefined) updateData.description = req.body.description || undefined;
            if (req.body.color !== undefined) updateData.color = req.body.color || undefined;

            await this.adminTagService.updateTag(
                req.params.id,
                updateData,
                req.adminUser!.id,
                req.ip || 'Unknown',
                req.get('User-Agent') || 'Unknown'
            );

            if (req.get('HX-Request')) {
                res.set('HX-Redirect', '/admin/tags');
                res.status(200).send();
            } else {
                res.redirect('/admin/tags');
            }
        } catch (error) {
            if (req.get('HX-Request')) {
                res.set('HX-Retarget', '#error-container');
                res.set('HX-Reswap', 'innerHTML');
                res.status(400).render('admin/components/error-message', {
                    error: error instanceof Error ? error.message : 'An error occurred while updating the tag'
                });
            } else {
                next(error);
            }
        }
    };

    // DELETE /admin/tags/:id - Delete tag
    deleteTag = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            await this.adminTagService.deleteTag(
                req.params.id,
                req.adminUser!.id,
                req.ip || 'Unknown',
                req.get('User-Agent') || 'Unknown'
            );

            if (req.get('HX-Request')) {
                res.set('HX-Redirect', '/admin/tags');
                res.status(200).send();
            } else {
                res.redirect('/admin/tags');
            }
        } catch (error) {
            if (req.get('HX-Request')) {
                res.set('HX-Retarget', '#error-container');
                res.set('HX-Reswap', 'innerHTML');
                res.status(400).render('admin/components/error-message', {
                    error: error instanceof Error ? error.message : 'An error occurred while deleting the tag'
                });
            } else {
                next(error);
            }
        }
    };
} 