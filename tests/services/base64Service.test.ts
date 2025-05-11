import { Base64ServiceImpl } from '../../src/services/base64Service';
import { Readable } from 'stream';

describe('Base64ServiceImpl', () => {
    let service: Base64ServiceImpl;

    beforeEach(() => {
        service = new Base64ServiceImpl();
    });

    describe('encodeString', () => {
        test('should encode a string to standard base64', () => {
            expect(service.encodeString('hello world')).toBe('aGVsbG8gd29ybGQ=');
        });

        test('should encode a string to URL-safe base64', () => {
            expect(service.encodeString('hello world?/', true)).toBe('aGVsbG8gd29ybGQ_Lw');
        });

        test('should encode an empty string', () => {
            expect(service.encodeString('')).toBe('');
        });
    });

    describe('decodeString', () => {
        test('should decode a standard base64 string', () => {
            expect(service.decodeString('aGVsbG8gd29ybGQ=')).toBe('hello world');
        });

        test('should decode a URL-safe base64 string', () => {
            expect(service.decodeString('aGVsbG8gd29ybGQ_Lw', true)).toBe('hello world?/');
        });

        test('should decode an empty base64 string', () => {
            expect(service.decodeString('')).toBe('');
        });

        test('should throw an error for an invalid standard base64 string', () => {
            expect(() => service.decodeString('invalid-')).toThrow('Invalid Base64 string format');
        });

        test('should throw an error for an invalid URL-safe base64 string', () => {
            expect(() => service.decodeString('invalid+', true)).toThrow('Invalid Base64 string format');
        });
    });

    describe('encodeFile', () => {
        test('should encode a file stream to standard base64', async () => {
            const content = 'hello file content';
            const stream = Readable.from(content);
            expect(await service.encodeFile(stream)).toBe(Buffer.from(content).toString('base64'));
        });

        test('should encode a file stream to URL-safe base64', async () => {
            const content = 'hello file content?/';
            const stream = Readable.from(content);
            expect(await service.encodeFile(stream, true)).toBe(Buffer.from(content).toString('base64url'));
        });

        test('should encode an empty file stream', async () => {
            const stream = Readable.from('');
            expect(await service.encodeFile(stream)).toBe('');
        });
    });

    describe('decodeToBytes', () => {
        test('should decode a standard base64 string to a Buffer', () => {
            const expectedBuffer = Buffer.from('hello bytes');
            const base64String = expectedBuffer.toString('base64');
            expect(service.decodeToBytes(base64String)).toEqual(expectedBuffer);
        });

        test('should decode a URL-safe base64 string to a Buffer', () => {
            const expectedBuffer = Buffer.from('hello bytes?/');
            const base64urlString = expectedBuffer.toString('base64url');
            expect(service.decodeToBytes(base64urlString, true)).toEqual(expectedBuffer);
        });

        test('should return an empty Buffer for an empty base64 string', () => {
            expect(service.decodeToBytes('')).toEqual(Buffer.from(''));
        });

        test('should throw an error for an invalid standard base64 string', () => {
            expect(() => service.decodeToBytes('invalid-')).toThrow('Invalid Base64 string format for byte conversion');
        });

        test('should throw an error for an invalid URL-safe base64 string', () => {
            expect(() => service.decodeToBytes('invalid+', true)).toThrow('Invalid Base64 string format for byte conversion');
        });
    });
}); 