import { Router } from 'express';
import { Container } from 'inversify';
import { TYPES } from '../config/types';
import { HomeController } from '../controllers/homeController';

export function setupHomeRoutes(router: Router, container: Container): void {
    const homeController = container.get<HomeController>(TYPES.HomeController);
    router.get('/', homeController.getHomePage);
    // Add other home routes here if any in the future
} 