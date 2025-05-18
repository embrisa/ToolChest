import { Router } from 'express';
import { Container } from 'inversify';
import { TYPES } from '../config/types';
import { HashController, hashUploadMiddleware } from '../controllers/hashController';

export function setupHashRoutes(router: Router, container: Container): void {
    const hashController = container.get<HashController>(TYPES.HashController);

    router.get('/', hashController.getHashPage);
    router.post('/generate', hashUploadMiddleware.single('inputFile'), hashController.generateHash);
} 