import { Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../config/types';
import { AdminToolService, CreateToolDTO, UpdateToolDTO, AdvancedToolFilters } from '../services/adminToolService';
import { AdminTagService } from '../services/adminTagService';
import { AdminAuthRequest } from '../middleware/adminAuthMiddleware';

@injectable()
export class AdminToolController {
    constructor(
        @inject(TYPES.AdminToolService) private adminToolService: AdminToolService,
        @inject(TYPES.AdminTagService) private adminTagService: AdminTagService
    ) { }

    // GET /admin/tools - Show tools list
    showToolsList = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const search = req.query.search as string;
            const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;

            const result = await this.adminToolService.getToolsWithPagination(page, limit, search, isActive);

            res.render('admin/pages/tools/list', {
                title: 'Tools Management - Admin Dashboard',
                layout: 'layouts/admin-layout',
                adminUser: req.adminUser,
                currentPath: req.path,
                tools: result.tools,
                pagination: {
                    current: page,
                    total: result.totalPages,
                    totalItems: result.total,
                    limit
                },
                filters: {
                    search,
                    isActive
                }
            });
        } catch (error) {
            next(error);
        }
    };

    // GET /admin/tools/new - Show create tool form
    showCreateForm = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tags = await this.adminTagService.getAllTagsForAdmin();

            res.render('admin/pages/tools/form', {
                title: 'Create New Tool - Admin Dashboard',
                layout: 'layouts/admin-layout',
                adminUser: req.adminUser,
                currentPath: req.path,
                isEdit: false,
                tool: null,
                tags,
                action: '/admin/tools'
            });
        } catch (error) {
            next(error);
        }
    };

    // POST /admin/tools - Create new tool
    createTool = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const createData: CreateToolDTO = {
                name: req.body.name,
                description: req.body.description || undefined,
                iconClass: req.body.iconClass || undefined,
                displayOrder: req.body.displayOrder ? parseInt(req.body.displayOrder) : undefined,
                tagIds: req.body.tagIds ? (Array.isArray(req.body.tagIds) ? req.body.tagIds : [req.body.tagIds]) : undefined
            };

            await this.adminToolService.createTool(
                createData,
                req.adminUser!.id,
                req.ip || 'Unknown',
                req.get('User-Agent') || 'Unknown'
            );

            if (req.get('HX-Request')) {
                res.set('HX-Redirect', '/admin/tools');
                res.status(200).send();
            } else {
                res.redirect('/admin/tools');
            }
        } catch (error) {
            if (req.get('HX-Request')) {
                res.set('HX-Retarget', '#error-container');
                res.set('HX-Reswap', 'innerHTML');
                res.status(400).render('admin/components/error-message', {
                    error: error instanceof Error ? error.message : 'An error occurred while creating the tool'
                });
            } else {
                next(error);
            }
        }
    };

    // GET /admin/tools/:id - Show tool details
    showToolDetails = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tool = await this.adminToolService.getToolByIdForAdmin(req.params.id);

            if (!tool) {
                const error = new Error('Tool not found');
                (error as any).statusCode = 404;
                throw error;
            }

            res.render('admin/pages/tools/detail', {
                title: `${tool.name} - Tool Details`,
                layout: 'layouts/admin-layout',
                adminUser: req.adminUser,
                currentPath: req.path,
                tool
            });
        } catch (error) {
            next(error);
        }
    };

    // GET /admin/tools/:id/edit - Show edit tool form
    showEditForm = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const [tool, tags] = await Promise.all([
                this.adminToolService.getToolByIdForAdmin(req.params.id),
                this.adminTagService.getAllTagsForAdmin()
            ]);

            if (!tool) {
                const error = new Error('Tool not found');
                (error as any).statusCode = 404;
                throw error;
            }

            res.render('admin/pages/tools/form', {
                title: `Edit ${tool.name} - Admin Dashboard`,
                layout: 'layouts/admin-layout',
                adminUser: req.adminUser,
                currentPath: req.path,
                isEdit: true,
                tool,
                tags,
                action: `/admin/tools/${tool.id}`
            });
        } catch (error) {
            next(error);
        }
    };

    // PUT /admin/tools/:id - Update tool
    updateTool = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const updateData: UpdateToolDTO = {};

            if (req.body.name !== undefined) updateData.name = req.body.name;
            if (req.body.slug !== undefined) updateData.slug = req.body.slug;
            if (req.body.description !== undefined) updateData.description = req.body.description || undefined;
            if (req.body.iconClass !== undefined) updateData.iconClass = req.body.iconClass || undefined;
            if (req.body.displayOrder !== undefined) updateData.displayOrder = req.body.displayOrder ? parseInt(req.body.displayOrder) : undefined;
            if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive === 'true';
            if (req.body.tagIds !== undefined) {
                updateData.tagIds = req.body.tagIds ? (Array.isArray(req.body.tagIds) ? req.body.tagIds : [req.body.tagIds]) : [];
            }

            await this.adminToolService.updateTool(
                req.params.id,
                updateData,
                req.adminUser!.id,
                req.ip || 'Unknown',
                req.get('User-Agent') || 'Unknown'
            );

            if (req.get('HX-Request')) {
                res.set('HX-Redirect', '/admin/tools');
                res.status(200).send();
            } else {
                res.redirect('/admin/tools');
            }
        } catch (error) {
            if (req.get('HX-Request')) {
                res.set('HX-Retarget', '#error-container');
                res.set('HX-Reswap', 'innerHTML');
                res.status(400).render('admin/components/error-message', {
                    error: error instanceof Error ? error.message : 'An error occurred while updating the tool'
                });
            } else {
                next(error);
            }
        }
    };

    // DELETE /admin/tools/:id - Delete tool
    deleteTool = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            await this.adminToolService.deleteTool(
                req.params.id,
                req.adminUser!.id,
                req.ip || 'Unknown',
                req.get('User-Agent') || 'Unknown'
            );

            if (req.get('HX-Request')) {
                res.set('HX-Redirect', '/admin/tools');
                res.status(200).send();
            } else {
                res.redirect('/admin/tools');
            }
        } catch (error) {
            if (req.get('HX-Request')) {
                res.set('HX-Retarget', '#error-container');
                res.set('HX-Reswap', 'innerHTML');
                res.status(400).render('admin/components/error-message', {
                    error: error instanceof Error ? error.message : 'An error occurred while deleting the tool'
                });
            } else {
                next(error);
            }
        }
    };

    // POST /admin/tools/:id/toggle - Toggle tool active status
    toggleToolStatus = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            await this.adminToolService.toggleToolStatus(
                req.params.id,
                req.adminUser!.id,
                req.ip || 'Unknown',
                req.get('User-Agent') || 'Unknown'
            );

            if (req.get('HX-Request')) {
                res.set('HX-Redirect', '/admin/tools');
                res.status(200).send();
            } else {
                res.redirect('/admin/tools');
            }
        } catch (error) {
            if (req.get('HX-Request')) {
                res.set('HX-Retarget', '#error-container');
                res.set('HX-Reswap', 'innerHTML');
                res.status(400).render('admin/components/error-message', {
                    error: error instanceof Error ? error.message : 'An error occurred while toggling tool status'
                });
            } else {
                next(error);
            }
        }
    };

    // GET /admin/tools/advanced - Show advanced filtering interface
    showAdvancedFilters = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;

            // Parse advanced filters from query parameters
            const parseTagIds = (tagIds: any): string[] | undefined => {
                if (!tagIds) return undefined;
                if (Array.isArray(tagIds)) {
                    return tagIds.filter(id => typeof id === 'string') as string[];
                }
                return typeof tagIds === 'string' ? [tagIds] : undefined;
            };

            const filters: AdvancedToolFilters = {
                search: req.query.search as string,
                isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
                tagIds: parseTagIds(req.query.tagIds),
                createdAfter: req.query.createdAfter ? new Date(req.query.createdAfter as string) : undefined,
                createdBefore: req.query.createdBefore ? new Date(req.query.createdBefore as string) : undefined,
                usageCountMin: req.query.usageCountMin ? parseInt(req.query.usageCountMin as string) : undefined,
                usageCountMax: req.query.usageCountMax ? parseInt(req.query.usageCountMax as string) : undefined,
                hasNoTags: req.query.hasNoTags === 'true',
                sortBy: req.query.sortBy as 'name' | 'createdAt' | 'displayOrder' | 'usageCount',
                sortOrder: req.query.sortOrder as 'asc' | 'desc'
            };

            const [result, filterOptions] = await Promise.all([
                this.adminToolService.getToolsWithAdvancedFilters(page, limit, filters),
                this.adminToolService.getFilterOptions()
            ]);

            res.render('admin/pages/tools/advanced-list', {
                title: 'Advanced Tools Search - Admin Dashboard',
                layout: 'layouts/admin-layout',
                adminUser: req.adminUser,
                currentPath: req.path,
                tools: result.tools,
                pagination: {
                    current: page,
                    total: result.totalPages,
                    totalItems: result.total,
                    limit
                },
                filters,
                filterOptions
            });
        } catch (error) {
            next(error);
        }
    };

    // GET /admin/tools/filter-options - Get filter options for AJAX requests
    getFilterOptions = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const filterOptions = await this.adminToolService.getFilterOptions();
            res.json(filterOptions);
        } catch (error) {
            next(error);
        }
    };
} 