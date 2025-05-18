Okay, let's explore another useful utility for your ToolChest: a **Hash Generator**.

This tool is a staple for developers and anyone needing to verify data integrity or create simple checksums. It fits well with your existing stack and privacy-first approach.

### New Tool Suggestion: Hash Generator

A **Hash Generator** tool allows users to input text or upload a file and generate its hash value using various common algorithms (MD5, SHA1, SHA256, SHA512, etc.).

### 1\. Specification for Hash Generator

#### 1.1. Core Goal

To provide a simple and reliable way for users to generate cryptographic hashes of their input data (text or files) using a selection of standard hashing algorithms.

#### 1.2. Key Features

  * **Input Methods:**
      * Text input: A textarea for users to paste or type text.
      * File input: Allow users to upload a file to generate its hash. This is crucial for larger data and binary files.
  * **Algorithm Selection:**
      * Provide a selection of common hashing algorithms:
          * MD5
          * SHA-1
          * SHA-256
          * SHA-384
          * SHA-512
      * Clearly indicate the selected algorithm.
  * **Output:**
      * Display the generated hash in hexadecimal format.
      * Provide an easy way to copy the generated hash to the clipboard.
      * Optionally, display the hash in Base64 format as well.
  * **User Experience:**
      * **Privacy-focused:** Hashing is a one-way process. For text input, processing can be done client-side or server-side (no storage needed). For file input, server-side processing is likely required; ensure files are processed in-memory or deleted immediately after hashing. No input data or generated hashes should be stored.
      * **Real-time (for text):** Optionally, for text input, the hash could update in real-time as the user types (using HTMX or client-side JavaScript).
      * **Clear Feedback:** Indicate processing status, especially for larger files. Display errors clearly.
      * **Accessibility & Ease of Use:** Intuitive interface, keyboard navigable, and ARIA attributes where appropriate.

#### 1.3. Technical Considerations

  * **Hashing Library:** Node.js has a built-in `crypto` module which supports all the listed algorithms. This avoids adding new external dependencies for the core logic.
    ```javascript
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    hash.update('your data to hash');
    console.log(hash.digest('hex'));
    ```
  * **File Handling:**
      * Use `multer` (already in your stack) for file uploads.
      * For large files, process them using streams to avoid loading the entire file into memory on the server. The `crypto.Hash` object in Node.js supports stream piping.
  * **HTMX Integration:** Use HTMX to submit the form and update the result area without a full page reload.

### 2\. Implementation Guide

This guide follows the existing architecture and conventions of the ToolChest project.

#### 2.1. Add to Database (Prisma)

1.  **Update Seed Script (`src/database/seeds/seed.ts`)**:
      * Add the Hash Generator tool details. You might want to create a "Security" or "Cryptography" tag if it doesn't exist.
    <!-- end list -->
    ```typescript
    // In src/database/seeds/seed.ts
    // ... (ensure relevant tags like 'security' or 'cryptography' exist or create them)
    const securityTag = await prisma.tag.upsert({
        where: { slug: 'security' },
        update: {},
        create: {
            name: 'Security',
            slug: 'security',
            description: 'Tools related to security and cryptography',
            color: '#F59E0B', // Amber example
        },
    });

    const hashGeneratorTool = await prisma.tool.upsert({
        where: { slug: 'hash-generator' },
        update: {},
        create: {
            name: 'Hash Generator',
            slug: 'hash-generator',
            description: 'Generate MD5, SHA1, SHA256, SHA512 hashes from text or files.',
            iconClass: 'fas fa-hashtag', // Example Font Awesome icon
            displayOrder: 3, // Or next available order
            isActive: true,
            tags: {
                create: [
                    { tagId: securityTag.id },
                    // { tagId: textTag.id }, // If you consider it a text utility too
                ],
            },
        },
    });
    console.log(`Created tool with id: ${hashGeneratorTool.id}`);
    ```
2.  **Run Seed Script**:
      * `npm run db:seed` (This assumes the tool entry doesn't require a schema change, only adding data. If you add specific fields for this tool to the `Tool` model, you'd need a migration first).

#### 2.2. Create Service (`HashService`)

1.  **Define Interface (`src/services/hashService.ts`):**
    ```typescript
    import { Readable } from 'stream';

    export type HashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha384' | 'sha512';

    export interface HashResult {
        hex: string;
        base64?: string; // Optional
    }

    export interface HashService {
        generateHashFromString(data: string, algorithm: HashAlgorithm): Promise<HashResult>;
        generateHashFromFile(stream: Readable, algorithm: HashAlgorithm): Promise<HashResult>;
    }
    ```
2.  **Implement Service (`src/services/hashService.ts`):**
    ```typescript
    import { injectable } from 'inversify';
    import crypto from 'crypto';
    import { Readable } from 'stream';
    import { HashService, HashAlgorithm, HashResult } from './hashService'; // Adjust path

    @injectable()
    export class HashServiceImpl implements HashService {
        async generateHashFromString(data: string, algorithm: HashAlgorithm): Promise<HashResult> {
            const hash = crypto.createHash(algorithm);
            hash.update(data, 'utf-8');
            return {
                hex: hash.digest('hex'),
                // base64: hash.digest('base64') // Node's hash object can only digest once
            };
        }

        async generateHashFromFile(stream: Readable, algorithm: HashAlgorithm): Promise<HashResult> {
            return new Promise((resolve, reject) => {
                const hash = crypto.createHash(algorithm);
                stream.on('data', (chunk) => {
                    hash.update(chunk);
                });
                stream.on('end', () => {
                    resolve({
                        hex: hash.digest('hex'),
                    });
                });
                stream.on('error', (err) => {
                    reject(err);
                });
            });
        }
    }
    ```
3.  **Update Inversify Config (`src/config/inversify.config.ts`):**
    ```typescript
    // ... other imports
    import { HashService, HashServiceImpl } from '../services/hashService'; // Adjust path
    import { HashController } from '../controllers/hashController'; // Adjust path

    // ...
    appContainer.bind<HashService>(TYPES.HashService).to(HashServiceImpl).inSingletonScope();
    appContainer.bind<HashController>(TYPES.HashController).to(HashController).inSingletonScope();
    ```
4.  **Update Types (`src/config/types.ts`):**
    ```typescript
    export const TYPES = {
        // ... other types
        HashService: Symbol.for('HashService'),
        HashController: Symbol.for('HashController'),
    };
    ```

#### 2.3. Create Controller (`HashController`)

1.  **Create `src/controllers/hashController.ts`:**
    ```typescript
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
        ) {}

        public getHashPage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                await this.toolService.recordToolUsage('hash-generator');
                const algorithms: HashAlgorithm[] = ['md5', 'sha1', 'sha256', 'sha384', 'sha512'];
                res.render('pages/hash-generator', { // Create this Nunjucks template
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
                    res.render('pages/hash-result', { // Create this Nunjucks template
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
    ```

#### 2.4. Create Routes (`src/routes/hashRoutes.ts`)

1.  **Create `src/routes/hashRoutes.ts`:**
    ```typescript
    import { Router } from 'express';
    import { Container } from 'inversify';
    import { TYPES } from '../config/types';
    import { HashController, hashUploadMiddleware } from '../controllers/hashController';

    export function setupHashRoutes(router: Router, container: Container): void {
        const hashController = container.get<HashController>(TYPES.HashController);

        router.get('/', hashController.getHashPage);
        router.post('/generate', hashUploadMiddleware.single('inputFile'), hashController.generateHash);
    }
    ```
2.  **Update `src/app.ts` to include new routes:**
    ```typescript
    // ... other imports
    import { setupHashRoutes } from './routes/hashRoutes'; // Adjust path

    export function createApp(): Application {
        // ... app setup
        const hashRouter = Router();
        setupHashRoutes(hashRouter, appContainer);
        app.use('/hash-generator', hashRouter);
        // ... error handlers
        return app;
    }
    ```

#### 2.5. Create Nunjucks Templates

1.  **`src/templates/pages/hash-generator.njk`**:

    ```html
    {% extends "layouts/base.njk" %}

    {% block content %}
    <div class="container mx-auto px-4 py-8">
        <header class="mb-8 text-center">
            <h1 class="text-4xl font-bold text-white">{{ title }}</h1>
            <p class="text-lg text-gray-400">{{ description }}</p>
        </header>

        {% if errorMessage %}
            <div class="bg-danger/20 border border-danger text-danger px-4 py-3 rounded relative mb-4 max-w-md mx-auto" role="alert">
                <strong class="font-bold">Error:</strong>
                <span class="block sm:inline">{{ errorMessage }}</span>
            </div>
        {% endif %}

        <form hx-post="/hash-generator/generate" hx-target="#hash-result-container" hx-swap="innerHTML"
              hx-encoding="multipart/form-data" class="bg-white/10 p-6 rounded-lg shadow-xl max-w-lg mx-auto">

            <div class="mb-4">
                <label for="algorithm" class="block text-sm font-medium text-gray-300 mb-1">Algorithm</label>
                <select name="algorithm" id="algorithm" required
                        class="block w-full bg-navy-900/70 border-gray-700 text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ocean-400 focus:border-ocean-400 sm:text-sm">
                    {% for algo in algorithms %}
                    <option value="{{ algo }}" {% if algo === 'sha256' %}selected{% endif %}>{{ algo | upper }}</option>
                    {% endfor %}
                </select>
            </div>

            <div class="mb-4">
                <label for="inputText" class="block text-sm font-medium text-gray-300 mb-1">Text Input</label>
                <textarea name="inputText" id="inputText" rows="4"
                          class="block w-full bg-navy-900/70 border-gray-700 text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ocean-400 focus:border-ocean-400 sm:text-sm"
                          placeholder="Enter text here or upload a file below"></textarea>
            </div>

            <div class="mb-6">
                <label for="inputFile" class="block text-sm font-medium text-gray-300 mb-1">Or Upload File</label>
                <input type="file" name="inputFile" id="inputFile"
                       class="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0 file:text-sm file:font-semibold
                              file:bg-ocean-700/30 file:text-ocean-100 hover:file:bg-ocean-700/50
                              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean-400 focus:ring-offset-navy-900">
                <p class="mt-1 text-xs text-gray-500">Max file size: 10MB.</p>
            </div>

            <div class="text-center">
                <button type="submit" class="btn-primary px-6 py-2.5 text-sm">
                    Generate Hash
                    <span class="htmx-indicator inline-block ml-2">
                        <i class="fas fa-spinner fa-spin"></i>
                    </span>
                </button>
            </div>
        </form>

        <div id="hash-result-container" class="mt-10">
            {% if result %}
                {% include "pages/hash-result.njk" %}
            {% endif %}
        </div>
    </div>
    {% endblock %}
    ```

2.  **`src/templates/pages/hash-result.njk`**: (Partial template for HTMX)

    ```html
    <div class="bg-white/5 p-6 rounded-lg shadow-md max-w-lg mx-auto">
        <h2 class="text-2xl font-semibold text-white mb-4">Hash Result</h2>

        {% if inputSummary %}
        <div class="mb-3">
            <p class="text-sm text-gray-400">Input: <span class="font-medium text-gray-300">{{ inputSummary }}</span></p>
            <p class="text-sm text-gray-400">Algorithm: <span class="font-medium text-gray-300">{{ algorithm }}</span></p>
        </div>
        {% endif %}

        {% if hexHash %}
        <div class="mb-1">
            <label for="hexHashOutput" class="block text-sm font-medium text-gray-300">Hexadecimal Hash:</label>
            <textarea id="hexHashOutput" readonly rows="3"
                      class="mt-1 block w-full bg-navy-900/70 border-gray-700 text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ocean-400 focus:border-ocean-400 sm:text-sm select-all font-mono">{{ hexHash }}</textarea>
        </div>
        <button onclick="navigator.clipboard.writeText(document.getElementById('hexHashOutput').value)"
                class="mt-2 text-xs bg-ocean-700/50 hover:bg-ocean-700/70 text-white py-1 px-3 rounded">
            Copy Hex Hash
        </button>
        {% elif errorMessage %}
            {# This part is handled by components/error-message.njk if retargeted there by controller #}
            <p class="text-danger">{{ errorMessage }}</p>
        {% else %}
            <p class="text-gray-400">No result generated yet.</p>
        {% endif %}
    </div>
    ```

#### 2.6. Add Tests

  * **`HashService` tests (`tests/services/hashService.test.ts`):**
      * Mock `crypto` module if necessary (though for direct usage, it might not be needed).
      * Test `generateHashFromString` for all supported algorithms with known inputs and outputs.
      * Test `generateHashFromFile` with mock readable streams for all algorithms. Test with empty streams and streams with data.
      * Test error handling for file streams.
  * **`HashController` tests (`tests/routes/hashRoutes.test.ts`):**
      * Mock `HashService` and `ToolService`.
      * Test `GET /hash-generator` page rendering.
      * Test `POST /hash-generator/generate` with text input and file input.
          * Verify HTMX response headers and content.
          * Verify `HashService` methods are called correctly.
      * Test input validation (missing input, missing algorithm, invalid algorithm, both text and file provided).
      * Test error handling when `HashService` throws an error.

#### 2.7. Update Documentation & UI

  * Ensure the "Hash Generator" appears on the homepage and relevant tool listing pages.
  * Apply styles consistent with `Theme.md`.
  * Update `README.md` to mention the new tool.

This comprehensive guide should help you implement the Hash Generator tool into your ToolChest application. Remember to adapt the file paths and minor details to your exact project structure and coding style.