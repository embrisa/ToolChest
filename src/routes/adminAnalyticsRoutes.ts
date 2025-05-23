import express from 'express';
import { appContainer } from '../config/inversify.config';
import { TYPES } from '../config/types';
import { IAdminAnalyticsController } from '../controllers/adminAnalyticsController';
import { adminAuthMiddleware, adminReadWrite } from '../middleware/adminAuthMiddleware';

const router = express.Router();

// Inject the controller
const analyticsController = appContainer.get<IAdminAnalyticsController>(TYPES.AdminAnalyticsController);

// Apply authentication middleware to all routes
router.use(adminAuthMiddleware);

// Main analytics dashboard
router.get('/', analyticsController.showAnalyticsDashboard.bind(analyticsController));

// Usage statistics endpoints
router.get('/stats', analyticsController.getUsageStatistics.bind(analyticsController));
router.get('/stats/usage', analyticsController.getUsageStatistics.bind(analyticsController));

// Tool analytics
router.get('/tools', analyticsController.showDetailedToolAnalytics.bind(analyticsController));
router.get('/tools/trends', analyticsController.getToolUsageTrends.bind(analyticsController));

// Tag analytics
router.get('/tags', analyticsController.showDetailedTagAnalytics.bind(analyticsController));
router.get('/tags/stats', analyticsController.getTagUsageStats.bind(analyticsController));

// Date range analytics
router.get('/date-range', analyticsController.getUsageByDateRange.bind(analyticsController));

// Export functionality (requires write permissions)
router.use('/export', adminReadWrite);
router.get('/export', analyticsController.exportAnalyticsData.bind(analyticsController));

export { router as adminAnalyticsRoutes }; 