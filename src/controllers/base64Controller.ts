import { Request, Response } from 'express';
import multer from 'multer';
import { injectable, inject } from 'inversify';
import { TYPES } from '../config/types';
import { Base64Service } from '../services/base64Service';
import { ToolService } from '../services/toolService';
import stream from 'stream';

// Configure Multer for file uploads (in-memory storage for this example)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

@injectable()
class Base64Controller {
    constructor(
        @inject(TYPES.Base64Service) private base64Service: Base64Service,
        @inject(TYPES.ToolService) private toolService: ToolService
    ) { }

    public getBase64Page = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.toolService.recordToolUsage('base64');
            res.render('pages/base64', {
                title: 'Base64 Encoder/Decoder',
                description: 'Encode and decode Base64 strings and files.',
            });
        } catch (error) {
            console.error('Error rendering Base64 page:', error);
            res.status(500).render('pages/error', {
                title: 'Server Error',
                message: 'Could not load the Base64 tool page.'
            });
        }
    }

    public encode = async (req: Request, res: Response): Promise<void> => {
        try {
            const { text, urlSafe } = req.body;
            if (typeof text !== 'string') {
                res.setHeader('HX-Retarget', '#base64-result-container');
                res.setHeader('HX-Reswap', 'innerHTML');
                return res.status(400).render('components/error-message', {
                    errorMessage: 'Invalid input: text must be a string.'
                });
            }
            const encodedText = await this.base64Service.encodeString(text, !!urlSafe);
            res.setHeader('HX-Retarget', '#base64-result-container');
            res.setHeader('HX-Reswap', 'innerHTML');
            res.render('pages/base64-result', {
                resultType: 'Encoded Text',
                result: encodedText,
                originalText: text,
                isEncode: true,
                isText: true
            });
        } catch (error) {
            console.error('Error encoding text:', error);
            res.setHeader('HX-Retarget', '#base64-result-container');
            res.setHeader('HX-Reswap', 'innerHTML');
            res.status(500).render('components/error-message', {
                errorMessage: 'Failed to encode text. Please try again.'
            });
        }
    }

    public decode = async (req: Request, res: Response): Promise<void> => {
        try {
            const { text, urlSafe } = req.body;
            if (typeof text !== 'string') {
                res.setHeader('HX-Retarget', '#base64-result-container');
                res.setHeader('HX-Reswap', 'innerHTML');
                return res.status(400).render('components/error-message', {
                    errorMessage: 'Invalid input: text must be a string.'
                });
            }
            const decodedText = await this.base64Service.decodeString(text, !!urlSafe);
            res.setHeader('HX-Retarget', '#base64-result-container');
            res.setHeader('HX-Reswap', 'innerHTML');
            res.render('pages/base64-result', {
                resultType: 'Decoded Text',
                result: decodedText,
                originalText: text,
                isEncode: false,
                isText: true
            });
        } catch (error: any) {
            console.error('Error decoding text:', error);
            res.setHeader('HX-Retarget', '#base64-result-container');
            res.setHeader('HX-Reswap', 'innerHTML');
            res.status(500).render('components/error-message', {
                errorMessage: error.message || 'Failed to decode text. The input may not be valid Base64. Please try again.'
            });
        }
    }

    public encodeFile = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.file) {
                res.setHeader('HX-Retarget', '#base64-result-container');
                res.setHeader('HX-Reswap', 'innerHTML');
                return res.status(400).render('components/error-message', {
                    errorMessage: 'No file uploaded.'
                });
            }
            const { urlSafe } = req.body;
            const inputStream = new stream.PassThrough();
            inputStream.end(req.file.buffer);
            const encodedFileContent = await this.base64Service.encodeFile(inputStream, !!urlSafe);

            res.setHeader('HX-Retarget', '#base64-result-container');
            res.setHeader('HX-Reswap', 'innerHTML');
            res.render('pages/base64-result', {
                resultType: 'Encoded File Content',
                result: encodedFileContent,
                originalFileName: req.file.originalname,
                isEncode: true,
                isText: false
            });
        } catch (error) {
            console.error('Error encoding file:', error);
            res.setHeader('HX-Retarget', '#base64-result-container');
            res.setHeader('HX-Reswap', 'innerHTML');
            res.status(500).render('components/error-message', {
                errorMessage: 'Failed to encode file. Please try again.'
            });
        }
    }

    public decodeFile = async (req: Request, res: Response): Promise<void> => {
        try {
            const { text, fileName, urlSafe } = req.body;
            if (typeof text !== 'string' || typeof fileName !== 'string') {
                return res.status(400).render('pages/error', {
                    title: 'Input Error',
                    message: 'Invalid input: text and fileName must be strings.'
                });
            }
            const decodedBytes = await this.base64Service.decodeToBytes(text, !!urlSafe);
            res.setHeader('Content-Disposition', `attachment; filename="${fileName || 'decoded_file'}"`);
            res.setHeader('Content-Type', 'application/octet-stream');
            res.send(decodedBytes);
        } catch (error: any) {
            console.error('Error decoding file:', error);
            res.status(500).render('pages/error', {
                title: 'Decode Error',
                message: error.message || 'Failed to decode file content. The input may not be valid Base64.'
            });
        }
    }
}

export { Base64Controller };

export const base64UploadMiddleware = upload; 