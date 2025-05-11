import { Router } from 'express';
import { staticPageController } from '../controllers/staticPageController';

export function setupStaticPagesRoutes(router: Router): void {
    router.get('/privacy', staticPageController.getPrivacyPolicy);
    router.get('/terms', staticPageController.getTermsOfService);
    router.get('/contact', staticPageController.getContactPage);
} 