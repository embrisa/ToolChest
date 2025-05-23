import { Router } from 'express';
import { appContainer } from '../config/inversify.config';
import { AdminDashboardController } from '../controllers/adminDashboardController';
import { TYPES } from '../config/types';
import { adminAuthMiddleware } from '../middleware/adminAuthMiddleware';
import adminAuthRoutes from './adminAuthRoutes';
import adminToolRoutes from './adminToolRoutes';
import adminTagRoutes from './adminTagRoutes';
import { adminRelationshipRoutes } from './adminRelationshipRoutes';
import { adminAnalyticsRoutes } from './adminAnalyticsRoutes';

const router = Router();

// Get controller from DI container
const adminDashboardController = appContainer.get<AdminDashboardController>(TYPES.AdminDashboardController);

// Authentication routes (no auth required)
router.use('/auth', adminAuthRoutes);

// Protected admin routes (require authentication)
router.use(adminAuthMiddleware);

// Dashboard route
router.get('/dashboard', adminDashboardController.showDashboard);

// Tools management routes
router.use('/tools', adminToolRoutes);

// Tags management routes
router.use('/tags', adminTagRoutes);

// Relationship management routes
router.use('/relationships', adminRelationshipRoutes);

// Analytics routes
router.use('/analytics', adminAnalyticsRoutes);

// Redirect root admin path to dashboard
router.get('/', (req, res) => {
    res.redirect('/admin/dashboard');
});

export default router; 