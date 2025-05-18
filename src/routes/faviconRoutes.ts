import { Router } from 'express';
import { Container } from 'inversify';
import { TYPES } from '../config/types';
import { FaviconController, faviconUploadMiddleware } from '../controllers/faviconController';

export function setupFaviconRoutes(router: Router, container: Container): void {
    const faviconController = container.get<FaviconController>(TYPES.FaviconController);

    router.get('/', faviconController.getFaviconPage);
    // Handle file upload with Multer middleware before the controller method
    router.post('/generate', faviconUploadMiddleware.single('sourceImage'), faviconController.generateFavicons);
    // Route for downloading the ZIP
    router.get('/download-zip', faviconController.downloadZip);
} 