import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import logger from '../utils/logger'; // Assuming a logger utility exists or will be created

export interface ErrorPageModel {
    statusCode: number;
    title: string;
    message: string;
    stack?: string; // Optional: only in development
    error?: any; // For passing the original error object if needed
    appName: string;
    appVersion: string;
    showDetails: boolean;
}

/**
 * 404 Not Found Handler
 * This middleware should be placed after all your routes.
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    const model: ErrorPageModel = {
        statusCode: 404,
        title: 'Page Not Found',
        message: "Sorry, the page you are looking for doesn't exist.",
        appName: req.app.locals.appName || 'ToolChest',
        appVersion: req.app.locals.appVersion || '0.1.0',
        showDetails: process.env.NODE_ENV !== 'production',
    };
    res.status(404).render('pages/error', model);
};

/**
 * Main Error Handler Middleware
 * This should be the last middleware in your Express application.
 */
export const mainErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || err.status || 500;
    const isHtmxRequest = req.headers['hx-request'] === 'true';

    // Log the error (using a proper logger is recommended)
    logger.error(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    if (process.env.NODE_ENV !== 'production') {
        logger.error(err.stack);
    }

    const model: ErrorPageModel = {
        statusCode,
        title: err.expose ? err.message : (statusCode === 404 ? 'Page Not Found' : 'Server Error'),
        message: err.expose ? err.message : (statusCode === 404 ? "The resource was not found." : 'An unexpected error occurred. Please try again later.'),
        stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
        error: process.env.NODE_ENV !== 'production' ? err : {},
        appName: req.app.locals.appName || 'ToolChest',
        appVersion: req.app.locals.appVersion || '0.1.0',
        showDetails: process.env.NODE_ENV !== 'production',
    };

    if (isHtmxRequest) {
        // For HTMX requests, send a partial HTML error message
        // Ensure 'components/error-message' can handle the ErrorPageModel structure
        res.status(statusCode).render('components/error-message', {
            message: model.message,
            // You might want to pass more details from the model if your component supports it
        });
    } else {
        // For full page requests, render the error page
        res.status(statusCode).render('pages/error', model);
    }
}; 