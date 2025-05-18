import { injectable } from 'inversify';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

export interface FaviconOutput {
    fileName: string;
    contentType: string;
    buffer: Buffer;
}

export interface GeneratedFavicons {
    files: FaviconOutput[];
    htmlTags: string;
}

export interface FaviconService {
    generateFavicons(sourceImageBuffer: Buffer, originalFileName: string): Promise<GeneratedFavicons>;
}

@injectable()
export class FaviconServiceImpl implements FaviconService {
    async generateFavicons(sourceImageBuffer: Buffer, originalFileName: string): Promise<GeneratedFavicons> {
        const files: FaviconOutput[] = [];
        let htmlTags = '';

        const baseName = originalFileName.substring(0, originalFileName.lastIndexOf('.')) || 'favicon';

        // Generate ICO (16x16, 32x32, 48x48)
        try {
            // Convert image to PNG for ICO generation if it's not already a PNG
            const pngBuffer = await sharp(sourceImageBuffer)
                .png()
                .toBuffer();

            const icoBuffer = await pngToIco(pngBuffer);
            if (icoBuffer) {
                files.push({ fileName: 'favicon.ico', contentType: 'image/x-icon', buffer: icoBuffer });
                htmlTags += `<link rel="icon" href="/favicon.ico" sizes="any">\n`; // Modern browsers prefer any
                htmlTags += `<link rel="shortcut icon" href="/favicon.ico">\n`; // Legacy
            }
        } catch (error) {
            console.error('Error generating ICO:', error);
            // Optionally throw or log, proceed with PNGs
        }

        // Standard PNG sizes
        const pngSizes = [
            { size: 32, rel: 'icon', type: 'image/png' },
            { size: 16, rel: 'icon', type: 'image/png' },
            { size: 96, rel: 'icon', type: 'image/png' },
            { size: 180, rel: 'apple-touch-icon', type: 'image/png' }, // Apple Touch Icon
            { size: 192, rel: 'icon', type: 'image/png' }, // Android Chrome
            { size: 512, rel: 'icon', type: 'image/png' }, // Android Chrome (larger)
        ];

        for (const { size, rel } of pngSizes) {
            try {
                const pngBuffer = await sharp(sourceImageBuffer)
                    .resize(size, size)
                    .png()
                    .toBuffer();
                const fileName = rel === 'apple-touch-icon' ? `apple-touch-icon-${size}x${size}.png` : `favicon-${size}x${size}.png`;
                files.push({ fileName, contentType: 'image/png', buffer: pngBuffer });
                if (rel === 'apple-touch-icon') {
                    htmlTags += `<link rel="${rel}" sizes="${size}x${size}" href="/${fileName}">\n`;
                } else {
                    htmlTags += `<link rel="${rel}" type="image/png" sizes="${size}x${size}" href="/${fileName}">\n`;
                }
            } catch (error) {
                console.error(`Error generating PNG ${size}x${size}:`, error);
            }
        }

        // Add manifest link
        htmlTags += `<link rel="manifest" href="/site.webmanifest">\n`;

        return { files, htmlTags };
    }
} 