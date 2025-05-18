import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import multer from 'multer';
import stream from 'stream';
import { TYPES } from '../config/types';
import { HashService, HashAlgorithm } from '../services/hashService';
import { ToolService } from '../services/toolService';

const storage = multer.memoryStorage(); // For small files or use diskStorage for larger ones
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit, adjust as needed
});
export const hashUploadMiddleware = upload;

@injectable()
export class HashController {
    constructor(
        @inject(TYPES.HashService) private hashService: HashService,
        @inject(TYPES.ToolService) private toolService: ToolService
    ) { }

    public getHashPage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await this.toolService.recordToolUsage('hash-generator');
            const algorithms: HashAlgorithm[] = ['md5', 'sha1', 'sha256', 'sha384', 'sha512'];
            res.render('pages/hash-generator', {
                title: 'Hash Generator',
                description: 'Generate cryptographic hashes for text or files.',
                algorithms,
            });
        } catch (error) {
            next(error);
        }
    };

    public generateHash = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { inputText, algorithm } = req.body;
        const file = req.file;

        if (!algorithm || !['md5', 'sha1', 'sha256', 'sha384', 'sha512'].includes(algorithm)) {
            return this.sendError(res, 'Invalid algorithm selected.', req.headers['hx-request'] === 'true');
        }
        if (!inputText && !file) {
            return this.sendError(res, 'No input text or file provided.', req.headers['hx-request'] === 'true');
        }
        if (inputText && file) {
            return this.sendError(res, 'Provide either text or a file, not both.', req.headers['hx-request'] === 'true');
        }

        try {
            let hashResult;
            let inputSummary;

            if (inputText) {
                inputSummary = `Text: "${inputText.substring(0, 50)}${inputText.length > 50 ? '...' : ''}"`;
                hashResult = await this.hashService.generateHashFromString(inputText, algorithm as HashAlgorithm);
            } else if (file) {
                inputSummary = `File: ${file.originalname} (${(file.size / 1024).toFixed(2)} KB)`;
                const bufferStream = new stream.PassThrough();
                bufferStream.end(file.buffer);
                hashResult = await this.hashService.generateHashFromFile(bufferStream, algorithm as HashAlgorithm);
            }

            if (req.headers['hx-request']) {
                res.setHeader('HX-Retarget', '#hash-result-container');
                res.setHeader('HX-Reswap', 'innerHTML');
                res.render('pages/hash-result', {
                    inputSummary,
                    algorithm: (algorithm as string).toUpperCase(),
                    hexHash: hashResult?.hex,
                });
            } else {
                // Fallback for non-HTMX or initial page load with result (if applicable)
                const algorithms: HashAlgorithm[] = ['md5', 'sha1', 'sha256', 'sha384', 'sha512'];
                res.render('pages/hash-generator', {
                    title: 'Hash Generator',
                    description: 'Generate cryptographic hashes for text or files.',
                    algorithms,
                    result: {
                        inputSummary,
                        algorithm: (algorithm as string).toUpperCase(),
                        hexHash: hashResult?.hex,
                    }
                });
            }
        } catch (error: any) {
            console.error('Error generating hash:', error);
            this.sendError(res, error.message || 'Failed to generate hash.', req.headers['hx-request'] === 'true');
        }
    };

    private sendError(res: Response, message: string, isHtmx: boolean) {
        if (isHtmx) {
            res.setHeader('HX-Retarget', '#hash-result-container');
            res.setHeader('HX-Reswap', 'innerHTML');
            res.status(400).render('components/error-message', { errorMessage: message });
        } else {
            // For non-HTMX, could render the full page with an error section
            const algorithms: HashAlgorithm[] = ['md5', 'sha1', 'sha256', 'sha384', 'sha512'];
            res.status(400).render('pages/hash-generator', {
                title: 'Hash Generator',
                description: 'Generate cryptographic hashes for text or files.',
                algorithms,
                errorMessage: message
            });
        }
    }
} 