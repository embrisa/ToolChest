import { BaseService, ServiceError } from "@/services/core/baseService";
import { PrismaClient } from "@prisma/client";

class DummyService extends BaseService {
  constructor() {
    super({} as PrismaClient);
  }
  public async getCachedPublic<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number,
  ) {
    return this.getCached(key, fn, ttl);
  }
  public invalidatePublic(pattern?: string) {
    this.invalidateCache(pattern);
  }
  public validatePublic(params: Record<string, unknown>) {
    this.validateRequired(params);
  }
}

describe("BaseService", () => {
  test("caches results from getCached", async () => {
    const service = new DummyService();
    const fetchFn = jest.fn().mockResolvedValue(42);
    const first = await service.getCachedPublic("k", fetchFn);
    const second = await service.getCachedPublic("k", fetchFn);
    expect(first).toBe(42);
    expect(second).toBe(42);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  test("invalidateCache clears entries by pattern", async () => {
    const service = new DummyService();
    const fetchA = jest.fn().mockResolvedValue("a");
    const fetchB = jest.fn().mockResolvedValue("b");
    await service.getCachedPublic("foo:a", fetchA);
    await service.getCachedPublic("foo:b", fetchB);
    service.invalidatePublic("foo");
    const fetchA2 = jest.fn().mockResolvedValue("a2");
    await service.getCachedPublic("foo:a", fetchA2);
    expect(fetchA2).toHaveBeenCalledTimes(1);
  });

  test("validateRequired throws ServiceError", () => {
    const service = new DummyService();
    expect(() => service.validatePublic({ name: "" })).toThrow(ServiceError);
  });
});
