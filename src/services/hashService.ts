import { injectable } from 'inversify';
import crypto from 'crypto';
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

@injectable()
export class HashServiceImpl implements HashService {
    async generateHashFromString(data: string, algorithm: HashAlgorithm): Promise<HashResult> {
        const hash = crypto.createHash(algorithm);
        hash.update(data, 'utf-8');
        return {
            hex: hash.digest('hex'),
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