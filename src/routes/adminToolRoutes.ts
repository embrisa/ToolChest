import { Router } from 'express';
import { appContainer } from '../config/inversify.config';
import { AdminToolController } from '../controllers/adminToolController';
import { TYPES } from '../config/types';

const router = Router();

// Get controller from DI container
const adminToolController = appContainer.get<AdminToolController>(TYPES.AdminToolController);

// Tools list and search
router.get('/', adminToolController.showToolsList);

// Advanced filtering interface
router.get('/advanced', adminToolController.showAdvancedFilters);

// Filter options API endpoint
router.get('/filter-options', adminToolController.getFilterOptions);

// Create tool form
router.get('/new', adminToolController.showCreateForm);

// Create tool
router.post('/', adminToolController.createTool);

// Tool details
router.get('/:id', adminToolController.showToolDetails);

// Edit tool form
router.get('/:id/edit', adminToolController.showEditForm);

// Update tool
router.put('/:id', adminToolController.updateTool);

// Delete tool
router.delete('/:id', adminToolController.deleteTool);

// Toggle tool status
router.post('/:id/toggle', adminToolController.toggleToolStatus);

export default router; 