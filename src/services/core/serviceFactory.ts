import { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ToolService } from "../tools/toolService";
import { AdminToolService } from "../admin/adminToolService";
import { AdminTagService } from "../admin/adminTagService";
import { RelationshipService } from "../admin/relationshipService";

/**
 * Simple service factory pattern to replace InversifyJS
 * Provides singleton instances of services with proper dependency injection
 */
export class ServiceFactory {
  private static instance: ServiceFactory;
  private services: Map<string, any> = new Map();
  private prisma: PrismaClient;
  private toolService: ToolService | null = null;
  private adminToolService: AdminToolService | null = null;
  private adminTagService: AdminTagService | null = null;
  private relationshipService: RelationshipService | null = null;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  /**
   * Register a service with the factory
   */
  register<T>(key: string, factory: () => T): void {
    this.services.set(key, factory);
  }

  /**
   * Get a service instance (singleton)
   */
  get<T>(key: string): T {
    const factory = this.services.get(key);
    if (!factory) {
      throw new Error(`Service ${key} not registered`);
    }

    // Check if we already have an instance
    const instanceKey = `${key}_instance`;
    if (!this.services.has(instanceKey)) {
      this.services.set(instanceKey, factory());
    }

    return this.services.get(instanceKey);
  }

  /**
   * Get Prisma client instance
   */
  getPrisma(): PrismaClient {
    return prisma;
  }

  /**
   * Clear all service instances (useful for testing)
   */
  clear(): void {
    this.services.clear();
  }

  public getToolService(): ToolService {
    if (!this.toolService) {
      this.toolService = new ToolService(this.prisma);
    }
    return this.toolService;
  }

  public getAdminToolService(): AdminToolService {
    if (!this.adminToolService) {
      this.adminToolService = new AdminToolService(this.prisma);
    }
    return this.adminToolService;
  }

  public getAdminTagService(): AdminTagService {
    if (!this.adminTagService) {
      this.adminTagService = new AdminTagService(this.prisma);
    }
    return this.adminTagService;
  }

  public getRelationshipService(): RelationshipService {
    if (!this.relationshipService) {
      this.relationshipService = new RelationshipService(this.prisma);
    }
    return this.relationshipService;
  }

  public async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

// Export singleton instance
export const serviceFactory = ServiceFactory.getInstance();
