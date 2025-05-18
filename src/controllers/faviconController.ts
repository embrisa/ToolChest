import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import multer from 'multer';
import archiver from 'archiver';
import { TYPES } from '../config/types';
import { FaviconService } from '../services/faviconService';
import { ToolService } from '../services/toolService';

// Extend Express Request to include session with our custom properties
declare module 'express-session' {
    interface SessionData {
        lastUploadedFaviconSource?: {
            buffer: Buffer;
            originalname: string;
        };
    }
}

// Configure Multer for file uploads with memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req: any, file: any, cb: any) => {
        if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/svg+xml') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PNG, JPG, and SVG are allowed.'));
        }
    }
});

export const faviconUploadMiddleware = upload;

@injectable()
export class FaviconController {
    constructor(
        @inject(TYPES.FaviconService) private faviconService: FaviconService,
        @inject(TYPES.ToolService) private toolService: ToolService
    ) { }

    public getFaviconPage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await this.toolService.recordToolUsage('favicon-generator');
            res.render('pages/favicon-generator', {
                title: 'Favicon Generator',
                description: 'Create favicons for your website from an image.',
            });
        } catch (error) {
            next(error);
        }
    };

    public generateFavicons = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (!req.file) {
            res.setHeader('HX-Retarget', '#favicon-result-container');
            res.setHeader('HX-Reswap', 'innerHTML');
            res.status(400).render('components/error-message', { errorMessage: 'No image file uploaded.' });
            return;
        }

        try {
            // Store the uploaded file in session for potential ZIP download later
            if (req.session) {
                req.session.lastUploadedFaviconSource = {
                    buffer: req.file.buffer,
                    originalname: req.file.originalname
                };
            }

            const { files, htmlTags } = await this.faviconService.generateFavicons(req.file.buffer, req.file.originalname);

            // If HTMX request, render partial
            if (req.headers['hx-request']) {
                res.setHeader('HX-Retarget', '#favicon-result-container');
                res.setHeader('HX-Reswap', 'innerHTML');
                res.render('pages/favicon-result', {
                    title: 'Generated Favicons',
                    htmlTags: htmlTags,
                    files: files.map(f => ({ name: f.fileName, type: f.contentType, size: f.buffer.length })),
                    zipDownloadLink: '/favicon-generator/download-zip'
                });
            } else {
                // For non-HTMX, redirect
                res.redirect('/favicon-generator?success=true');
            }

        } catch (error) {
            console.error('Error generating favicons:', error);
            if (req.headers['hx-request']) {
                res.setHeader('HX-Retarget', '#favicon-result-container');
                res.setHeader('HX-Reswap', 'innerHTML');
                res.status(500).render('components/error-message', { errorMessage: 'Failed to generate favicons. Please try again.' });
            } else {
                next(error);
            }
        }
    };

    public downloadZip = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (!req.session?.lastUploadedFaviconSource) {
            res.status(400).send("No source image found to generate ZIP. Please upload again.");
            return;
        }

        const { buffer, originalname } = req.session.lastUploadedFaviconSource;

        try {
            const { files } = await this.faviconService.generateFavicons(Buffer.from(buffer), originalname);

            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', 'attachment; filename=favicons.zip');

            const archive = archiver('zip', { zlib: { level: 9 } });
            archive.on('error', (err: Error) => { throw err; });
            archive.pipe(res);

            for (const file of files) {
                archive.append(file.buffer, { name: file.fileName });
            }
            await archive.finalize();

        } catch (error) {
            console.error('Error creating ZIP:', error);
            next(error);
        }
    };
} 