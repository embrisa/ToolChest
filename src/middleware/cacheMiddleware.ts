import { Request, Response, NextFunction } from 'express';

/**
 * Sets HTTP Caching Headers.
 */
const cacheControlMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === 'production') {
        // For static assets and HTML pages in production
        if (req.method === 'GET') {
            if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico)$/i)) {
                // Cache static assets for a long time (e.g., 1 year)
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            } else if (req.headers.accept && req.headers.accept.includes('text/html')) {
                // Cache HTML pages for a shorter time (e.g., 1 hour)
                // Consider using ETag for better cache validation
                res.setHeader('Cache-Control', 'public, max-age=3600');
            } else {
                // For API calls or other dynamic content, perhaps no caching or very short caching
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.setHeader('Pragma', 'no-cache');
                res.setHeader('Expires', '0');
            }
        }
    } else {
        // Aggressive cache busting in development mode
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');

        // Additional headers for aggressive cache busting
        res.setHeader('Last-Modified', new Date().toUTCString());
        res.setHeader('ETag', `"${Date.now()}-${Math.random()}"`);

        // Prevent conditional requests
        res.removeHeader('If-Modified-Since');
        res.removeHeader('If-None-Match');

        // Force revalidation with upstream
        res.setHeader('Vary', '*');

        // Additional aggressive headers for browsers
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0, private');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '-1');

        // Prevent browser back/forward cache
        res.setHeader('Clear-Site-Data', '"cache"');
    }
    next();
};

export default cacheControlMiddleware; 