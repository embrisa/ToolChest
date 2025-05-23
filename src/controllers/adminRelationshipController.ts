import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../config/types';
import { IAdminRelationshipService, BulkRelationshipRequest } from '../services/adminRelationshipService';
import { AdminAuditService } from '../services/adminAuditService';

export interface IAdminRelationshipController {
    getRelationshipMatrix(req: Request, res: Response, next: NextFunction): Promise<void>;
    getToolRelationships(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTagRelationships(req: Request, res: Response, next: NextFunction): Promise<void>;
    assignTag(req: Request, res: Response, next: NextFunction): Promise<void>;
    unassignTag(req: Request, res: Response, next: NextFunction): Promise<void>;
    bulkManageRelationships(req: Request, res: Response, next: NextFunction): Promise<void>;
    getRelationshipStats(req: Request, res: Response, next: NextFunction): Promise<void>;
}

@injectable()
export class AdminRelationshipControllerImpl implements IAdminRelationshipController {
    constructor(
        @inject(TYPES.AdminRelationshipService) private relationshipService: IAdminRelationshipService,
        @inject(TYPES.AdminAuditService) private auditService: AdminAuditService
    ) { }

    async getRelationshipMatrix(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const matrix = await this.relationshipService.getRelationshipMatrix();
            const stats = await this.relationshipService.getRelationshipStats();

            res.render('admin/pages/relationships/matrix', {
                title: 'Tool-Tag Relationships',
                currentPath: req.path,
                breadcrumbs: [
                    { label: 'Dashboard', url: '/admin/dashboard' },
                    { label: 'Relationships', url: '/admin/relationships' }
                ],
                matrix,
                stats,
            });
        } catch (error) {
            next(error);
        }
    }

    async getToolRelationships(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { toolId } = req.params;
            const toolRelationships = await this.relationshipService.getToolRelationships(toolId);

            res.render('admin/pages/relationships/tool-centric', {
                title: `Tags for ${toolRelationships.toolName}`,
                currentPath: req.path,
                breadcrumbs: [
                    { label: 'Dashboard', url: '/admin/dashboard' },
                    { label: 'Relationships', url: '/admin/relationships' },
                    { label: toolRelationships.toolName, url: `/admin/relationships/tools/${toolId}` }
                ],
                toolRelationships,
            });
        } catch (error) {
            next(error);
        }
    }

    async getTagRelationships(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { tagId } = req.params;
            const tagRelationships = await this.relationshipService.getTagRelationships(tagId);

            res.render('admin/pages/relationships/tag-centric', {
                title: `Tools for ${tagRelationships.tagName}`,
                currentPath: req.path,
                breadcrumbs: [
                    { label: 'Dashboard', url: '/admin/dashboard' },
                    { label: 'Relationships', url: '/admin/relationships' },
                    { label: tagRelationships.tagName, url: `/admin/relationships/tags/${tagId}` }
                ],
                tagRelationships,
            });
        } catch (error) {
            next(error);
        }
    }

    async assignTag(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { toolId, tagId } = req.body;
            const adminUser = req.session.adminUser;

            await this.relationshipService.assignTag(toolId, tagId);

            // Log the action
            await this.auditService.logAction({
                adminUserId: adminUser!.id,
                action: 'ASSIGN_TAG',
                tableName: 'ToolTag',
                recordId: `${toolId}-${tagId}`,
                newValues: { toolId, tagId },
                ipAddress: req.ip || 'unknown',
                userAgent: req.get('User-Agent') || 'unknown',
            });

            // Check if this is an HTMX request
            if (req.headers['hx-request']) {
                // Return success message or updated content
                res.setHeader('HX-Trigger', 'relationshipUpdated');
                res.status(200).send('<div class="text-green-600">Tag assigned successfully</div>');
            } else {
                res.redirect('back');
            }
        } catch (error) {
            if (req.headers['hx-request']) {
                res.status(400).render('admin/components/error-message', {
                    message: error instanceof Error ? error.message : 'Failed to assign tag'
                });
            } else {
                next(error);
            }
        }
    }

    async unassignTag(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { toolId, tagId } = req.body;
            const adminUser = req.session.adminUser;

            await this.relationshipService.unassignTag(toolId, tagId);

            // Log the action
            await this.auditService.logAction({
                adminUserId: adminUser!.id,
                action: 'UNASSIGN_TAG',
                tableName: 'ToolTag',
                recordId: `${toolId}-${tagId}`,
                oldValues: { toolId, tagId },
                ipAddress: req.ip || 'unknown',
                userAgent: req.get('User-Agent') || 'unknown',
            });

            // Check if this is an HTMX request
            if (req.headers['hx-request']) {
                res.setHeader('HX-Trigger', 'relationshipUpdated');
                res.status(200).send('<div class="text-green-600">Tag unassigned successfully</div>');
            } else {
                res.redirect('back');
            }
        } catch (error) {
            if (req.headers['hx-request']) {
                res.status(400).render('admin/components/error-message', {
                    message: error instanceof Error ? error.message : 'Failed to unassign tag'
                });
            } else {
                next(error);
            }
        }
    }

    async bulkManageRelationships(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { toolIds, tagIds, action } = req.body as BulkRelationshipRequest;
            const adminUser = req.session.adminUser;

            const result = await this.relationshipService.bulkManageRelationships({
                toolIds: Array.isArray(toolIds) ? toolIds : [toolIds],
                tagIds: Array.isArray(tagIds) ? tagIds : [tagIds],
                action,
            });

            // Log the bulk action
            await this.auditService.logAction({
                adminUserId: adminUser!.id,
                action: `BULK_${action.toUpperCase()}_TAGS`,
                tableName: 'ToolTag',
                recordId: 'bulk-operation',
                newValues: {
                    toolIds: Array.isArray(toolIds) ? toolIds : [toolIds],
                    tagIds: Array.isArray(tagIds) ? tagIds : [tagIds],
                    action,
                    result
                },
                ipAddress: req.ip || 'unknown',
                userAgent: req.get('User-Agent') || 'unknown',
            });

            // Check if this is an HTMX request
            if (req.headers['hx-request']) {
                res.setHeader('HX-Trigger', 'relationshipUpdated');
                res.status(200).send(`
          <div class="text-green-600">
            Bulk operation completed: ${result.affected} relationships ${action}ed, ${result.skipped} skipped
          </div>
        `);
            } else {
                res.redirect('back');
            }
        } catch (error) {
            if (req.headers['hx-request']) {
                res.status(400).render('admin/components/error-message', {
                    message: error instanceof Error ? error.message : 'Failed to complete bulk operation'
                });
            } else {
                next(error);
            }
        }
    }

    async getRelationshipStats(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const stats = await this.relationshipService.getRelationshipStats();

            if (req.headers['hx-request']) {
                res.render('admin/components/relationship-stats', { stats });
            } else {
                res.json(stats);
            }
        } catch (error) {
            next(error);
        }
    }
} 