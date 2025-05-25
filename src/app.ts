import express, { Application, Request, Response, Router } from 'express';
import path from 'path';
import nunjucks from 'nunjucks';
import session from 'express-session';
import helmet from 'helmet';
import ConnectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';
import { appContainer } from './config/inversify.config'; // Import appContainer

// Import route setup functions
import { setupHomeRoutes } from './routes/homeRoutes';
import { setupBase64Routes } from './routes/base64Routes';
import { setupStaticPagesRoutes } from './routes/staticPagesRoutes';
import { setupFaviconRoutes } from './routes/faviconRoutes';
import { setupHashRoutes } from './routes/hashRoutes';
import adminRoutes from './routes/adminRoutes';

// Import new middleware
import morganMiddleware from './middleware/loggingMiddleware';
import compressionMiddleware from './middleware/compressionMiddleware';
import cacheControlMiddleware from './middleware/cacheMiddleware';
import { notFoundHandler, mainErrorHandler } from './middleware/errorHandlerMiddleware';

export function createApp(): Application {
    const app: Application = express();

    // Trust proxy for Railway deployment
    if (process.env.NODE_ENV === 'production') {
        app.set('trust proxy', 1);
    }

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

    // Add round filter
    nunjucksEnv.addFilter('round', (num: number, decimals = 0) => {
        if (typeof num !== 'number') return num;
        return Number(num.toFixed(decimals));
    });

    // Add selectattr filter (similar to Jinja2)
    nunjucksEnv.addFilter('selectattr', (array: any[], attr: string, value?: any) => {
        if (!Array.isArray(array)) return [];
        return array.filter(item => {
            if (value !== undefined) {
                return item[attr] === value;
            }
            return Boolean(item[attr]);
        });
    });

    // Add rejectattr filter (opposite of selectattr)
    nunjucksEnv.addFilter('rejectattr', (array: any[], attr: string, value?: any) => {
        if (!Array.isArray(array)) return [];
        return array.filter(item => {
            if (value !== undefined) {
                return item[attr] !== value;
            }
            return !Boolean(item[attr]);
        });
    });

    // Add map filter (similar to JavaScript Array.map)
    nunjucksEnv.addFilter('map', (array: any[], attr: string) => {
        if (!Array.isArray(array)) return [];
        return array.map(item => {
            if (typeof item === 'object' && item !== null && attr in item) {
                return item[attr];
            }
            return item;
        });
    });

    app.set('view engine', 'njk');

    // Static Assets
    const publicPath = path.join(__dirname, '..', 'src', 'public');
    app.use('/static', express.static(publicPath, {
        // Aggressive cache busting for development
        etag: process.env.NODE_ENV !== 'development',
        lastModified: false,
        maxAge: process.env.NODE_ENV === 'development' ? 0 : '1d'
    }));

    // Core Middleware
    app.use(helmet({
        contentSecurityPolicy: false // Disable CSP for now to allow inline scripts
    }));
    app.use(morganMiddleware);
    app.use(compressionMiddleware);
    app.use(cacheControlMiddleware);

    // Session store configuration
    const PgSession = ConnectPgSimple(session);
    let sessionStore;

    if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
        try {
            // Use PostgreSQL session store in production
            sessionStore = new PgSession({
                pool: new Pool({
                    connectionString: process.env.DATABASE_URL,
                    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
                }),
                tableName: 'session',
                createTableIfMissing: true
            });
            console.log('PostgreSQL session store configured for production');
        } catch (error) {
            console.error('Failed to configure PostgreSQL session store:', error);
            console.log('Falling back to memory store');
        }
    } else {
        console.log('Using memory session store for development');
    }

    // Session middleware
    app.use(session({
        store: sessionStore,
        secret: process.env.ADMIN_SESSION_SECRET || process.env.SESSION_SECRET || 'toolchest-secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, // Set to false for Railway - they handle HTTPS termination
            maxAge: parseInt(process.env.ADMIN_SESSION_TIMEOUT || '3600000', 10), // 1 hour default
            httpOnly: true,
            sameSite: 'lax' // Better compatibility with proxies
        },
        name: 'toolchest.sid'
    }));

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
    app.use('/base64-converter', base64Router);

    const faviconRouter = Router();
    setupFaviconRoutes(faviconRouter, appContainer);
    app.use('/favicon-generator', faviconRouter);

    const hashRouter = Router();
    setupHashRoutes(hashRouter, appContainer);
    app.use('/hash-generator', hashRouter);

    const staticPagesRouter = Router();
    setupStaticPagesRoutes(staticPagesRouter);
    app.use('/', staticPagesRouter);

    // Admin routes
    app.use('/admin', adminRoutes);

    // Error Handling Middleware
    app.use(notFoundHandler);
    app.use(mainErrorHandler);

    return app;
} 