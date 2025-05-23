import { Router } from 'express';
import { appContainer } from '../config/inversify.config';
import { AdminTagController } from '../controllers/adminTagController';
import { TYPES } from '../config/types';

const router = Router();

// Get controller from DI container
const adminTagController = appContainer.get<AdminTagController>(TYPES.AdminTagController);

// Tags list and search
router.get('/', adminTagController.showTagsList);

// Create tag form
router.get('/new', adminTagController.showCreateForm);

// Create tag
router.post('/', adminTagController.createTag);

// Tag details
router.get('/:id', adminTagController.showTagDetails);

// Edit tag form
router.get('/:id/edit', adminTagController.showEditForm);

// Update tag
router.put('/:id', adminTagController.updateTag);

// Delete tag
router.delete('/:id', adminTagController.deleteTag);

export default router; 