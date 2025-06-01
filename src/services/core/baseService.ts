import { PrismaClient } from "@prisma/client";
import NodeCache from "node-cache";

/**
 * Base service class providing common functionality
 * All services should extend this class for consistent patterns
 */
export abstract class BaseService {
  protected prisma: PrismaClient;
  protected cache: NodeCache;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.cache = new NodeCache({
      stdTTL: 300, // 5 minutes default TTL
      checkperiod: 60, // Check for expired keys every minute
    });
  }

  /**
   * Get data from cache or execute function and cache result
   */
  protected async getCached<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = this.cache.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const result = await fetchFn();
    if (ttl !== undefined) {
      this.cache.set(key, result, ttl);
    } else {
      this.cache.set(key, result);
    }
    return result;
  }

  /**
   * Invalidate cache entries by pattern
   */
  protected invalidateCache(pattern?: string): void {
    if (pattern) {
      const keys = this.cache.keys();
      const matchingKeys = keys.filter((key) => key.includes(pattern));
      this.cache.del(matchingKeys);
    } else {
      this.cache.flushAll();
    }
  }

  /**
   * Handle service errors consistently
   */
  protected handleError(error: unknown, context: string): never {
    console.error(`Error in ${context}:`, error);

    if (error instanceof Error) {
      throw new ServiceError(error.message, context);
    }

    throw new ServiceError("Unknown error occurred", context);
  }

  /**
   * Validate required parameters
   */
  protected validateRequired(params: Record<string, any>): void {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") {
        throw new ServiceError(
          `Required parameter '${key}' is missing`,
          "validation",
        );
      }
    }
  }
}

/**
 * Custom service error class
 */
export class ServiceError extends Error {
  constructor(
    message: string,
    public context: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}
