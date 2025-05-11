import request from 'supertest';
import { createApp } from '../../src/app';
import { Application } from 'express';
import { appContainer as container } from '../../src/config/inversify.config';
import { TYPES } from '../../src/config/types';
import { ToolService } from '../../src/services/toolService';
import { Base64Service } from '../../src/services/base64Service';
import { Readable } from 'stream';
import { ToolDTO } from '../../src/dto/tool.dto';
import { TagDTO } from '../../src/dto/tag.dto';
import { Base64Controller } from '../../src/controllers/base64Controller';

// Mock services - methods will be reset and configured per test
const mockToolService: jest.Mocked<ToolService> = {
    getAllTools: jest.fn(),
    getToolBySlug: jest.fn(),
    getToolsByTag: jest.fn(),
    getAllTags: jest.fn(),
    getTagBySlug: jest.fn(),
    recordToolUsage: jest.fn(),
    getPopularTools: jest.fn(),
    searchTools: jest.fn(),
    getToolsPaginated: jest.fn(),
    getToolsByTagPaginated: jest.fn(),
};

const mockBase64Service: jest.Mocked<Base64Service> = {
    encodeString: jest.fn(),
    decodeString: jest.fn(),
    encodeFile: jest.fn(),
    decodeToBytes: jest.fn(),
};

describe('Base64 Routes', () => {
    let app: Application;

    beforeEach(() => {
        // Reset mock method implementations
        mockToolService.recordToolUsage = jest.fn();
        mockBase64Service.encodeString = jest.fn();
        mockBase64Service.decodeString = jest.fn();
        mockBase64Service.encodeFile = jest.fn();
        mockBase64Service.decodeToBytes = jest.fn();

        // Unbind and rebind services with mocks
        if (container.isBound(TYPES.ToolService)) {
            container.unbind(TYPES.ToolService);
        }
        container.bind<ToolService>(TYPES.ToolService).toConstantValue(mockToolService);

        if (container.isBound(TYPES.Base64Service)) {
            container.unbind(TYPES.Base64Service);
        }
        container.bind<Base64Service>(TYPES.Base64Service).toConstantValue(mockBase64Service);

        // Force re-creation of Base64Controller with new mocks
        if (container.isBound(TYPES.Base64Controller)) {
            container.unbind(TYPES.Base64Controller);
        }
        // Re-bind Base64Controller so it can be resolved again. 
        // It's defined as a singleton in inversify.config.ts, so this new binding will also be singleton.
        container.bind<Base64Controller>(TYPES.Base64Controller).to(Base64Controller).inSingletonScope();

        // app = createApp(); // App creation moved to individual tests
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /base64', () => {
        it('should render base64 page, record usage, and return 200', async () => {
            mockToolService.recordToolUsage.mockResolvedValue(undefined as void);
            app = createApp();

            const response = await request(app).get('/base64');

            expect(response.status).toBe(200);
            expect(response.text).toContain('Base64 Encoder/Decoder');
            expect(mockToolService.recordToolUsage).toHaveBeenCalledTimes(1);
            expect(mockToolService.recordToolUsage).toHaveBeenCalledWith('base64');
        });

        it('should return 500 if ToolService fails for GET /base64', async () => {
            mockToolService.recordToolUsage.mockRejectedValue(new Error('Service Error'));
            app = createApp();

            const response = await request(app).get('/base64');

            expect(response.status).toBe(500);
            expect(response.text).toContain('Server Error');
            expect(response.text).toContain('Could not load the Base64 tool page.');
            expect(mockToolService.recordToolUsage).toHaveBeenCalledTimes(1);
        });
    });

    describe('POST /base64/encode', () => {
        it('should encode text, render result via HTMX, and return 200', async () => {
            const inputText = 'hello world';
            const encodedText = 'aGVsbG8gd29ybGQ=';
            mockBase64Service.encodeString.mockReturnValue(encodedText);
            app = createApp();

            const response = await request(app)
                .post('/base64/encode')
                .send({ text: inputText, urlSafe: false });

            expect(response.status).toBe(200);
            expect(response.headers['hx-retarget']).toBe('#base64-result-container');
            expect(response.headers['hx-reswap']).toBe('innerHTML');
            // Check for the actual title from the controller, not the template default
            expect(response.text).toContain('Encoded Text');
            expect(response.text).toContain(encodedText);
            expect(response.text).toContain(inputText);
            expect(mockBase64Service.encodeString).toHaveBeenCalledTimes(1);
            expect(mockBase64Service.encodeString).toHaveBeenCalledWith(inputText, false);
        });

        it('should return 400 for invalid input (non-string) for POST /base64/encode', async () => {
            app = createApp();
            const response = await request(app)
                .post('/base64/encode')
                .send({ text: 123, urlSafe: false });

            expect(response.status).toBe(400);
            expect(response.headers['hx-retarget']).toBe('#base64-result-container');
            expect(response.headers['hx-reswap']).toBe('innerHTML');
            expect(response.text).toContain('Invalid input: text must be a string.');
            expect(mockBase64Service.encodeString).not.toHaveBeenCalled();
        });

        it('should return 500 if Base64Service.encodeString throws an error', async () => {
            mockBase64Service.encodeString.mockImplementation(() => { throw new Error('Encoding Error'); });
            app = createApp();

            const response = await request(app)
                .post('/base64/encode')
                .send({ text: 'test', urlSafe: false });

            expect(response.status).toBe(500);
            expect(response.headers['hx-retarget']).toBe('#base64-result-container');
            expect(response.headers['hx-reswap']).toBe('innerHTML');
            expect(response.text).toContain('Failed to encode text. Please try again.');
            expect(mockBase64Service.encodeString).toHaveBeenCalledTimes(1);
        });
    });

    describe('POST /base64/decode', () => {
        it('should decode text, render result via HTMX, and return 200', async () => {
            const inputText = 'aGVsbG8gd29ybGQ=';
            const decodedText = 'hello world';
            mockBase64Service.decodeString.mockReturnValue(decodedText);
            app = createApp();

            const response = await request(app)
                .post('/base64/decode')
                .send({ text: inputText, urlSafe: false });

            expect(response.status).toBe(200);
            expect(response.headers['hx-retarget']).toBe('#base64-result-container');
            expect(response.headers['hx-reswap']).toBe('innerHTML');
            expect(response.text).toContain('Decoded Text');
            expect(response.text).toContain(decodedText);
            expect(response.text).toContain(inputText);
            expect(mockBase64Service.decodeString).toHaveBeenCalledTimes(1);
            expect(mockBase64Service.decodeString).toHaveBeenCalledWith(inputText, false);
        });

        it('should return 400 for invalid input (non-string) for POST /base64/decode', async () => {
            app = createApp();
            const response = await request(app)
                .post('/base64/decode')
                .send({ text: 123, urlSafe: false });

            expect(response.status).toBe(400);
            expect(response.headers['hx-retarget']).toBe('#base64-result-container');
            expect(response.headers['hx-reswap']).toBe('innerHTML');
            expect(response.text).toContain('Invalid input: text must be a string.');
            expect(mockBase64Service.decodeString).not.toHaveBeenCalled();
        });

        it('should return 500 if Base64Service.decodeString throws an error (e.g. invalid base64)', async () => {
            const errorMessage = 'Invalid Base64 input'; // Service specific error
            mockBase64Service.decodeString.mockImplementation(() => { throw new Error(errorMessage); });
            app = createApp();

            const response = await request(app)
                .post('/base64/decode')
                .send({ text: 'not base64!!!', urlSafe: false });

            expect(response.status).toBe(500);
            expect(response.headers['hx-retarget']).toBe('#base64-result-container');
            expect(response.headers['hx-reswap']).toBe('innerHTML');
            expect(response.text).toContain(errorMessage); // Controller should pass the service error
            expect(mockBase64Service.decodeString).toHaveBeenCalledTimes(1);
        });
    });

    describe('POST /base64/encode-file', () => {
        it('should encode file, render result via HTMX, and return 200', async () => {
            const fileContent = 'file content here';
            const fileName = 'test.txt';
            const encodedFileContent = 'ZmlsZSBjb250ZW50IGhlcmU=';
            mockBase64Service.encodeFile.mockResolvedValue(encodedFileContent);
            app = createApp();

            const response = await request(app)
                .post('/base64/encode-file')
                .attach('file', Buffer.from(fileContent), fileName)
                .field('urlSafe', 'false');

            expect(response.status).toBe(200);
            expect(response.headers['hx-retarget']).toBe('#base64-result-container');
            expect(response.headers['hx-reswap']).toBe('innerHTML');
            expect(response.text).toContain('Encoded File Content');
            expect(response.text).toContain(encodedFileContent);
            expect(response.text).toContain(fileName);
            expect(mockBase64Service.encodeFile).toHaveBeenCalledTimes(1);
            expect(mockBase64Service.encodeFile.mock.calls[0][1]).toBe(false);
        });

        it('should return 400 if no file is uploaded for POST /base64/encode-file', async () => {
            app = createApp();
            const response = await request(app)
                .post('/base64/encode-file')
                .field('urlSafe', 'false');

            expect(response.status).toBe(400);
            expect(response.headers['hx-retarget']).toBe('#base64-result-container');
            expect(response.headers['hx-reswap']).toBe('innerHTML');
            expect(response.text).toContain('No file uploaded.');
            expect(mockBase64Service.encodeFile).not.toHaveBeenCalled();
        });

        it('should return 500 if Base64Service.encodeFile fails', async () => {
            mockBase64Service.encodeFile.mockRejectedValue(new Error('File Encoding Error'));
            app = createApp();

            const response = await request(app)
                .post('/base64/encode-file')
                .attach('file', Buffer.from('file content'), 'test.txt')
                .field('urlSafe', 'false');

            expect(response.status).toBe(500);
            expect(response.headers['hx-retarget']).toBe('#base64-result-container');
            expect(response.headers['hx-reswap']).toBe('innerHTML');
            expect(response.text).toContain('Failed to encode file. Please try again.');
            expect(mockBase64Service.encodeFile).toHaveBeenCalledTimes(1);
        });
    });

    describe('POST /base64/decode-file', () => {
        it('should decode text to file and return 200 with file attachment', async () => {
            const base64Input = 'ZGVjb2RlZCBmaWxlIGNvbnRlbnQ=';
            const decodedFileContent = Buffer.from('decoded file content');
            const fileName = 'output.dat';
            mockBase64Service.decodeToBytes.mockReturnValue(decodedFileContent);
            app = createApp();

            const response = await request(app)
                .post('/base64/decode-file')
                .send({ text: base64Input, fileName: fileName, urlSafe: false });

            expect(response.status).toBe(200);
            expect(response.headers['content-disposition']).toBe(`attachment; filename="${fileName}"`);
            expect(response.headers['content-type']).toBe('application/octet-stream');
            expect(response.body).toEqual(decodedFileContent);
            expect(mockBase64Service.decodeToBytes).toHaveBeenCalledTimes(1);
            expect(mockBase64Service.decodeToBytes).toHaveBeenCalledWith(base64Input, false);
        });

        it('should return 400 if input text or fileName is missing for POST /base64/decode-file', async () => {
            app = createApp();
            let response = await request(app)
                .post('/base64/decode-file')
                .send({ fileName: 'test.txt', urlSafe: false });

            expect(response.status).toBe(400);
            expect(response.text).toContain('Input Error');
            expect(response.text).toContain('Invalid input: text and fileName must be strings.');

            response = await request(app)
                .post('/base64/decode-file')
                .send({ text: 'somebase64', urlSafe: false });

            expect(response.status).toBe(400);
            expect(response.text).toContain('Input Error');
            expect(response.text).toContain('Invalid input: text and fileName must be strings.');
            expect(mockBase64Service.decodeToBytes).not.toHaveBeenCalled();
        });

        it('should return 500 if Base64Service.decodeToBytes throws an error', async () => {
            const errorMessage = 'File Decoding Error'; // Service specific error
            mockBase64Service.decodeToBytes.mockImplementation(() => { throw new Error(errorMessage); });
            app = createApp();

            const response = await request(app)
                .post('/base64/decode-file')
                .send({ text: 'invalidbase64', fileName: 'output.txt', urlSafe: false });

            expect(response.status).toBe(500);
            expect(response.text).toContain('Decode Error');
            expect(response.text).toContain(errorMessage); // Controller should pass service error
            expect(mockBase64Service.decodeToBytes).toHaveBeenCalledTimes(1);
        });
    });
}); 