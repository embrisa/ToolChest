import { Router } from 'express';
import { appContainer } from '../config/inversify.config';
import { AdminUserController } from '../controllers/adminUserController';
import { TYPES } from '../config/types';
import { adminRoleMiddleware } from '../middleware/adminAuthMiddleware';
import { AdminRole } from '../dto/adminUserDTO';

const router = Router();

// Get controller from DI container
const adminUserController = appContainer.get<AdminUserController>(TYPES.AdminUserController);

// Apply super admin middleware to all routes (user management is super admin only)
router.use(adminRoleMiddleware(AdminRole.SUPER_ADMIN));

// User management routes
router.get('/', adminUserController.showUsersList);
router.get('/new', adminUserController.showCreateForm);
router.post('/', adminUserController.createUser);
router.get('/:id', adminUserController.showUserDetails);
router.get('/:id/edit', adminUserController.showEditForm);
router.put('/:id', adminUserController.updateUser);
router.delete('/:id', adminUserController.deleteUser);
router.post('/:id/toggle', adminUserController.toggleUserStatus);
router.post('/:id/change-password', adminUserController.changePassword);

export default router; 