import { Router } from 'express';
import { appContainer } from '../config/inversify.config';
import { AdminAuthController } from '../controllers/adminAuthController';
import { TYPES } from '../config/types';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for login attempts
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many login attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        if (req.headers['hx-request']) {
            res.status(429)
                .set('HX-Retarget', '#login-error')
                .set('HX-Reswap', 'innerHTML')
                .render('admin/components/error-message', {
                    message: 'Too many login attempts, please try again later.'
                });
        } else {
            res.status(429).render('admin/pages/login', {
                title: 'Admin Login - ToolChest',
                layout: 'admin/layouts/admin-auth-layout',
                error: 'Too many login attempts, please try again later.'
            });
        }
    }
});

// Get controller from DI container
const adminAuthController = appContainer.get<AdminAuthController>(TYPES.AdminAuthController);

// Authentication routes
router.get('/login', adminAuthController.showLogin);
router.post('/login', loginLimiter, adminAuthController.processLogin);
router.post('/logout', adminAuthController.processLogout);
router.get('/status', adminAuthController.checkStatus);

export default router; 