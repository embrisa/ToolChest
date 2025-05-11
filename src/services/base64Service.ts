import { injectable } from 'inversify';

export interface Base64Service {
    encodeString(input: string, urlSafe?: boolean): string;
    decodeString(input: string, urlSafe?: boolean): string; // Should handle potential errors
    encodeFile(inputStream: NodeJS.ReadableStream, urlSafe?: boolean): Promise<string>;
    decodeToBytes(input: string, urlSafe?: boolean): Buffer; // Should handle potential errors
}

@injectable()
export class Base64ServiceImpl implements Base64Service {
    constructor() { }

    encodeString(input: string, urlSafe: boolean = false): string {
        const buffer = Buffer.from(input, 'utf-8');
        return urlSafe ? buffer.toString('base64url') : buffer.toString('base64');
    }

    decodeString(input: string, urlSafe: boolean = false): string {
        const encoding = urlSafe ? 'base64url' : 'base64';
        const regex = urlSafe ? /^[A-Za-z0-9_\-]*=?=?$/ : /^[A-Za-z0-9+\/]*=?=?$/;

        if (!regex.test(input)) {
            throw new Error('Invalid Base64 string format');
        }

        try {
            const buffer = Buffer.from(input, encoding);
            // Further check: if the original string had non-padding chars but buffer is empty, it was invalid.
            // Buffer.from is lenient, e.g. Buffer.from("a", "base64").toString("utf-8") is empty.
            // Also, if re-encoding doesn't match (stripping padding for comparison as it might be re-added differently or omitted)
            const reEncoded = buffer.toString(encoding);
            if (input.length > 0 && buffer.length === 0 && !/^=*$/.test(input)) {
                throw new Error('Invalid Base64 string content');
            }
            // This check is tricky because padding can be stripped or added differently by toString()
            // A simple check is if input had significant chars, output must have produced them back.
            // For example, `Buffer.from("ab==", "base64").toString("base64")` is `"ab=="`
            // `Buffer.from("abc=", "base64").toString("base64")` is `"abc="`
            // `Buffer.from("abcd", "base64").toString("base64")` is `"abcd"`
            // `Buffer.from("abc", "base64").toString("base64")` is `"YWJj"` (different!)
            // The regex handles most structural issues. The Buffer.from leniency is the main problem.
            // Let's trust the regex for format and be careful with re-encoding checks.

            const decoded = buffer.toString('utf-8');

            // If input was not empty but decoded is, and input wasn't just padding, it was likely invalid
            // e.g. Buffer.from("$","base64").toString("utf-8") is empty
            if (input && !/^=*$/.test(input) && !decoded && buffer.length === 0) {
                throw new Error('Invalid Base64 string content after decoding');
            }

            return decoded;
        } catch (error) {
            if (error instanceof Error && (error.message.startsWith('Invalid Base64 string format') || error.message.startsWith('Invalid Base64 string content'))) {
                throw error;
            }
            // console.error('Base64 decoding error:', error);
            throw new Error('Invalid Base64 string'); // Generic fallback
        }
    }

    async encodeFile(inputStream: NodeJS.ReadableStream, urlSafe: boolean = false): Promise<string> {
        const chunks: Buffer[] = [];
        for await (const chunk of inputStream) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        const buffer = Buffer.concat(chunks);
        return urlSafe ? buffer.toString('base64url') : buffer.toString('base64');
    }

    decodeToBytes(input: string, urlSafe: boolean = false): Buffer {
        const encoding = urlSafe ? 'base64url' : 'base64';
        const regex = urlSafe ? /^[A-Za-z0-9_\-]*=?=?$/ : /^[A-Za-z0-9+\/]*=?=?$/;

        if (!regex.test(input)) {
            throw new Error('Invalid Base64 string format for byte conversion');
        }

        try {
            const buffer = Buffer.from(input, encoding);
            if (input.length > 0 && buffer.length === 0 && !/^=*$/.test(input)) {
                throw new Error('Invalid Base64 string content for byte conversion');
            }
            return buffer;
        } catch (error) {
            if (error instanceof Error && (error.message.startsWith('Invalid Base64 string format') || error.message.startsWith('Invalid Base64 string content'))) {
                throw error;
            }
            // console.error('Base64 decoding to bytes error:', error);
            throw new Error('Invalid Base64 string for byte conversion');
        }
    }
} 