import { ServiceFactory, serviceFactory } from "@/services/core/serviceFactory";
import { prisma } from "@/lib/prisma";

class MockService {}

describe("ServiceFactory", () => {
  beforeEach(() => {
    serviceFactory.clear();
  });

  test("register and retrieve singleton service", () => {
    const factory = ServiceFactory.getInstance();
    factory.register("mock", () => new MockService());
    const one = factory.get<MockService>("mock");
    const two = factory.get<MockService>("mock");
    expect(one).toBeInstanceOf(MockService);
    expect(one).toBe(two);
  });

  test("getPrisma returns shared instance", () => {
    const factory = ServiceFactory.getInstance();
    expect(factory.getPrisma()).toBe(prisma);
  });
});
