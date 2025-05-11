import express, { Application, Request, Response, Router } from 'express';
import path from 'path';
import nunjucks from 'nunjucks';
import { appContainer } from './config/inversify.config'; // Import appContainer

// Import route setup functions
import { setupHomeRoutes } from './routes/homeRoutes';
import { setupBase64Routes } from './routes/base64Routes';
import { setupStaticPagesRoutes } from './routes/staticPagesRoutes';

// Import new middleware
import morganMiddleware from './middleware/loggingMiddleware';
import compressionMiddleware from './middleware/compressionMiddleware';
import cacheControlMiddleware from './middleware/cacheMiddleware';
import { notFoundHandler, mainErrorHandler } from './middleware/errorHandlerMiddleware';

export function createApp(): Application {
    const app: Application = express();

    // App version and name (can be moved to a config file or .env)
    app.locals.appName = 'ToolChest';
    app.locals.appVersion = process.env.npm_package_version || '0.1.0'; // Get version from package.json

    // Configure Nunjucks
    const nunjucksEnv = nunjucks.configure(path.join(__dirname, '..', 'src', 'templates'), {
        autoescape: true,
        express: app,
        watch: process.env.NODE_ENV === 'development' // Watch for changes only in development
    });

    // Add a global 'now' function to Nunjucks environment
    nunjucksEnv.addGlobal('now', () => new Date());

    // Add a basic 'date' filter
    nunjucksEnv.addFilter('date', (date: string | number | Date, format?: string /* format arg not used in this basic version */) => {
        if (!date) return '';
        try {
            const d = new Date(date);
            // Basic format, ignores format argument for simplicity for now
            return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch (e) {
            return 'Invalid date';
        }
    });

    app.set('view engine', 'njk');

    // Static Assets
    const publicPath = path.join(__dirname, '..', 'src', 'public');
    app.use('/static', express.static(publicPath));

    // Core Middleware
    app.use(morganMiddleware);
    app.use(compressionMiddleware);
    app.use(cacheControlMiddleware);

    // Body parsers (Content Negotiation)
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Health check route
    app.get('/health', (req: Request, res: Response) => {
        res.status(200).send('OK');
    });

    // Register Routers by calling setup functions
    const homeRouter = Router();
    setupHomeRoutes(homeRouter, appContainer);
    app.use('/', homeRouter);

    const base64Router = Router();
    setupBase64Routes(base64Router, appContainer);
    app.use('/base64', base64Router);

    const staticPagesRouter = Router();
    setupStaticPagesRoutes(staticPagesRouter);
    app.use('/', staticPagesRouter);

    // Error Handling Middleware
    app.use(notFoundHandler);
    app.use(mainErrorHandler);

    return app;
} 