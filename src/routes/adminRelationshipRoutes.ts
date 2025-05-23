import express from 'express';
import { appContainer } from '../config/inversify.config';
import { TYPES } from '../config/types';
import { IAdminRelationshipController } from '../controllers/adminRelationshipController';
import { adminAuthMiddleware, adminReadWrite } from '../middleware/adminAuthMiddleware';

const router = express.Router();

// Inject the controller
const relationshipController = appContainer.get<IAdminRelationshipController>(TYPES.AdminRelationshipController);

// Apply authentication middleware to all routes
router.use(adminAuthMiddleware);
router.use(adminReadWrite);

// Relationship matrix view
router.get('/', relationshipController.getRelationshipMatrix.bind(relationshipController));

// Tool-centric relationship management
router.get('/tools/:toolId', relationshipController.getToolRelationships.bind(relationshipController));

// Tag-centric relationship management
router.get('/tags/:tagId', relationshipController.getTagRelationships.bind(relationshipController));

// Assignment operations
router.post('/assign', relationshipController.assignTag.bind(relationshipController));
router.post('/unassign', relationshipController.unassignTag.bind(relationshipController));

// Bulk operations
router.post('/bulk', relationshipController.bulkManageRelationships.bind(relationshipController));

// Stats endpoint
router.get('/stats', relationshipController.getRelationshipStats.bind(relationshipController));

export { router as adminRelationshipRoutes }; 