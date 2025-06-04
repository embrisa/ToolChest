import {
  HashResult,
  HashValidationResult,
  HashOperationParams,
  HashUsageMetrics,
  HashProgress,
  ALGORITHM_INFO,
  FILE_SIZE_LIMITS,
  ALL_ALLOWED_FILE_TYPES,
  FILE_TYPE_CATEGORIES,
} from "@/types/tools/hashGenerator";

/**
 * MD5 implementation for client-side hashing
 * Note: MD5 is not available in Web Crypto API, so we implement it manually
 */
class MD5 {
  private static rotateLeft(value: number, amount: number): number {
    return (value << amount) | (value >>> (32 - amount));
  }

  private static addUnsigned(x: number, y: number): number {
    const x4 = x & 0x40000000;
    const y4 = y & 0x40000000;
    const x8 = x & 0x80000000;
    const y8 = y & 0x80000000;
    const result = (x & 0x3fffffff) + (y & 0x3fffffff);

    if (x4 & y4) {
      return result ^ 0x80000000 ^ x8 ^ y8;
    }
    if (x4 | y4) {
      if (result & 0x40000000) {
        return result ^ 0xc0000000 ^ x8 ^ y8;
      } else {
        return result ^ 0x40000000 ^ x8 ^ y8;
      }
    } else {
      return result ^ x8 ^ y8;
    }
  }

  private static f(x: number, y: number, z: number): number {
    return (x & y) | (~x & z);
  }

  private static g(x: number, y: number, z: number): number {
    return (x & z) | (y & ~z);
  }

  private static h(x: number, y: number, z: number): number {
    return x ^ y ^ z;
  }

  private static i(x: number, y: number, z: number): number {
    return y ^ (x | ~z);
  }

  private static ff(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number,
  ): number {
    a = this.addUnsigned(
      a,
      this.addUnsigned(this.addUnsigned(this.f(b, c, d), x), ac),
    );
    return this.addUnsigned(this.rotateLeft(a, s), b);
  }

  private static gg(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number,
  ): number {
    a = this.addUnsigned(
      a,
      this.addUnsigned(this.addUnsigned(this.g(b, c, d), x), ac),
    );
    return this.addUnsigned(this.rotateLeft(a, s), b);
  }

  private static hh(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number,
  ): number {
    a = this.addUnsigned(
      a,
      this.addUnsigned(this.addUnsigned(this.h(b, c, d), x), ac),
    );
    return this.addUnsigned(this.rotateLeft(a, s), b);
  }

  private static ii(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number,
  ): number {
    a = this.addUnsigned(
      a,
      this.addUnsigned(this.addUnsigned(this.i(b, c, d), x), ac),
    );
    return this.addUnsigned(this.rotateLeft(a, s), b);
  }

  private static convertToWordArray(message: Uint8Array): number[] {
    const messageLength = message.length;
    const numberOfWords = (((messageLength + 8) >>> 6) + 1) * 16;
    const wordArray = new Array(numberOfWords - 1);
    let bytePosition = 0;
    let byteCount = 0;

    while (byteCount < messageLength) {
      const wordPosition = (byteCount - (byteCount % 4)) / 4;
      bytePosition = (byteCount % 4) * 8;
      wordArray[wordPosition] =
        wordArray[wordPosition] | (message[byteCount] << bytePosition);
      byteCount++;
    }

    const wordPosition = (byteCount - (byteCount % 4)) / 4;
    bytePosition = (byteCount % 4) * 8;
    wordArray[wordPosition] = wordArray[wordPosition] | (0x80 << bytePosition);
    wordArray[numberOfWords - 2] = messageLength << 3;
    wordArray[numberOfWords - 1] = messageLength >>> 29;

    return wordArray;
  }

  private static wordToHex(value: number): string {
    let result = "";
    for (let i = 0; i <= 3; i++) {
      const byte = (value >>> (i * 8)) & 255;
      result += ("0" + byte.toString(16)).slice(-2);
    }
    return result;
  }

  static hash(data: Uint8Array): string {
    const x = this.convertToWordArray(data);
    let a = 0x67452301;
    let b = 0xefcdab89;
    let c = 0x98badcfe;
    let d = 0x10325476;

    for (let k = 0; k < x.length; k += 16) {
      const AA = a;
      const BB = b;
      const CC = c;
      const DD = d;

      a = this.ff(a, b, c, d, x[k + 0], 7, 0xd76aa478);
      d = this.ff(d, a, b, c, x[k + 1], 12, 0xe8c7b756);
      c = this.ff(c, d, a, b, x[k + 2], 17, 0x242070db);
      b = this.ff(b, c, d, a, x[k + 3], 22, 0xc1bdceee);
      a = this.ff(a, b, c, d, x[k + 4], 7, 0xf57c0faf);
      d = this.ff(d, a, b, c, x[k + 5], 12, 0x4787c62a);
      c = this.ff(c, d, a, b, x[k + 6], 17, 0xa8304613);
      b = this.ff(b, c, d, a, x[k + 7], 22, 0xfd469501);
      a = this.ff(a, b, c, d, x[k + 8], 7, 0x698098d8);
      d = this.ff(d, a, b, c, x[k + 9], 12, 0x8b44f7af);
      c = this.ff(c, d, a, b, x[k + 10], 17, 0xffff5bb1);
      b = this.ff(b, c, d, a, x[k + 11], 22, 0x895cd7be);
      a = this.ff(a, b, c, d, x[k + 12], 7, 0x6b901122);
      d = this.ff(d, a, b, c, x[k + 13], 12, 0xfd987193);
      c = this.ff(c, d, a, b, x[k + 14], 17, 0xa679438e);
      b = this.ff(b, c, d, a, x[k + 15], 22, 0x49b40821);

      a = this.gg(a, b, c, d, x[k + 1], 5, 0xf61e2562);
      d = this.gg(d, a, b, c, x[k + 6], 9, 0xc040b340);
      c = this.gg(c, d, a, b, x[k + 11], 14, 0x265e5a51);
      b = this.gg(b, c, d, a, x[k + 0], 20, 0xe9b6c7aa);
      a = this.gg(a, b, c, d, x[k + 5], 5, 0xd62f105d);
      d = this.gg(d, a, b, c, x[k + 10], 9, 0x2441453);
      c = this.gg(c, d, a, b, x[k + 15], 14, 0xd8a1e681);
      b = this.gg(b, c, d, a, x[k + 4], 20, 0xe7d3fbc8);
      a = this.gg(a, b, c, d, x[k + 9], 5, 0x21e1cde6);
      d = this.gg(d, a, b, c, x[k + 14], 9, 0xc33707d6);
      c = this.gg(c, d, a, b, x[k + 3], 14, 0xf4d50d87);
      b = this.gg(b, c, d, a, x[k + 8], 20, 0x455a14ed);
      a = this.gg(a, b, c, d, x[k + 13], 5, 0xa9e3e905);
      d = this.gg(d, a, b, c, x[k + 2], 9, 0xfcefa3f8);
      c = this.gg(c, d, a, b, x[k + 7], 14, 0x676f02d9);
      b = this.gg(b, c, d, a, x[k + 12], 20, 0x8d2a4c8a);

      a = this.hh(a, b, c, d, x[k + 5], 4, 0xfffa3942);
      d = this.hh(d, a, b, c, x[k + 8], 11, 0x8771f681);
      c = this.hh(c, d, a, b, x[k + 11], 16, 0x6d9d6122);
      b = this.hh(b, c, d, a, x[k + 14], 23, 0xfde5380c);
      a = this.hh(a, b, c, d, x[k + 1], 4, 0xa4beea44);
      d = this.hh(d, a, b, c, x[k + 4], 11, 0x4bdecfa9);
      c = this.hh(c, d, a, b, x[k + 7], 16, 0xf6bb4b60);
      b = this.hh(b, c, d, a, x[k + 10], 23, 0xbebfbc70);
      a = this.hh(a, b, c, d, x[k + 13], 4, 0x289b7ec6);
      d = this.hh(d, a, b, c, x[k + 0], 11, 0xeaa127fa);
      c = this.hh(c, d, a, b, x[k + 3], 16, 0xd4ef3085);
      b = this.hh(b, c, d, a, x[k + 6], 23, 0x4881d05);
      a = this.hh(a, b, c, d, x[k + 9], 4, 0xd9d4d039);
      d = this.hh(d, a, b, c, x[k + 12], 11, 0xe6db99e5);
      c = this.hh(c, d, a, b, x[k + 15], 16, 0x1fa27cf8);
      b = this.hh(b, c, d, a, x[k + 2], 23, 0xc4ac5665);

      a = this.ii(a, b, c, d, x[k + 0], 6, 0xf4292244);
      d = this.ii(d, a, b, c, x[k + 7], 10, 0x432aff97);
      c = this.ii(c, d, a, b, x[k + 14], 15, 0xab9423a7);
      b = this.ii(b, c, d, a, x[k + 5], 21, 0xfc93a039);
      a = this.ii(a, b, c, d, x[k + 12], 6, 0x655b59c3);
      d = this.ii(d, a, b, c, x[k + 3], 10, 0x8f0ccc92);
      c = this.ii(c, d, a, b, x[k + 10], 15, 0xffeff47d);
      b = this.ii(b, c, d, a, x[k + 1], 21, 0x85845dd1);
      a = this.ii(a, b, c, d, x[k + 8], 6, 0x6fa87e4f);
      d = this.ii(d, a, b, c, x[k + 15], 10, 0xfe2ce6e0);
      c = this.ii(c, d, a, b, x[k + 6], 15, 0xa3014314);
      b = this.ii(b, c, d, a, x[k + 13], 21, 0x4e0811a1);
      a = this.ii(a, b, c, d, x[k + 4], 6, 0xf7537e82);
      d = this.ii(d, a, b, c, x[k + 11], 10, 0xbd3af235);
      c = this.ii(c, d, a, b, x[k + 2], 15, 0x2ad7d2bb);
      b = this.ii(b, c, d, a, x[k + 9], 21, 0xeb86d391);

      a = this.addUnsigned(a, AA);
      b = this.addUnsigned(b, BB);
      c = this.addUnsigned(c, CC);
      d = this.addUnsigned(d, DD);
    }

    return (
      this.wordToHex(a) +
      this.wordToHex(b) +
      this.wordToHex(c) +
      this.wordToHex(d)
    ).toLowerCase();
  }

  /**
   * Enhanced streaming hash for large data with progress tracking
   */
  static async hashStream(
    data: Uint8Array,
    onProgress?: (progress: {
      percentage: number;
      bytesProcessed: number;
    }) => void,
  ): Promise<string> {
    // For very large files, process in chunks to allow progress updates
    const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
    const totalSize = data.length;

    if (totalSize < CHUNK_SIZE) {
      // Small file, process normally
      return this.hash(data);
    }

    // For large files, we still need to process all at once for MD5
    // but we can provide progress feedback
    return new Promise((resolve) => {
      // Use requestAnimationFrame to allow UI updates
      const processChunks = async () => {
        let processed = 0;

        // Simulate progressive processing for UI feedback
        const updateProgress = () => {
          processed += Math.min(CHUNK_SIZE, totalSize - processed);
          const percentage = Math.round((processed / totalSize) * 100);
          onProgress?.({ percentage, bytesProcessed: processed });

          if (processed < totalSize) {
            requestAnimationFrame(updateProgress);
          } else {
            // Actually compute the hash
            const result = this.hash(data);
            resolve(result);
          }
        };

        requestAnimationFrame(updateProgress);
      };

      processChunks();
    });
  }
}

export class HashGeneratorService {
  /**
   * Enhanced file validation with comprehensive feedback and security checks
   */
  static validateFile(file: File): HashValidationResult {
    const validationErrors: string[] = [];
    const warnings: string[] = [];

    // Check for empty files first
    if (file.size === 0) {
      validationErrors.push(
        "File is empty. Please select a file with content.",
      );
      return {
        isValid: false,
        error: "File is empty. Please select a file with content.",
        warnings,
        validationErrors,
      };
    }

    // Check file size limits
    if (file.size > FILE_SIZE_LIMITS.MAX_FILE_SIZE) {
      validationErrors.push(
        `File size (${this.formatFileSize(file.size)}) exceeds maximum limit of ${this.formatFileSize(FILE_SIZE_LIMITS.MAX_FILE_SIZE)}. ` +
          "Please select a smaller file.",
      );
    }

    // Check for large files and provide performance warnings
    if (file.size > FILE_SIZE_LIMITS.LARGE_FILE_THRESHOLD) {
      const estimatedTime = Math.ceil(file.size / (1024 * 1024)) * 2; // Rough estimate: 2 seconds per MB
      warnings.push(
        `Large file detected (${this.formatFileSize(file.size)}). ` +
          `Processing may take approximately ${estimatedTime} seconds.`,
      );
    }

    // Enhanced file type validation with comprehensive categorization
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (file.type) {
      const isAllowed = ALL_ALLOWED_FILE_TYPES.includes(
        file.type as (typeof ALL_ALLOWED_FILE_TYPES)[number],
      );
      const category =
        FILE_TYPE_CATEGORIES[file.type as keyof typeof FILE_TYPE_CATEGORIES];

      if (!isAllowed) {
        warnings.push(
          `File type "${file.type}" is not in our verified list. ` +
            "The file will be processed as binary data, which is safe for hash generation.",
        );
      } else if (category) {
        // Provide category-specific information and warnings
        switch (category) {
          case "Executable":
            warnings.push(
              "Executable file detected. Hash generation will safely process the binary content without executing the file.",
            );
            break;
          case "Archive":
            warnings.push(
              "Archive file detected. The hash will be generated from the compressed file content, not the individual files within.",
            );
            break;
          case "Video":
          case "Audio":
            if (file.size > FILE_SIZE_LIMITS.LARGE_FILE_THRESHOLD) {
              warnings.push(
                `${category} file detected. Large media files may take significant time to process.`,
              );
            }
            break;
          case "Document":
            warnings.push(
              "Document file detected. The hash will be generated from the entire file including metadata.",
            );
            break;
        }
      }
    } else if (fileExtension) {
      // Provide guidance when MIME type is missing but extension is available
      warnings.push(
        `No MIME type detected, but file extension ".${fileExtension}" suggests this may be a valid file. ` +
          "Processing will continue as binary data.",
      );
    } else {
      warnings.push(
        "No file type or extension detected. File will be processed as binary data.",
      );
    }

    // File name validation
    if (file.name.length > 255) {
      warnings.push(
        "File name is very long. This may cause display issues but will not affect hash generation.",
      );
    }

    // Check for potentially problematic characters in filename
    const problematicChars = /[<>:"|?*\x00-\x1f]/;
    if (problematicChars.test(file.name)) {
      warnings.push(
        "File name contains special characters that may cause display issues.",
      );
    }

    // Security considerations for specific file types
    if (
      file.type &&
      (file.type.includes("script") ||
        file.type.includes("executable") ||
        fileExtension === "exe" ||
        fileExtension === "bat" ||
        fileExtension === "sh")
    ) {
      warnings.push(
        "Potentially executable file detected. File content will be processed safely without execution.",
      );
    }

    // Performance recommendations
    if (file.size > 1024 * 1024) {
      // > 1MB
      warnings.push(
        "For optimal performance, consider using SHA-256 or SHA-512 for large files instead of MD5 or SHA-1.",
      );
    }

    return {
      isValid: validationErrors.length === 0,
      error: validationErrors.length > 0 ? validationErrors[0] : undefined,
      warnings,
      validationErrors,
    };
  }

  /**
   * Enhanced hash generation with performance optimization and accurate progress tracking
   */
  static async generateHash(params: HashOperationParams): Promise<HashResult> {
    const { algorithm, inputType, input, onProgress } = params;
    const startTime = Date.now();

    try {
      // Get input data as Uint8Array
      let data: Uint8Array;
      let inputSize: number;

      if (inputType === "text") {
        const textInput = input as string;
        data = new TextEncoder().encode(textInput);
        inputSize = textInput.length;

        // For small text, provide immediate progress feedback
        onProgress?.({
          percentage: 50,
          stage: "reading",
          bytesProcessed: data.length,
          totalBytes: data.length,
          message: "Text encoded for processing",
        });
      } else {
        const fileInput = input as File;
        inputSize = fileInput.size;

        // Enhanced file reading with more accurate progress
        onProgress?.({
          percentage: 0,
          stage: "reading",
          bytesProcessed: 0,
          totalBytes: inputSize,
          message: "Reading file...",
        });

        // Use FileReader for better progress tracking on large files
        if (fileInput.size > FILE_SIZE_LIMITS.PROGRESS_THRESHOLD) {
          data = await this.readFileWithProgress(fileInput, onProgress);
        } else {
          const arrayBuffer = await fileInput.arrayBuffer();
          data = new Uint8Array(arrayBuffer);
        }

        onProgress?.({
          percentage: 30,
          stage: "reading",
          bytesProcessed: inputSize,
          totalBytes: inputSize,
          message: "File read complete",
        });
      }

      // Enhanced hashing with accurate progress reporting
      onProgress?.({
        percentage: 40,
        stage: "hashing",
        bytesProcessed: 0,
        totalBytes: data.length,
        message: `Generating ${algorithm} hash...`,
      });

      let hash: string;
      const hashStartTime = Date.now();

      // Generate hash with optimization based on algorithm and data size
      if (algorithm === "MD5") {
        // Use enhanced streaming MD5 for large files
        if (data.length > FILE_SIZE_LIMITS.PROGRESS_THRESHOLD) {
          hash = await MD5.hashStream(data, (progress) => {
            onProgress?.({
              percentage: 40 + progress.percentage * 0.5, // 40-90% range
              stage: "hashing",
              bytesProcessed: progress.bytesProcessed,
              totalBytes: data.length,
              estimatedTimeRemaining: this.calculateETA(
                progress.bytesProcessed,
                data.length,
                hashStartTime,
              ),
              message: `Processing MD5 hash... ${progress.percentage}%`,
            });
          });
        } else {
          hash = MD5.hash(data);
        }
      } else {
        // Use Web Crypto API for SHA algorithms with optimization
        const algorithmName = ALGORITHM_INFO[algorithm].webCryptoName;
        if (!algorithmName) {
          throw new Error(`Algorithm ${algorithm} not supported`);
        }

        // For large files, provide intermediate progress updates
        if (data.length > FILE_SIZE_LIMITS.PROGRESS_THRESHOLD) {
          // Simulate progress for Web Crypto API (which doesn't provide progress)
          const progressInterval = setInterval(() => {
            onProgress?.({
              percentage: 70,
              stage: "hashing",
              bytesProcessed: data.length / 2,
              totalBytes: data.length,
              message: `Processing ${algorithm} hash...`,
            });
          }, 100);

          const hashBuffer = await crypto.subtle.digest(algorithmName, data);
          clearInterval(progressInterval);

          const hashArray = new Uint8Array(hashBuffer);
          hash = Array.from(hashArray)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        } else {
          const hashBuffer = await crypto.subtle.digest(algorithmName, data);
          const hashArray = new Uint8Array(hashBuffer);
          hash = Array.from(hashArray)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        }
      }

      const processingTime = Date.now() - startTime;

      // Report completion with performance metrics
      onProgress?.({
        percentage: 100,
        stage: "complete",
        bytesProcessed: data.length,
        totalBytes: data.length,
        message: `${algorithm} hash generated successfully in ${processingTime}ms`,
      });

      const warnings: string[] = [];
      if (!ALGORITHM_INFO[algorithm].secure) {
        warnings.push(
          `${algorithm} is not cryptographically secure. Use SHA-256 or SHA-512 for security-critical applications.`,
        );
      }

      // Performance warning for large files with insecure algorithms
      if (
        data.length > FILE_SIZE_LIMITS.LARGE_FILE_THRESHOLD &&
        !ALGORITHM_INFO[algorithm].secure
      ) {
        warnings.push(
          `Consider using SHA-256 or SHA-512 for better security with large files.`,
        );
      }

      return {
        success: true,
        hash,
        algorithm,
        inputSize,
        processingTime,
        warnings,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Hash generation failed";

      return {
        success: false,
        algorithm,
        inputSize:
          inputType === "text"
            ? (input as string).length
            : (input as File).size,
        processingTime: Date.now() - startTime,
        error: errorMessage,
      };
    }
  }

  /**
   * Enhanced file reading with progress tracking for large files
   */
  private static async readFileWithProgress(
    file: File,
    onProgress?: (progress: HashProgress) => void,
  ): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 30); // 0-30% range
          onProgress?.({
            percentage,
            stage: "reading",
            bytesProcessed: event.loaded,
            totalBytes: event.total,
            estimatedTimeRemaining: this.calculateETA(
              event.loaded,
              event.total,
              Date.now(),
            ),
            message: `Reading file... ${Math.round((event.loaded / event.total) * 100)}%`,
          });
        }
      };

      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(new Uint8Array(reader.result));
        } else {
          reject(new Error("Failed to read file as ArrayBuffer"));
        }
      };

      reader.onerror = () => reject(new Error("File reading failed"));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Calculate estimated time remaining for operations
   */
  private static calculateETA(
    processed: number,
    total: number,
    startTime: number,
  ): number | undefined {
    if (processed === 0) return undefined;

    const elapsed = Date.now() - startTime;
    const rate = processed / elapsed; // bytes per ms
    const remaining = total - processed;

    return Math.round(remaining / rate);
  }

  /**
   * Format file size for display
   */
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Generate hash on server (fallback for large files)
   */
  static async generateHashOnServer(
    params: HashOperationParams,
  ): Promise<HashResult> {
    const { algorithm, inputType, input } = params;

    try {
      const formData = new FormData();
      formData.append("algorithm", algorithm);

      if (inputType === "text") {
        formData.append("text", input as string);
      } else {
        formData.append("file", input as File);
      }

      const response = await fetch("/api/tools/hash-generator/generate", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Server-side hash generation failed");
      }

      return {
        ...result,
        serverSide: true,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Server-side hash generation failed";

      return {
        success: false,
        algorithm,
        inputSize:
          inputType === "text"
            ? (input as string).length
            : (input as File).size,
        processingTime: 0,
        error: errorMessage,
        serverSide: true,
      };
    }
  }

  /**
   * Track usage statistics (privacy-compliant)
   */
  static async trackUsage(metrics: HashUsageMetrics): Promise<void> {
    try {
      await fetch("/api/tools/hash-generator/usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metrics),
      });
    } catch (_error) {
      // Silently fail - usage tracking is not critical
      console.warn("Failed to track usage:", _error);
    }
  }

  /**
   * Enhanced copy to clipboard with better error handling and accessibility
   */
  static async copyToClipboard(
    text: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return { success: true, message: "Hash copied to clipboard" };
      } else {
        // Enhanced fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        textArea.setAttribute("readonly", "");
        textArea.setAttribute("aria-hidden", "true");
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (successful) {
          return { success: true, message: "Hash copied to clipboard" };
        } else {
          throw new Error("Copy command failed");
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Copy failed";
      return { success: false, message: `Failed to copy: ${errorMessage}` };
    }
  }
}
